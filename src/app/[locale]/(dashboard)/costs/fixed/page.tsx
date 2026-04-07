import { getLocale, getTranslations } from 'next-intl/server'
import { getFixedCosts, getFixedCostsSummary } from '@/lib/actions/fixed-costs'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { FixedCostCard } from '@/components/costs/fixed-cost-card'

export default async function FixedCostsPage() {
  const locale = await getLocale()
  const t = await getTranslations('costs.fixed')
  const tCommon = await getTranslations('common')

  const [costs, summary] = await Promise.all([getFixedCosts(), getFixedCostsSummary()])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/costs/fixed/new">
          <Button>{t('addNew')}</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {tCommon('total')} {tCommon('perMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.monthlyTotal, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {tCommon('total')} /year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.yearlyTotal, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Cost Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost List */}
      <div className="grid gap-4">
        {costs.map((cost) => (
          <FixedCostCard key={cost.id} cost={cost} locale={locale} />
        ))}

        {costs.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center">
              No fixed costs added yet. Click &quot;{t('addNew')}&quot; to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
