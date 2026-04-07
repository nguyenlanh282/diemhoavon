'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProjectSelector } from '@/components/projects/project-selector'
import {
  LayoutDashboard,
  Calculator,
  DollarSign,
  TrendingDown,
  Package,
  PiggyBank,
  FolderKanban,
  LogOut,
  Users,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Project {
  id: string
  name: string
  isDefault: boolean
  _count?: {
    products: number
    calculations: number
  }
}

interface SidebarProps {
  locale: string
  user: {
    name?: string | null
    email?: string | null
    organizationName?: string
  }
  projects?: Project[]
  currentProjectId?: string | null
}

export function Sidebar({ locale, user, projects, currentProjectId }: SidebarProps) {
  const t = useTranslations('nav')
  const tCalc = useTranslations('calculation')
  const tAuth = useTranslations('auth')
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/calculator', icon: Calculator, label: tCalc('title') },
    { href: '/costs/fixed', icon: DollarSign, label: t('fixedCosts') },
    { href: '/costs/variable', icon: TrendingDown, label: t('variableCosts') },
    { href: '/investments', icon: PiggyBank, label: t('investments') },
    { href: '/products', icon: Package, label: t('products') },
    { href: '/projects', icon: FolderKanban, label: locale === 'vi' ? 'Dự án' : 'Projects' },
    { href: '/users', icon: Users, label: locale === 'vi' ? 'Người dùng' : 'Users' },
  ]

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          <span className="font-bold">Break-Even</span>
        </Link>
      </div>

      {/* Project Selector */}
      {projects && projects.length > 0 && (
        <div className="border-b px-4 py-3">
          <ProjectSelector projects={projects} currentProjectId={currentProjectId || null} />
        </div>
      )}

      {/* Organization */}
      <div className="border-b px-6 py-4">
        <p className="text-muted-foreground text-sm">
          {locale === 'vi' ? 'Tổ chức' : 'Organization'}
        </p>
        <p className="truncate font-medium">{user.organizationName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
      <div className="space-y-4 border-t p-4">
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          {tAuth('logout')}
        </button>
      </div>
    </div>
  )
}
