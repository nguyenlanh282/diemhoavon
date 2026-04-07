import { getLocale, getTranslations } from 'next-intl/server'
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

export default async function DashboardPage() {
  const locale = await getLocale()
  const t = await getTranslations('dashboard')
  const session = await auth()

  const isVi = locale === 'vi'

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
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcome', { name: session?.user?.name || 'User' })}
          </p>
        </div>
        <Link href="/calculator">
          <Button>
            <Calculator className="mr-2 h-4 w-4" />
            {isVi ? 'Tính toán' : 'Calculate'}
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
            <CardTitle>{isVi ? 'Phân Bổ Chi Phí' : 'Cost Breakdown'}</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart
              fixedCosts={fixedCostsSummary.monthlyTotal}
              variableCosts={variableCostsSummary.fixedPerOrder}
              investmentCosts={investmentsSummary.totalMonthlyAmortization}
              locale={locale}
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{isVi ? 'Thống Kê Nhanh' : 'Quick Stats'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{isVi ? 'Sản phẩm' : 'Products'}</span>
              <span className="font-bold">{productsSummary.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isVi ? 'Mục định phí' : 'Fixed Cost Items'}
              </span>
              <span className="font-bold">{fixedCostsSummary.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isVi ? 'Khoản đầu tư' : 'Active Investments'}
              </span>
              <span className="font-bold">{investmentsSummary.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isVi ? 'Tỷ lệ biến phí' : 'Variable Cost Rate'}
              </span>
              <span className="font-bold">
                {variableCostsSummary.totalPercentageRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isVi ? 'Giá trị đơn hàng TB' : 'Average Order Value'}
              </span>
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
          <CardTitle>{isVi ? 'Tính Toán Gần Đây' : 'Recent Calculations'}</CardTitle>
          <Link href="/calculator">
            <Button variant="ghost" size="sm">
              {isVi ? 'Xem tất cả' : 'View All'}
              <ArrowRight className="ml-2 h-4 w-4" />
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
