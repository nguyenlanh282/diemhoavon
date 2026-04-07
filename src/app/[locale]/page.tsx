import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/language-switcher'

export default async function Home() {
  const t = await getTranslations('common')
  const tAuth = await getTranslations('auth')
  const tCalc = await getTranslations('calculation')

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('appName')}</CardTitle>
          <CardDescription>{tCalc('title')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-center">{tCalc('noData')}</p>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <Button>{tAuth('login')}</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">{tAuth('register')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
