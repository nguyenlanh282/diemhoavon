# Phase 04: i18n Setup

## Context Links

- [Main Plan](./plan.md)
- [Previous: Authentication](./phase-03-authentication.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | High       |
| Status         | Pending    |
| Estimated Time | 1 day      |

---

## Key Insights

- next-intl supports React Server Components natively
- Locale stored in URL path (/vi/dashboard, /en/dashboard)
- Messages organized by namespace (common, auth, costs, etc.)
- Vietnamese currency/number formatting differs from English
- Date formats: VN uses dd/MM/yyyy, EN uses MM/dd/yyyy

---

## Requirements

1. Support Vietnamese (vi) and English (en) languages
2. Locale-based URL routing (/vi/..., /en/...)
3. Persistent locale preference
4. Currency formatting (VND, USD)
5. Date/number formatting by locale
6. Translation files for all UI text

---

## Architecture

```
src/
  app/
    [locale]/
      layout.tsx         # Locale-aware layout
      page.tsx
  i18n/
    request.ts           # Server-side i18n config
    routing.ts           # Locale routing config
messages/
  en.json                # English translations
  vi.json                # Vietnamese translations
middleware.ts            # Updated with locale detection
```

---

## Related Code Files

| File                  | Purpose                 |
| --------------------- | ----------------------- |
| `src/i18n/request.ts` | Server request config   |
| `src/i18n/routing.ts` | Routing configuration   |
| `messages/en.json`    | English translations    |
| `messages/vi.json`    | Vietnamese translations |

---

## Implementation Steps

### Step 1: Install next-intl

```bash
npm install next-intl
```

### Step 2: Configure Routing

Create `src/i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'always',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

### Step 3: Configure Request Handler

Create `src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

### Step 4: Update Next.js Config

Update `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // ... other config
}

export default withNextIntl(nextConfig)
```

### Step 5: Update Middleware

Update `src/middleware.ts`:

```typescript
import createMiddleware from 'next-intl/middleware'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const publicPaths = ['/login', '/register', '/api']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle locale routing first
  const response = intlMiddleware(request)

  // Extract path without locale
  const pathWithoutLocale = pathname.replace(/^\/(vi|en)/, '') || '/'

  // Allow public paths
  if (publicPaths.some((path) => pathWithoutLocale.startsWith(path))) {
    return response
  }

  // Check authentication
  const session = await auth()

  if (!session) {
    const locale = pathname.split('/')[1] || 'vi'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

### Step 6: Create Translation Files

Create `messages/en.json`:

```json
{
  "common": {
    "appName": "Break-Even Calculator",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "confirm": "Confirm",
    "currency": "VND"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "organization": "Organization",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "loginWithGoogle": "Continue with Google",
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailExists": "Email already registered"
    }
  },
  "nav": {
    "dashboard": "Dashboard",
    "fixedCosts": "Fixed Costs",
    "variableCosts": "Variable Costs",
    "investments": "Investments",
    "products": "Products",
    "reports": "Reports",
    "settings": "Settings"
  },
  "costs": {
    "fixed": {
      "title": "Fixed Costs",
      "rent": "Rent",
      "electricity": "Electricity",
      "water": "Water",
      "internet": "Internet",
      "salary": "Fixed Salaries",
      "loanInterest": "Loan Interest",
      "outsourced": "Outsourced Services",
      "accounting": "Accounting",
      "tax": "Tax Services",
      "marketingAgency": "Marketing Agency",
      "brandAdvertising": "Brand Advertising",
      "other": "Other"
    },
    "variable": {
      "title": "Variable Costs",
      "cogs": "Cost of Goods Sold",
      "vat": "VAT",
      "commission": "Sales Commission",
      "advertising": "Advertising per Lead",
      "other": "Other"
    }
  },
  "calculation": {
    "title": "Break-Even Analysis",
    "totalFixedCosts": "Total Fixed Costs",
    "totalVariableCosts": "Total Variable Costs",
    "averageOrderValue": "Average Order Value",
    "contributionMargin": "Contribution Margin",
    "breakEvenUnits": "Break-Even (Units)",
    "breakEvenRevenue": "Break-Even (Revenue)",
    "calculate": "Calculate",
    "saveResult": "Save Result"
  }
}
```

Create `messages/vi.json`:

```json
{
  "common": {
    "appName": "Tính Điểm Hòa Vốn",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "add": "Thêm",
    "loading": "Đang tải...",
    "error": "Có lỗi xảy ra",
    "success": "Thành công",
    "confirm": "Xác nhận",
    "currency": "VND"
  },
  "auth": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "logout": "Đăng xuất",
    "email": "Email",
    "password": "Mật khẩu",
    "name": "Họ tên",
    "organization": "Tổ chức",
    "forgotPassword": "Quên mật khẩu?",
    "noAccount": "Chưa có tài khoản?",
    "hasAccount": "Đã có tài khoản?",
    "loginWithGoogle": "Đăng nhập với Google",
    "errors": {
      "invalidCredentials": "Email hoặc mật khẩu không đúng",
      "emailExists": "Email đã được đăng ký"
    }
  },
  "nav": {
    "dashboard": "Tổng quan",
    "fixedCosts": "Định phí",
    "variableCosts": "Biến phí",
    "investments": "Đầu tư",
    "products": "Sản phẩm",
    "reports": "Báo cáo",
    "settings": "Cài đặt"
  },
  "costs": {
    "fixed": {
      "title": "Định phí",
      "rent": "Thuê mặt bằng",
      "electricity": "Điện",
      "water": "Nước",
      "internet": "Internet",
      "salary": "Lương cố định",
      "loanInterest": "Lãi vay",
      "outsourced": "Dịch vụ thuê ngoài",
      "accounting": "Kế toán",
      "tax": "Thuế",
      "marketingAgency": "Agency Marketing",
      "brandAdvertising": "Quảng cáo thương hiệu",
      "other": "Khác"
    },
    "variable": {
      "title": "Biến phí",
      "cogs": "Giá vốn hàng bán",
      "vat": "VAT",
      "commission": "Hoa hồng bán hàng",
      "advertising": "Chi phí quảng cáo/lead",
      "other": "Khác"
    }
  },
  "calculation": {
    "title": "Phân tích Điểm Hòa Vốn",
    "totalFixedCosts": "Tổng định phí",
    "totalVariableCosts": "Tổng biến phí",
    "averageOrderValue": "Giá trị đơn hàng trung bình",
    "contributionMargin": "Lợi nhuận gộp",
    "breakEvenUnits": "Điểm hòa vốn (Đơn hàng)",
    "breakEvenRevenue": "Điểm hòa vốn (Doanh thu)",
    "calculate": "Tính toán",
    "saveResult": "Lưu kết quả"
  }
}
```

### Step 7: Create Locale Layout

Update `src/app/[locale]/layout.tsx`:

```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'common' })
  return {
    title: t('appName'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Step 8: Create Currency Formatter Utility

Create `src/lib/formatters.ts`:

```typescript
import { useLocale } from 'next-intl'

export function formatCurrency(amount: number, locale: string = 'vi'): string {
  if (locale === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatNumber(num: number, locale: string = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num)
}

export function formatDate(date: Date, locale: string = 'vi'): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
```

### Step 9: Create Language Switcher

Create `src/components/language-switcher.tsx`:

```typescript
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: 'vi' | 'en') => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={locale === 'vi' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('vi')}
      >
        VI
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
      >
        EN
      </Button>
    </div>
  )
}
```

---

## Todo List

- [ ] Install next-intl
- [ ] Configure routing and request handler
- [ ] Update Next.js config
- [ ] Update middleware for locale + auth
- [ ] Create English translation file
- [ ] Create Vietnamese translation file
- [ ] Update locale layout
- [ ] Create currency/date formatters
- [ ] Create language switcher component
- [ ] Test locale switching

---

## Success Criteria

1. /vi/\* routes show Vietnamese text
2. /en/\* routes show English text
3. Language switcher changes locale
4. Currency formats correctly (VND vs USD)
5. Date formats correctly (dd/MM/yyyy vs MM/dd/yyyy)
6. Default locale is Vietnamese

---

## Risk Assessment

| Risk                   | Likelihood | Impact | Mitigation               |
| ---------------------- | ---------- | ------ | ------------------------ |
| Missing translations   | Medium     | Low    | Use fallback to key name |
| Vietnamese font issues | Low        | Medium | Use system fonts         |
| SEO locale conflicts   | Low        | Low    | Use hreflang tags        |

---

## Security Considerations

- Locale from URL only (not user-controlled headers)
- Sanitize any user input in translations
- No sensitive data in client-side messages

---

## Next Steps

After completion, proceed to [Phase 05: Fixed Costs Module](./phase-05-fixed-costs-module.md)
