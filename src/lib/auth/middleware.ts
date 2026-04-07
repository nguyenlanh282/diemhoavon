import NextAuth from 'next-auth'
import { authConfigEdge } from './auth.config.edge'

// This is used in middleware only - no DB access
export const { auth: authMiddleware } = NextAuth(authConfigEdge)
