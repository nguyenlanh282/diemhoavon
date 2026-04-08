'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Menu,
  LayoutDashboard,
  Calculator,
  DollarSign,
  TrendingDown,
  Package,
  PiggyBank,
  FolderOpen,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface MobileNavProps {
  locale: string
  user: {
    name?: string | null
    email?: string | null
    organizationName?: string
  }
}

export function MobileNav({ locale, user }: MobileNavProps) {
  const t = useTranslations('nav')
  const tCalc = useTranslations('calculation')
  const tAuth = useTranslations('auth')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/calculator', icon: Calculator, label: tCalc('title') },
    { href: '/costs/fixed', icon: DollarSign, label: t('fixedCosts') },
    { href: '/costs/variable', icon: TrendingDown, label: t('variableCosts') },
    { href: '/investments', icon: PiggyBank, label: t('investments') },
    { href: '/products', icon: Package, label: t('products') },
    { href: '/projects', icon: FolderOpen, label: locale === 'vi' ? 'Dự án' : 'Projects' },
  ]

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
  }

  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t lg:hidden">
      <div className="flex items-center justify-around p-2">
        {/* Quick nav items for mobile */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center p-2 text-xs',
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>{t('dashboard')}</span>
        </Link>
        <Link
          href="/calculator"
          className={cn(
            'flex flex-col items-center p-2 text-xs',
            isActive('/calculator') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Calculator className="h-5 w-5" />
          <span>{locale === 'vi' ? 'Tính toán' : 'Calculate'}</span>
        </Link>
        <Link
          href="/products"
          className={cn(
            'flex flex-col items-center p-2 text-xs',
            isActive('/products') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Package className="h-5 w-5" />
          <span>{t('products')}</span>
        </Link>
        <Link
          href="/projects"
          className={cn(
            'flex flex-col items-center p-2 text-xs',
            isActive('/projects') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <FolderOpen className="h-5 w-5" />
          <span>{locale === 'vi' ? 'Dự án' : 'Projects'}</span>
        </Link>

        {/* More menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex h-auto flex-col items-center p-2">
              <Menu className="h-5 w-5" />
              <span className="text-xs">{locale === 'vi' ? 'Thêm' : 'More'}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <span>Break-Even</span>
                </div>
              </SheetTitle>
            </SheetHeader>

            {/* Organization */}
            <div className="border-b py-4">
              <p className="text-muted-foreground text-sm">
                {locale === 'vi' ? 'Tổ chức' : 'Organization'}
              </p>
              <p className="truncate font-medium">{user.organizationName}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="space-y-4 border-t pt-4">
              <LanguageSwitcher />
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                {tAuth('logout')}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
