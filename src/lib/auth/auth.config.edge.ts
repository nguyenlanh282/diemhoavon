import type { NextAuthConfig } from 'next-auth'

// This is the edge-compatible config for middleware
// It does NOT include providers that use database
export const authConfigEdge: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isPublicPath = ['/', '/login', '/register'].includes(nextUrl.pathname)

      if (isPublicPath) {
        return true
      }

      if (isOnAdmin) {
        if (!isLoggedIn) return false
        // Check admin role from JWT
        return auth?.user?.role === 'ADMIN'
      }

      if (isOnDashboard) {
        return isLoggedIn
      }

      // For all other protected routes
      if (!isLoggedIn) {
        return false
      }

      return true
    },
  },
  providers: [], // Providers are added in the main config
}
