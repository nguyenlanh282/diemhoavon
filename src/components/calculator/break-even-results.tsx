'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/formatters'
import { BUSINESS_TERM_EXPLANATIONS } from '@/lib/term-explanations'
import type { BreakEvenResult } from '@/lib/calculations/break-even'

interface BreakEvenResultsProps {
  result: BreakEvenResult
  locale: string
}

function TermWithTooltip({
  term,
  locale,
  children,
}: {
  term: string
  locale: string
  children: React.ReactNode
}) {
  const explanation = BUSINESS_TERM_EXPLANATIONS[term]
  if (!explanation) return <>{children}</>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dashed border-current">{children}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{locale === 'vi' ? explanation.vi : explanation.en}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function BreakEvenResults({ result, locale }: BreakEvenResultsProps) {
  const isVi = locale === 'vi'

  // Calculate contribution margin ratio
  const cmRatio =
    result.averageOrderValue > 0
      ? ((result.weightedContributionMargin / result.averageOrderValue) * 100).toFixed(1)
      : '0'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Break-Even Formula Explanation */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {isVi ? 'Phân Tích Chi Tiết Điểm Hòa Vốn' : 'Break-Even Analysis Breakdown'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Formula visualization */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-3 font-semibold">
                {isVi ? 'Công thức tính điểm hòa vốn:' : 'Break-even formula:'}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-lg">
                <span className="bg-primary/10 rounded px-2 py-1 font-mono">
                  {isVi ? 'Điểm hòa vốn (đơn)' : 'Break-even Units'}
                </span>
                <span>=</span>
                <span className="rounded bg-blue-500/10 px-2 py-1 font-mono">
                  {isVi ? 'Tổng định phí' : 'Total Fixed Costs'}
                </span>
                <span>÷</span>
                <span className="rounded bg-green-500/10 px-2 py-1 font-mono">
                  {isVi ? 'Lợi nhuận gộp/đơn' : 'Contribution Margin/Unit'}
                </span>
              </div>
            </div>

            {/* Step by step calculation */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Step 1: Average Order Value */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    1
                  </span>
                  <h5 className="font-semibold">
                    <TermWithTooltip term="AOV" locale={locale}>
                      {isVi ? 'Giá trị đơn hàng trung bình (AOV)' : 'Average Order Value (AOV)'}
                    </TermWithTooltip>
                  </h5>
                </div>
                <p className="text-primary text-2xl font-bold">
                  {formatCurrency(result.averageOrderValue, locale)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isVi
                    ? 'Tính theo tỷ lệ bán hàng của từng sản phẩm'
                    : 'Weighted by sales mix ratio'}
                </p>
              </div>

              {/* Step 2: Fixed Costs */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    2
                  </span>
                  <h5 className="font-semibold">
                    <TermWithTooltip term="FC" locale={locale}>
                      {isVi ? 'Tổng định phí hàng tháng' : 'Total Monthly Fixed Costs'}
                    </TermWithTooltip>
                  </h5>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(result.totalFixedCosts, locale)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isVi
                    ? 'Chi phí cố định + khấu hao đầu tư'
                    : 'Fixed costs + investment amortization'}
                </p>
              </div>

              {/* Step 3: Variable Costs */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    3
                  </span>
                  <h5 className="font-semibold">
                    <TermWithTooltip term="VC" locale={locale}>
                      {isVi ? 'Chi phí biến đổi / đơn hàng' : 'Variable Costs / Order'}
                    </TermWithTooltip>
                  </h5>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(result.totalVariableCostPerOrder, locale)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isVi
                    ? `${result.totalVariableCostRate.toFixed(1)}% doanh thu + phí cố định/đơn`
                    : `${result.totalVariableCostRate.toFixed(1)}% of revenue + fixed per order`}
                </p>
              </div>

              {/* Step 4: Contribution Margin */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                    4
                  </span>
                  <h5 className="font-semibold">
                    <TermWithTooltip term="CM" locale={locale}>
                      {isVi ? 'Lợi nhuận gộp / đơn hàng' : 'Contribution Margin / Order'}
                    </TermWithTooltip>
                  </h5>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.weightedContributionMargin, locale)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isVi
                    ? `= AOV - Giá vốn - Biến phí (${cmRatio}% doanh thu)`
                    : `= AOV - COGS - Variable costs (${cmRatio}% of revenue)`}
                </p>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {isVi
                  ? 'Giải thích chi tiết cách tính doanh thu điểm hòa vốn'
                  : 'Detailed Explanation of Break-Even Revenue Calculation'}
              </h4>
              <div className="space-y-4 text-sm">
                {/* Step 1: Contribution Margin calculation */}
                <div className="rounded-md bg-white/50 p-3 dark:bg-black/20">
                  <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                    {isVi
                      ? 'Bước 1: Tính Lợi nhuận gộp trên mỗi đơn hàng'
                      : 'Step 1: Calculate Contribution Margin per Order'}
                  </p>
                  <div className="space-y-1 pl-3 text-amber-800 dark:text-amber-200">
                    <p>
                      <span className="font-mono">
                        {isVi ? 'Lợi nhuận gộp/đơn' : 'CM per Order'} ={' '}
                        {isVi ? 'Giá trị đơn hàng (AOV)' : 'Average Order Value'} -{' '}
                        {isVi ? 'Giá vốn TB' : 'Avg COGS'} - {isVi ? 'Biến phí' : 'Variable Costs'}
                      </span>
                    </p>
                    <p className="font-mono">
                      = {formatCurrency(result.averageOrderValue, locale)} -{' '}
                      {formatCurrency(result.weightedCOGS, locale)} -{' '}
                      {formatCurrency(result.totalVariableCostPerOrder, locale)}
                    </p>
                    <p className="font-mono font-semibold text-green-700 dark:text-green-400">
                      = {formatCurrency(result.weightedContributionMargin, locale)}/
                      {isVi ? 'đơn' : 'order'}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    {isVi
                      ? `Mỗi đơn hàng đóng góp ${formatCurrency(result.weightedContributionMargin, locale)} để bù đắp định phí. Biến phí gồm ${result.totalVariableCostRate.toFixed(1)}% doanh thu + phí cố định/đơn.`
                      : `Each order contributes ${formatCurrency(result.weightedContributionMargin, locale)} to cover fixed costs. Variable costs include ${result.totalVariableCostRate.toFixed(1)}% of revenue + fixed per-order fees.`}
                  </p>
                </div>

                {/* Step 2: Break-even Units */}
                <div className="rounded-md bg-white/50 p-3 dark:bg-black/20">
                  <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                    {isVi
                      ? 'Bước 2: Tính số đơn hàng hòa vốn'
                      : 'Step 2: Calculate Break-Even Orders'}
                  </p>
                  <div className="space-y-1 pl-3 text-amber-800 dark:text-amber-200">
                    <p className="font-mono">
                      {isVi ? 'Số đơn hòa vốn' : 'Break-even Orders'} ={' '}
                      {isVi ? 'Tổng định phí' : 'Total Fixed Costs'} ÷{' '}
                      {isVi ? 'Lợi nhuận gộp/đơn' : 'CM per Order'}
                    </p>
                    <p className="font-mono">
                      = {formatCurrency(result.totalFixedCosts, locale)} ÷{' '}
                      {formatCurrency(result.weightedContributionMargin, locale)}
                    </p>
                    <p className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                      = {Math.ceil(result.breakEvenUnits).toLocaleString()}{' '}
                      {isVi ? 'đơn hàng' : 'orders'}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    {isVi
                      ? `Bạn cần bán ${Math.ceil(result.breakEvenUnits).toLocaleString()} đơn hàng mỗi tháng để có đủ lợi nhuận gộp bù đắp ${formatCurrency(result.totalFixedCosts, locale)} định phí.`
                      : `You need to sell ${Math.ceil(result.breakEvenUnits).toLocaleString()} orders per month to generate enough contribution margin to cover ${formatCurrency(result.totalFixedCosts, locale)} in fixed costs.`}
                  </p>
                </div>

                {/* Step 3: Break-even Revenue */}
                <div className="rounded-md bg-white/50 p-3 dark:bg-black/20">
                  <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                    {isVi
                      ? 'Bước 3: Tính doanh thu hòa vốn'
                      : 'Step 3: Calculate Break-Even Revenue'}
                  </p>
                  <div className="space-y-1 pl-3 text-amber-800 dark:text-amber-200">
                    <p className="font-mono">
                      {isVi ? 'Doanh thu hòa vốn' : 'Break-even Revenue'} ={' '}
                      {isVi ? 'Số đơn hòa vốn' : 'Break-even Orders'} ×{' '}
                      {isVi ? 'Giá trị đơn hàng (AOV)' : 'AOV'}
                    </p>
                    <p className="font-mono">
                      = {Math.ceil(result.breakEvenUnits).toLocaleString()} ×{' '}
                      {formatCurrency(result.averageOrderValue, locale)}
                    </p>
                    <p className="text-primary font-mono font-semibold">
                      = {formatCurrency(result.breakEvenRevenue, locale)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    {isVi
                      ? `Với giá trị trung bình ${formatCurrency(result.averageOrderValue, locale)}/đơn, bạn cần đạt ${formatCurrency(result.breakEvenRevenue, locale)} doanh thu mỗi tháng để hòa vốn.`
                      : `With an average order value of ${formatCurrency(result.averageOrderValue, locale)}, you need ${formatCurrency(result.breakEvenRevenue, locale)} in monthly revenue to break even.`}
                  </p>
                </div>

                {/* Summary insight */}
                <div className="rounded-md border border-amber-300 bg-amber-100/50 p-3 dark:border-amber-800 dark:bg-amber-900/30">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {isVi ? '💡 Tóm lại:' : '💡 Summary:'}
                  </p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                    {isVi
                      ? `Với định phí ${formatCurrency(result.totalFixedCosts, locale)}/tháng và lợi nhuận gộp ${formatCurrency(result.weightedContributionMargin, locale)}/đơn (sau khi trừ biến phí ${result.totalVariableCostRate.toFixed(1)}%), bạn cần bán tối thiểu ${Math.ceil(result.breakEvenUnits).toLocaleString()} đơn hàng (tương đương ${formatCurrency(result.breakEvenRevenue, locale)} doanh thu) để hòa vốn. Mỗi đơn hàng vượt qua con số này sẽ mang lại lợi nhuận ${formatCurrency(result.weightedContributionMargin, locale)}.`
                      : `With fixed costs of ${formatCurrency(result.totalFixedCosts, locale)}/month and contribution margin of ${formatCurrency(result.weightedContributionMargin, locale)}/order (after ${result.totalVariableCostRate.toFixed(1)}% variable costs), you need at least ${Math.ceil(result.breakEvenUnits).toLocaleString()} orders (${formatCurrency(result.breakEvenRevenue, locale)} revenue) to break even. Each order beyond this generates ${formatCurrency(result.weightedContributionMargin, locale)} in profit.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Final calculation */}
            <div className="border-primary bg-primary/5 rounded-lg border-2 p-4">
              <h4 className="mb-3 font-semibold">
                {isVi ? 'Kết quả tính toán:' : 'Calculation result:'}
              </h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{isVi ? 'Điểm hòa vốn (đơn)' : 'Break-even Units'}</span>
                  <span>=</span>
                  <span className="text-blue-600">
                    {formatCurrency(result.totalFixedCosts, locale)}
                  </span>
                  <span>÷</span>
                  <span className="text-green-600">
                    {formatCurrency(result.weightedContributionMargin, locale)}
                  </span>
                  <span>=</span>
                  <span className="text-primary font-bold">
                    {Math.ceil(result.breakEvenUnits).toLocaleString()} {isVi ? 'đơn' : 'orders'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{isVi ? 'Điểm hòa vốn (doanh thu)' : 'Break-even Revenue'}</span>
                  <span>=</span>
                  <span>{Math.ceil(result.breakEvenUnits).toLocaleString()}</span>
                  <span>×</span>
                  <span>{formatCurrency(result.averageOrderValue, locale)}</span>
                  <span>=</span>
                  <span className="text-primary font-bold">
                    {formatCurrency(result.breakEvenRevenue, locale)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Fixed Costs Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{isVi ? 'Chi Tiết Chi Phí Cố Định' : 'Fixed Costs Breakdown'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isVi ? 'Loại' : 'Category'}</TableHead>
                <TableHead className="text-right">{isVi ? 'Số tiền' : 'Amount'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.fixedCostsBreakdown.map((fc, i) => (
                <TableRow key={i}>
                  <TableCell>{fc.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(fc.amount, locale)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>{isVi ? 'Tổng cộng' : 'Total'}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(result.totalFixedCosts, locale)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{isVi ? 'Điểm Hòa Vốn Theo Sản Phẩm' : 'Product Break-Even'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isVi ? 'Sản phẩm' : 'Product'}</TableHead>
                <TableHead className="text-right">
                  <TermWithTooltip term="CM" locale={locale}>
                    {isVi ? 'LN Gộp' : 'CM'}
                  </TermWithTooltip>
                </TableHead>
                <TableHead className="text-right">{isVi ? 'Số lượng' : 'Units'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.productBreakdown.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(p.contributionMargin, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.ceil(p.breakEvenUnits).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{isVi ? 'Tóm Tắt' : 'Summary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex justify-between rounded-lg border p-4">
              <span className="text-muted-foreground">
                {isVi ? 'Giá trị đơn hàng trung bình' : 'Average Order Value'}
              </span>
              <span className="font-bold">{formatCurrency(result.averageOrderValue, locale)}</span>
            </div>
            <div className="flex justify-between rounded-lg border p-4">
              <span className="text-muted-foreground">
                {isVi ? 'Tỷ lệ chi phí biến đổi' : 'Variable Cost Rate'}
              </span>
              <span className="font-bold">{result.totalVariableCostRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between rounded-lg border p-4">
              <span className="text-muted-foreground">
                {isVi ? 'Chi phí biến đổi/đơn hàng' : 'Variable Cost/Order'}
              </span>
              <span className="font-bold">
                {formatCurrency(result.totalVariableCostPerOrder, locale)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
