'use client'

import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  locale: string
}

export function Header({ user, locale }: HeaderProps) {
  const tAuth = useTranslations('auth')

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <header className="bg-background sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:px-8">
      <div className="lg:hidden">{/* Mobile menu trigger handled by MobileNav */}</div>

      <div className="flex-1" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:block">{user.name || user.email}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
            {tAuth('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
