'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useRouter } from '@/i18n/routing'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    organizationName: z.string().min(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Registration failed')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{t('errors.nameTooShort')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">{t('organizationName')}</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="My Company"
                {...register('organizationName')}
                className={errors.organizationName ? 'border-red-500' : ''}
              />
              {errors.organizationName && (
                <p className="text-sm text-red-500">{t('errors.organizationTooShort')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{t('errors.invalidEmail')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{t('errors.passwordTooShort')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('password')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '...' : t('register')}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            {t('hasAccount')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
