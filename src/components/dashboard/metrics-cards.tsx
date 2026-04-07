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
  const isVi = locale === 'vi'

  const metrics = [
    {
      title: isVi ? 'Điểm Hòa Vốn' : 'Break-Even Point',
      value: breakEvenResult ? Math.ceil(breakEvenResult.breakEvenUnits).toLocaleString() : '-',
      subtitle: isVi ? 'đơn hàng/tháng' : 'orders/month',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: isVi ? 'Doanh Thu Hòa Vốn' : 'Break-Even Revenue',
      value: breakEvenResult ? formatCurrency(breakEvenResult.breakEvenRevenue, locale) : '-',
      subtitle: isVi ? 'mỗi tháng' : 'per month',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      title: isVi ? 'Tổng Định Phí' : 'Monthly Fixed Costs',
      value: formatCurrency(fixedCosts + investmentAmortization, locale),
      subtitle: isVi ? 'bao gồm khấu hao' : 'including amortization',
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: isVi ? 'Lợi Nhuận Gộp' : 'Contribution Margin',
      value: breakEvenResult
        ? formatCurrency(breakEvenResult.weightedContributionMargin, locale)
        : '-',
      subtitle: isVi ? 'mỗi đơn hàng' : 'per order',
      icon: PiggyBank,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-muted-foreground text-xs">{metric.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
