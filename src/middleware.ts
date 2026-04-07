import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing)

export default intlMiddleware

export const config = {
  // Match all pathnames except for
  // - api routes
  // - static files
  // - Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
