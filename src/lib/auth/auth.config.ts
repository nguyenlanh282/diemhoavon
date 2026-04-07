import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { Role } from '@/generated/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { organization: true },
        })

        if (!user || !user.password) return null

        const valid = await compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // For OAuth providers, we need to fetch the user from database
      // because the user object from OAuth doesn't have our custom fields
      if (account?.provider === 'google' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { organization: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
          token.organizationName = dbUser.organization.name
        }
      } else if (user) {
        // For credentials provider, user already has the custom fields
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Handle Google OAuth: create user if not exists
      if (account?.provider === 'google' && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        })
        if (!existing) {
          // Create new org and user for OAuth users
          const org = await prisma.organization.create({
            data: { name: `${user.name || 'User'}'s Organization` },
          })
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              organizationId: org.id,
              emailVerified: new Date(),
            },
          })
        }
      }
      return true
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
