import { getLocale, getTranslations } from 'next-intl/server'
import { getInvestments, getInvestmentsSummary } from '@/lib/actions/investments'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { InvestmentCard } from '@/components/investments/investment-card'

export default async function InvestmentsPage() {
  const locale = await getLocale()
  const t = await getTranslations('investments')

  const [investments, summary] = await Promise.all([getInvestments(), getInvestmentsSummary()])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/investments/new">
          <Button>{t('addNew')}</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('monthlyAmortization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalMonthlyAmortization, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalInvestment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalOriginalValue, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('remainingValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalRemainingValue, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('investmentCount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment List */}
      <div className="grid gap-4">
        {investments.map((inv) => (
          <InvestmentCard key={inv.id} investment={inv} locale={locale} />
        ))}

        {investments.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center">
              {locale === 'vi'
                ? `Chưa có khoản đầu tư nào. Nhấn "${t('addNew')}" để bắt đầu.`
                : `No investments added yet. Click "${t('addNew')}" to get started.`}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
