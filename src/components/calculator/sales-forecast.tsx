'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/formatters'
import {
  forecastByRevenue,
  forecastByUnits,
  forecastByProfit,
  type ForecastInput,
} from '@/lib/calculations/forecast'

interface SalesForecastProps {
  breakEvenData: ForecastInput
  locale: string
}

export function SalesForecast({ breakEvenData, locale }: SalesForecastProps) {
  const isVi = locale === 'vi'

  // State for each forecast type
  const [targetRevenue, setTargetRevenue] = useState<number>(0)
  const [targetUnits, setTargetUnits] = useState<number>(0)
  const [targetProfit, setTargetProfit] = useState<number>(0)

  // Calculate forecasts
  const revenueResult = targetRevenue > 0 ? forecastByRevenue(breakEvenData, targetRevenue) : null
  const unitsResult = targetUnits > 0 ? forecastByUnits(breakEvenData, targetUnits) : null
  const profitResult = targetProfit > 0 ? forecastByProfit(breakEvenData, targetProfit) : null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{isVi ? 'Dự Toán Bán Hàng' : 'Sales Forecast'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">{isVi ? 'Theo Doanh Số' : 'By Revenue'}</TabsTrigger>
            <TabsTrigger value="units">{isVi ? 'Theo Số Lượng' : 'By Units'}</TabsTrigger>
            <TabsTrigger value="profit">{isVi ? 'Theo Lợi Nhuận' : 'By Profit'}</TabsTrigger>
          </TabsList>

          {/* Forecast by Revenue */}
          <TabsContent value="revenue" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{isVi ? 'Doanh số mục tiêu (VND)' : 'Target Revenue (VND)'}</Label>
              <CurrencyInput
                value={targetRevenue}
                onChange={setTargetRevenue}
                locale={locale}
                placeholder={isVi ? '100.000.000' : '100,000,000'}
              />
            </div>

            {revenueResult && (
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  label={isVi ? 'Số đơn hàng cần bán' : 'Orders Required'}
                  value={Math.ceil(revenueResult.requiredUnits).toLocaleString()}
                  unit={isVi ? 'đơn' : 'orders'}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Chi phí biến đổi' : 'Variable Costs'}
                  value={formatCurrency(revenueResult.variableCosts, locale)}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Lợi nhuận dự kiến' : 'Expected Profit'}
                  value={formatCurrency(revenueResult.profit, locale)}
                  highlight={revenueResult.profit > 0 ? 'positive' : 'negative'}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Biên lợi nhuận' : 'Profit Margin'}
                  value={`${revenueResult.profitMargin.toFixed(1)}%`}
                  highlight={revenueResult.profitMargin > 0 ? 'positive' : 'negative'}
                  isVi={isVi}
                />
              </div>
            )}
          </TabsContent>

          {/* Forecast by Units */}
          <TabsContent value="units" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{isVi ? 'Số lượng đơn hàng dự kiến' : 'Target Units (Orders)'}</Label>
              <Input
                type="number"
                value={targetUnits || ''}
                onChange={(e) => setTargetUnits(Number(e.target.value) || 0)}
                placeholder={isVi ? 'VD: 500' : 'e.g., 500'}
                className="text-right"
              />
            </div>

            {unitsResult && (
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  label={isVi ? 'Doanh số dự kiến' : 'Expected Revenue'}
                  value={formatCurrency(unitsResult.revenue, locale)}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Chi phí biến đổi' : 'Variable Costs'}
                  value={formatCurrency(unitsResult.variableCosts, locale)}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Lợi nhuận dự kiến' : 'Expected Profit'}
                  value={formatCurrency(unitsResult.profit, locale)}
                  highlight={unitsResult.profit > 0 ? 'positive' : 'negative'}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Biên lợi nhuận' : 'Profit Margin'}
                  value={`${unitsResult.profitMargin.toFixed(1)}%`}
                  highlight={unitsResult.profitMargin > 0 ? 'positive' : 'negative'}
                  isVi={isVi}
                />
              </div>
            )}
          </TabsContent>

          {/* Forecast by Profit */}
          <TabsContent value="profit" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{isVi ? 'Lợi nhuận mong muốn (VND)' : 'Target Profit (VND)'}</Label>
              <CurrencyInput
                value={targetProfit}
                onChange={setTargetProfit}
                locale={locale}
                placeholder={isVi ? '50.000.000' : '50,000,000'}
              />
            </div>

            {profitResult && (
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  label={isVi ? 'Doanh số cần đạt' : 'Required Revenue'}
                  value={formatCurrency(profitResult.requiredRevenue, locale)}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Số đơn hàng cần bán' : 'Orders Required'}
                  value={Math.ceil(profitResult.requiredUnits).toLocaleString()}
                  unit={isVi ? 'đơn' : 'orders'}
                  isVi={isVi}
                />
                <ResultCard
                  label={isVi ? 'Chi phí biến đổi' : 'Variable Costs'}
                  value={formatCurrency(profitResult.variableCosts, locale)}
                  isVi={isVi}
                  className="col-span-2"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help text */}
        <p className="text-muted-foreground mt-4 text-sm">
          {isVi
            ? 'Nhập giá trị mục tiêu để xem dự toán. Kết quả dựa trên dữ liệu chi phí và sản phẩm hiện tại.'
            : 'Enter target values to see projections. Results are based on current cost and product data.'}
        </p>
      </CardContent>
    </Card>
  )
}

interface ResultCardProps {
  label: string
  value: string
  unit?: string
  highlight?: 'positive' | 'negative'
  isVi: boolean
  className?: string
}

function ResultCard({ label, value, unit, highlight, className }: ResultCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${className || ''}`}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p
        className={`text-xl font-bold ${
          highlight === 'positive'
            ? 'text-green-600'
            : highlight === 'negative'
              ? 'text-red-600'
              : ''
        }`}
      >
        {value}
        {unit && <span className="text-muted-foreground ml-1 text-sm font-normal">{unit}</span>}
      </p>
    </div>
  )
}
