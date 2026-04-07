import { getLocale, getTranslations } from 'next-intl/server'
import { getVariableCosts, getVariableCostsSummary } from '@/lib/actions/variable-costs'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { VariableCostCard } from '@/components/costs/variable-cost-card'

export default async function VariableCostsPage() {
  const locale = await getLocale()
  const t = await getTranslations('costs.variable')
  const tCommon = await getTranslations('common')

  const [costs, summary] = await Promise.all([getVariableCosts(), getVariableCostsSummary()])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/costs/variable/new">
          <Button>{t('addNew')}</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalPercentageRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalPercentageRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('fixedPerOrder')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.fixedPerOrder, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('costItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost List */}
      <div className="grid gap-4">
        {costs.map((cost) => (
          <VariableCostCard key={cost.id} cost={cost} locale={locale} />
        ))}

        {costs.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center">
              {locale === 'vi'
                ? `Chưa có biến phí nào. Nhấn "${t('addNew')}" để bắt đầu.`
                : `No variable costs added yet. Click "${t('addNew')}" to get started.`}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
