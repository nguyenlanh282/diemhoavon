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
