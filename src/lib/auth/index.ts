import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Support both AUTH_SECRET (NextAuth v5) and NEXTAUTH_SECRET (legacy name)
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})

// Export a lightweight auth check for middleware (without DB)
export { authConfig }
