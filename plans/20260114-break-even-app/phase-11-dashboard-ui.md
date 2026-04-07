# Phase 11: Dashboard UI

## Context Links

- [Main Plan](./plan.md)
- [Previous: Email Reports](./phase-10-email-reports.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | High       |
| Status         | Pending    |
| Estimated Time | 2-3 days   |

---

## Key Insights

- Dashboard is the landing page after login
- Show key metrics at a glance
- Quick access to all modules
- Charts for visual data representation
- Responsive design for mobile access

---

## Requirements

1. Overview cards with key metrics
2. Break-even summary visualization
3. Quick navigation to all modules
4. Recent calculation history
5. Cost breakdown charts
6. Responsive layout (mobile-first)
7. User profile and settings access

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        layout.tsx            # Dashboard layout with nav
        page.tsx              # Dashboard home (redirect)
        dashboard/
          page.tsx            # Main dashboard
  components/
    layout/
      sidebar.tsx             # Navigation sidebar
      header.tsx              # Top header
      mobile-nav.tsx          # Mobile navigation
    dashboard/
      metrics-cards.tsx       # Key metrics display
      cost-chart.tsx          # Cost breakdown chart
      history-list.tsx        # Recent calculations
```

---

## Related Code Files

| File                                              | Purpose          |
| ------------------------------------------------- | ---------------- |
| `src/app/[locale]/(dashboard)/layout.tsx`         | Dashboard layout |
| `src/components/layout/sidebar.tsx`               | Navigation       |
| `src/app/[locale]/(dashboard)/dashboard/page.tsx` | Main dashboard   |

---

## Implementation Steps

### Step 1: Install Chart Library

```bash
npm install recharts
```

### Step 2: Create Dashboard Layout

Create `src/app/[locale]/(dashboard)/layout.tsx`:

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const session = await auth()

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
        <Sidebar locale={locale} user={session.user} />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={session.user} locale={locale} />

        {/* Mobile Navigation */}
        <MobileNav locale={locale} user={session.user} />

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
```

### Step 3: Create Sidebar Component

Create `src/components/layout/sidebar.tsx`:

```typescript
'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
  LayoutDashboard,
  Calculator,
  DollarSign,
  TrendingDown,
  Package,
  PiggyBank,
  History,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  locale: string
  user: {
    name?: string | null
    email?: string | null
    organizationName?: string
  }
}

export function Sidebar({ locale, user }: SidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/calculator', icon: Calculator, label: 'Calculator' },
    { href: '/costs/fixed', icon: DollarSign, label: t('fixedCosts') },
    { href: '/costs/variable', icon: TrendingDown, label: t('variableCosts') },
    { href: '/investments', icon: PiggyBank, label: t('investments') },
    { href: '/products', icon: Package, label: t('products') },
    { href: '/history', icon: History, label: 'History' },
    { href: '/settings', icon: Settings, label: t('settings') },
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

      {/* Organization */}
      <div className="border-b px-6 py-4">
        <p className="text-sm text-muted-foreground">Organization</p>
        <p className="font-medium truncate">{user.organizationName}</p>
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
      <div className="border-t p-4 space-y-4">
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
```

### Step 4: Create Header Component

Create `src/components/layout/header.tsx`:

```typescript
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
import { Link } from '@/i18n/routing'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  locale: string
}

export function Header({ user, locale }: HeaderProps) {
  const t = useTranslations('nav')

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-8">
      <div className="lg:hidden">
        {/* Mobile menu trigger handled by MobileNav */}
      </div>

      <div className="flex-1" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:block">
              {user.name || user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

### Step 5: Create Dashboard Page

Create `src/app/[locale]/(dashboard)/dashboard/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { calculateCurrentBreakEven } from '@/lib/actions/calculations'
import { getFixedCostsSummary } from '@/lib/actions/fixed-costs'
import { getVariableCostsSummary } from '@/lib/actions/variable-costs'
import { getInvestmentsSummary } from '@/lib/actions/investments'
import { getProductsSummary } from '@/lib/actions/products'
import { getCalculationHistory } from '@/lib/actions/calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { CostChart } from '@/components/dashboard/cost-chart'
import { HistoryList } from '@/components/dashboard/history-list'
import { ArrowRight, Calculator } from 'lucide-react'

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('nav')
  const session = await auth()

  // Fetch all summary data
  const [
    fixedCostsSummary,
    variableCostsSummary,
    investmentsSummary,
    productsSummary,
    recentHistory,
  ] = await Promise.all([
    getFixedCostsSummary(),
    getVariableCostsSummary(),
    getInvestmentsSummary(),
    getProductsSummary(),
    getCalculationHistory(5),
  ])

  // Calculate break-even if possible
  let breakEvenResult = null
  if (productsSummary.totalProducts > 0 && productsSummary.salesMixValid) {
    const { result } = await calculateCurrentBreakEven()
    breakEvenResult = result
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}
          </p>
        </div>
        <Link href="/calculator">
          <Button>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <MetricsCards
        breakEvenResult={breakEvenResult}
        fixedCosts={fixedCostsSummary.monthlyTotal}
        investmentAmortization={investmentsSummary.totalMonthlyAmortization}
        locale={locale}
      />

      {/* Charts and Data */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cost Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart
              fixedCosts={fixedCostsSummary.monthlyTotal}
              variableCosts={variableCostsSummary.fixedPerOrder}
              investmentCosts={investmentsSummary.totalMonthlyAmortization}
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Products</span>
              <span className="font-bold">{productsSummary.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fixed Cost Items</span>
              <span className="font-bold">{fixedCostsSummary.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Investments</span>
              <span className="font-bold">{investmentsSummary.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Variable Cost Rate</span>
              <span className="font-bold">
                {variableCostsSummary.totalPercentageRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average Order Value</span>
              <span className="font-bold">
                {formatCurrency(productsSummary.averageOrderValue, locale)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Calculations</CardTitle>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <HistoryList history={recentHistory} locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 6: Create Metrics Cards Component

Create `src/components/dashboard/metrics-cards.tsx`:

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import type { BreakEvenResult } from '@/lib/calculations/break-even'
import { TrendingUp, DollarSign, Package, PiggyBank } from 'lucide-react'

interface MetricsCardsProps {
  breakEvenResult: BreakEvenResult | null
  fixedCosts: number
  investmentAmortization: number
  locale: string
}

export function MetricsCards({
  breakEvenResult,
  fixedCosts,
  investmentAmortization,
  locale,
}: MetricsCardsProps) {
  const metrics = [
    {
      title: 'Break-Even Point',
      value: breakEvenResult
        ? Math.ceil(breakEvenResult.breakEvenUnits).toLocaleString()
        : '-',
      subtitle: 'orders/month',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Break-Even Revenue',
      value: breakEvenResult
        ? formatCurrency(breakEvenResult.breakEvenRevenue, locale)
        : '-',
      subtitle: 'per month',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      title: 'Monthly Fixed Costs',
      value: formatCurrency(fixedCosts + investmentAmortization, locale),
      subtitle: 'including amortization',
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: 'Contribution Margin',
      value: breakEvenResult
        ? formatCurrency(breakEvenResult.weightedContributionMargin, locale)
        : '-',
      subtitle: 'per order',
      icon: PiggyBank,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Step 7: Create Cost Chart Component

Create `src/components/dashboard/cost-chart.tsx`:

```typescript
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CostChartProps {
  fixedCosts: number
  variableCosts: number
  investmentCosts: number
}

export function CostChart({ fixedCosts, variableCosts, investmentCosts }: CostChartProps) {
  const data = [
    { name: 'Fixed Costs', value: fixedCosts, color: '#3b82f6' },
    { name: 'Variable Costs', value: variableCosts, color: '#f97316' },
    { name: 'Investment', value: investmentCosts, color: '#8b5cf6' },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No cost data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

### Step 8: Create History List Component

Create `src/components/dashboard/history-list.tsx`:

```typescript
'use client'

import { formatCurrency, formatDate } from '@/lib/formatters'
import { CalculationHistory } from '@prisma/client'

interface HistoryListProps {
  history: (CalculationHistory & { user: { name: string | null; email: string } })[]
  locale: string
}

export function HistoryList({ history, locale }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No calculations saved yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((calc) => (
        <div
          key={calc.id}
          className="flex items-center justify-between border-b pb-4 last:border-0"
        >
          <div>
            <p className="font-medium">{calc.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(new Date(calc.createdAt), locale)} by{' '}
              {calc.user.name || calc.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              {Math.ceil(Number(calc.breakEvenUnits)).toLocaleString()} orders
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(Number(calc.breakEvenRevenue), locale)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Todo List

- [ ] Install Recharts for charts
- [ ] Create dashboard layout with sidebar
- [ ] Build sidebar navigation component
- [ ] Build header with user menu
- [ ] Create mobile navigation
- [ ] Build dashboard page with metrics
- [ ] Create metrics cards component
- [ ] Create cost breakdown chart
- [ ] Create history list component
- [ ] Test responsive design

---

## Success Criteria

1. Dashboard displays all key metrics
2. Navigation works on all pages
3. Charts render correctly
4. Mobile responsive design works
5. User menu and logout function
6. Language switcher accessible

---

## Risk Assessment

| Risk                      | Likelihood | Impact | Mitigation           |
| ------------------------- | ---------- | ------ | -------------------- |
| Chart library bundle size | Medium     | Low    | Use dynamic imports  |
| Mobile navigation UX      | Medium     | Medium | Test on real devices |
| Data loading performance  | Low        | Medium | Use React Suspense   |

---

## Security Considerations

- Session verified on layout load
- No sensitive data in URL
- Proper route protection
- User context from server session

---

## Next Steps

After completion, proceed to [Phase 12: Testing](./phase-12-testing.md)
