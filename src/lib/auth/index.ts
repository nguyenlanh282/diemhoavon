import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
})

// Export a lightweight auth check for middleware (without DB)
export { authConfig }
