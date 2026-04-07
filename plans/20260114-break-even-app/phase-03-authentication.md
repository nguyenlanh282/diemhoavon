# Phase 03: Authentication

## Context Links

- [Main Plan](./plan.md)
- [Previous: Database Schema](./phase-02-database-schema.md)
- [Research: Authentication](../../docs/research-authentication.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | Critical   |
| Status         | Pending    |
| Estimated Time | 2-3 days   |

---

## Key Insights

- NextAuth v5 (Auth.js) uses Edge Runtime compatible approach
- Credentials provider requires manual password hashing (bcrypt)
- Google OAuth needs GCP Console setup
- RBAC implemented via middleware + session extension
- Multi-tenant: users belong to organizations

---

## Requirements

1. Email/password authentication with validation
2. Google OAuth integration
3. Role-based access control (Admin, Manager, User)
4. Session management with organization context
5. Protected routes middleware
6. Registration with organization creation/join

---

## Architecture

```
src/
  lib/
    auth/
      index.ts           # NextAuth config export
      auth.config.ts     # Auth configuration
      providers.ts       # Credentials + Google providers
  app/
    api/
      auth/
        [...nextauth]/
          route.ts       # Auth API route
    [locale]/
      (auth)/
        login/
          page.tsx       # Login page
        register/
          page.tsx       # Registration page
  middleware.ts          # Route protection
```

---

## Related Code Files

| File                                     | Purpose                     |
| ---------------------------------------- | --------------------------- |
| `src/lib/auth/index.ts`                  | Main auth export            |
| `src/lib/auth/auth.config.ts`            | NextAuth configuration      |
| `src/middleware.ts`                      | Route protection middleware |
| `src/app/[locale]/(auth)/login/page.tsx` | Login UI                    |

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs
```

### Step 2: Configure NextAuth

Create `src/lib/auth/auth.config.ts`:

```typescript
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Handle Google OAuth: create user if not exists
      if (account?.provider === 'google') {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        if (!existing) {
          // Create new org and user for OAuth users
          const org = await prisma.organization.create({
            data: { name: `${user.name}'s Organization` },
          })
          await prisma.user.create({
            data: {
              email: user.email!,
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
```

Create `src/lib/auth/index.ts`:

```typescript
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
})
```

### Step 3: Create API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

### Step 4: Extend TypeScript Types

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession, DefaultUser } from 'next-auth'
import { Role } from '@prisma/client'

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
```

### Step 5: Create Middleware

Create `src/middleware.ts`:

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register', '/api/auth']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const session = await auth()

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

### Step 6: Create Login Page

Create `src/app/[locale]/(auth)/login/page.tsx`:

```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl: '/dashboard',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 7: Create Registration Page

Create `src/app/[locale]/(auth)/register/page.tsx`:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

const registerSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name required'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/login?registered=true')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Name" {...register('name')} />
            <Input placeholder="Organization Name" {...register('organizationName')} />
            <Input type="email" placeholder="Email" {...register('email')} />
            <Input type="password" placeholder="Password" {...register('password')} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 8: Create Registration API

Create `src/app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create organization and user
    const org = await prisma.organization.create({
      data: { name: data.organizationName },
    })

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'ADMIN', // First user is admin
        organizationId: org.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
```

---

## Todo List

- [ ] Install NextAuth v5 and bcryptjs
- [ ] Configure NextAuth with Credentials and Google providers
- [ ] Create auth API route
- [ ] Extend TypeScript types for session
- [ ] Create middleware for route protection
- [ ] Build login page with form validation
- [ ] Build registration page
- [ ] Create registration API endpoint
- [ ] Set up Google OAuth in GCP Console
- [ ] Test complete auth flow

---

## Success Criteria

1. Users can register with email/password
2. Users can login with credentials
3. Google OAuth flow works correctly
4. Session contains user role and organization
5. Protected routes redirect to login
6. Admin-only routes blocked for non-admins

---

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation                         |
| ----------------------------- | ---------- | ------ | ---------------------------------- |
| Google OAuth misconfiguration | Medium     | Medium | Follow GCP docs exactly            |
| Password hash timing attacks  | Low        | High   | Use constant-time comparison       |
| Session hijacking             | Low        | High   | Use httpOnly cookies, short expiry |

---

## Security Considerations

- Passwords hashed with bcrypt (cost factor 10+)
- JWT stored in httpOnly cookies
- CSRF protection via SameSite cookies
- Rate limiting on login endpoint (add in production)
- Account lockout after failed attempts (add later)

---

## Next Steps

After completion, proceed to [Phase 04: i18n Setup](./phase-04-i18n-setup.md)
