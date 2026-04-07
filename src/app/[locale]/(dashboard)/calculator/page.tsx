import { getLocale, getTranslations } from 'next-intl/server'
import { calculateCurrentBreakEven } from '@/lib/actions/calculations'
import { getProductsSummary } from '@/lib/actions/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/formatters'
import { BreakEvenResults } from '@/components/calculator/break-even-results'
import { SaveCalculationButton } from '@/components/calculator/save-calculation-button'
import { SendReportDialog } from '@/components/email/send-report-dialog'
import { DownloadPdfButton } from '@/components/calculator/download-pdf-button'
import { SalesForecast } from '@/components/calculator/sales-forecast'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default async function CalculatorPage() {
  const locale = await getLocale()
  const t = await getTranslations('calculation')
  const productsSummary = await getProductsSummary()

  // Check prerequisites - need at least one product
  if (productsSummary.totalProducts === 0) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>
        <Alert>
          <AlertDescription>{t('noData')}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check sales mix validation
  if (!productsSummary.salesMixValid) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Sales mix ratios must total 100%. Please adjust product sales mix.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/products">
            <Button>Manage Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { result } = await calculateCurrentBreakEven()

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <DownloadPdfButton locale={locale} />
          <SendReportDialog locale={locale} />
          <SaveCalculationButton />
        </div>
      </div>

      {/* Key Results */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('breakEvenUnits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.ceil(result.breakEvenUnits).toLocaleString()}
            </p>
            <p className="text-muted-foreground text-sm">
              {locale === 'vi' ? 'đơn hàng/tháng' : 'orders/month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('breakEvenRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(result.breakEvenRevenue, locale)}</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'vi' ? 'mỗi tháng' : 'per month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {locale === 'vi' ? 'Trung bình đơn hàng' : 'Avg Order Value'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(result.averageOrderValue, locale)}</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'vi' ? 'mỗi đơn' : 'per order'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalFixedCosts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(result.totalFixedCosts, locale)}</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'vi' ? 'mỗi tháng' : 'per month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('contributionMargin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(result.weightedContributionMargin, locale)}
            </p>
            <p className="text-muted-foreground text-sm">
              {locale === 'vi' ? 'mỗi đơn hàng' : 'per order'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <BreakEvenResults result={result} locale={locale} />

      {/* Sales Forecast */}
      <SalesForecast
        breakEvenData={{
          totalFixedCosts: result.totalFixedCosts,
          weightedContributionMargin: result.weightedContributionMargin,
          averageOrderValue: result.averageOrderValue,
          totalVariableCostRate: result.totalVariableCostRate,
          totalVariableCostPerOrder: result.totalVariableCostPerOrder,
        }}
        locale={locale}
      />
    </div>
  )
}
