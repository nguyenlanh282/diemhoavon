import { DefaultSession, DefaultUser } from 'next-auth'
import { Role } from '@/generated/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      organizationId: string
      organizationName: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: Role
    organizationId: string
    organizationName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    organizationId: string
    organizationName: string
  }
}
