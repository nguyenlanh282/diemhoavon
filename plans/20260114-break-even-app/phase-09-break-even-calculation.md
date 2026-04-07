# Phase 09: Break-Even Calculation

## Context Links

- [Main Plan](./plan.md)
- [Previous: Products Module](./phase-08-products-module.md)
- [Research: Break-Even Analysis](../../docs/research-break-even-analysis.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | Critical   |
| Status         | Pending    |
| Estimated Time | 2-3 days   |

---

## Key Insights

- Core formula: Break-Even = Fixed Costs / (AOV - Variable Costs per Order)
- Multi-product uses weighted average contribution margin
- Include investment amortization in fixed costs
- Variable costs can be percentage (of revenue) or fixed (per order)
- Save calculation snapshots for history/comparison

---

## Requirements

1. Calculate break-even point (units/orders)
2. Calculate break-even revenue
3. Include all cost sources: fixed, variable, investments
4. Support multi-product weighted average method
5. Real-time calculation updates
6. Save calculation to history
7. What-if analysis (adjust inputs, see impact)

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        calculator/
          page.tsx              # Main calculator page
  components/
    calculator/
      break-even-form.tsx       # Input adjustments
      break-even-results.tsx    # Results display
      break-even-chart.tsx      # Visualization
  lib/
    actions/
      calculations.ts           # Server actions
    calculations/
      break-even.ts             # Core calculation logic
```

---

## Related Code Files

| File                                               | Purpose                    |
| -------------------------------------------------- | -------------------------- |
| `src/app/[locale]/(dashboard)/calculator/page.tsx` | Calculator page            |
| `src/lib/calculations/break-even.ts`               | Core calculation engine    |
| `src/lib/actions/calculations.ts`                  | Save/retrieve calculations |
| `src/components/calculator/break-even-results.tsx` | Results display            |

---

## Implementation Steps

### Step 1: Create Calculation Engine

Create `src/lib/calculations/break-even.ts`:

```typescript
import { Decimal } from 'decimal.js'

export interface BreakEvenInput {
  // Fixed costs (monthly)
  fixedCosts: {
    category: string
    amount: number // already converted to monthly
  }[]

  // Variable costs
  variableCosts: {
    category: string
    rateType: 'percentage' | 'fixed'
    rateValue: number // percentage as decimal (0.10) or fixed amount
  }[]

  // Investment amortization (monthly)
  monthlyInvestmentCost: number

  // Products
  products: {
    id: string
    name: string
    sellingPrice: number
    costPrice: number
    salesMixRatio: number
  }[]
}

export interface BreakEvenResult {
  // Inputs summary
  totalFixedCosts: number
  totalVariableCostRate: number // percentage of revenue
  totalVariableCostPerOrder: number
  averageOrderValue: number
  weightedContributionMargin: number

  // Results
  breakEvenUnits: number
  breakEvenRevenue: number
  marginOfSafety?: number // if current sales provided

  // Breakdown
  fixedCostsBreakdown: { category: string; amount: number }[]
  productBreakdown: {
    id: string
    name: string
    contributionMargin: number
    breakEvenUnits: number
  }[]
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  // 1. Calculate total fixed costs (including investment amortization)
  const totalFixedCosts = input.fixedCosts.reduce(
    (sum, fc) => sum.plus(fc.amount),
    new Decimal(input.monthlyInvestmentCost)
  )

  // 2. Calculate weighted AOV and contribution margin
  let weightedAOV = new Decimal(0)
  let weightedCM = new Decimal(0)

  for (const product of input.products) {
    const price = new Decimal(product.sellingPrice)
    const cost = new Decimal(product.costPrice)
    const mix = new Decimal(product.salesMixRatio)

    weightedAOV = weightedAOV.plus(price.times(mix))
    weightedCM = weightedCM.plus(price.minus(cost).times(mix))
  }

  // 3. Calculate variable costs
  // Percentage-based costs reduce contribution margin
  const percentageCosts = input.variableCosts
    .filter((vc) => vc.rateType === 'percentage')
    .reduce((sum, vc) => sum.plus(vc.rateValue), new Decimal(0))

  // Fixed per-order costs add to variable cost
  const fixedPerOrderCosts = input.variableCosts
    .filter((vc) => vc.rateType === 'fixed')
    .reduce((sum, vc) => sum.plus(vc.rateValue), new Decimal(0))

  // Variable cost = percentage of revenue + fixed per order
  // For percentage: variableCostPerOrder = AOV * percentageRate
  const variableCostFromPercentage = weightedAOV.times(percentageCosts)
  const totalVariableCostPerOrder = variableCostFromPercentage.plus(fixedPerOrderCosts)

  // 4. Calculate effective contribution margin
  // CM = AOV - COGS (already in weightedCM) - variable costs
  // Note: COGS is product.costPrice, which is in weightedCM
  // Variable costs are additional (VAT, commission, etc.)
  const effectiveCM = weightedCM.minus(variableCostFromPercentage).minus(fixedPerOrderCosts)

  // 5. Calculate break-even
  // BE Units = Fixed Costs / Contribution Margin per Unit
  let breakEvenUnits = new Decimal(0)
  let breakEvenRevenue = new Decimal(0)

  if (effectiveCM.greaterThan(0)) {
    breakEvenUnits = totalFixedCosts.dividedBy(effectiveCM)
    breakEvenRevenue = breakEvenUnits.times(weightedAOV)
  }

  // 6. Calculate product breakdown (units per product)
  const productBreakdown = input.products.map((product) => {
    const productUnits = breakEvenUnits.times(product.salesMixRatio)
    return {
      id: product.id,
      name: product.name,
      contributionMargin: product.sellingPrice - product.costPrice,
      breakEvenUnits: productUnits.toNumber(),
    }
  })

  // 7. Fixed costs breakdown
  const fixedCostsBreakdown = [
    ...input.fixedCosts.map((fc) => ({
      category: fc.category,
      amount: fc.amount,
    })),
    {
      category: 'Investment Amortization',
      amount: input.monthlyInvestmentCost,
    },
  ]

  return {
    totalFixedCosts: totalFixedCosts.toNumber(),
    totalVariableCostRate: percentageCosts.times(100).toNumber(),
    totalVariableCostPerOrder: totalVariableCostPerOrder.toNumber(),
    averageOrderValue: weightedAOV.toNumber(),
    weightedContributionMargin: effectiveCM.toNumber(),
    breakEvenUnits: breakEvenUnits.toNumber(),
    breakEvenRevenue: breakEvenRevenue.toNumber(),
    fixedCostsBreakdown,
    productBreakdown,
  }
}

// Sensitivity analysis: how break-even changes with input variations
export function calculateSensitivity(
  baseInput: BreakEvenInput,
  variations: { name: string; modifier: (input: BreakEvenInput) => BreakEvenInput }[]
) {
  const baseResult = calculateBreakEven(baseInput)

  return variations.map((v) => {
    const modifiedInput = v.modifier({ ...baseInput })
    const result = calculateBreakEven(modifiedInput)

    return {
      name: v.name,
      breakEvenUnits: result.breakEvenUnits,
      breakEvenRevenue: result.breakEvenRevenue,
      changeFromBase: {
        units: result.breakEvenUnits - baseResult.breakEvenUnits,
        unitsPercent:
          ((result.breakEvenUnits - baseResult.breakEvenUnits) / baseResult.breakEvenUnits) * 100,
      },
    }
  })
}
```

### Step 2: Create Server Actions

Create `src/lib/actions/calculations.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { getFixedCostsSummary } from './fixed-costs'
import { getVariableCostsSummary, getVariableCosts } from './variable-costs'
import { getMonthlyInvestmentCost } from './investments'
import { getProductsSummary, getProducts } from './products'
import { calculateBreakEven, BreakEvenInput, BreakEvenResult } from '@/lib/calculations/break-even'
import { Decimal } from 'decimal.js'

// Gather all data and calculate break-even
export async function calculateCurrentBreakEven(): Promise<{
  input: BreakEvenInput
  result: BreakEvenResult
}> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Fetch all required data
  const [fixedCostsSummary, variableCosts, monthlyInvestmentCost, products] = await Promise.all([
    getFixedCostsSummary(),
    getVariableCosts(),
    getMonthlyInvestmentCost(),
    getProducts(),
  ])

  // Build fixed costs from database
  const fixedCostsData = await prisma.fixedCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  // Convert to monthly amounts
  const fixedCostsInput = fixedCostsData.map((fc) => {
    const amount = new Decimal(fc.amount.toString())
    let monthlyAmount: Decimal

    switch (fc.frequency) {
      case 'YEARLY':
        monthlyAmount = amount.dividedBy(12)
        break
      case 'QUARTERLY':
        monthlyAmount = amount.dividedBy(3)
        break
      default:
        monthlyAmount = amount
    }

    return {
      category: fc.customLabel || fc.category,
      amount: monthlyAmount.toNumber(),
    }
  })

  // Variable costs input
  const variableCostsInput = variableCosts.map((vc) => ({
    category: vc.customLabel || vc.category,
    rateType: vc.rateType as 'percentage' | 'fixed',
    rateValue: Number(vc.rateValue),
  }))

  // Products input
  const productsInput = products.map((p) => ({
    id: p.id,
    name: p.name,
    sellingPrice: Number(p.sellingPrice),
    costPrice: Number(p.costPrice),
    salesMixRatio: Number(p.salesMixRatio),
  }))

  const input: BreakEvenInput = {
    fixedCosts: fixedCostsInput,
    variableCosts: variableCostsInput,
    monthlyInvestmentCost,
    products: productsInput,
  }

  const result = calculateBreakEven(input)

  return { input, result }
}

// Save calculation to history
export async function saveCalculation(name?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const { input, result } = await calculateCurrentBreakEven()

  const saved = await prisma.calculationHistory.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      name: name || `Calculation ${new Date().toLocaleDateString()}`,
      inputSnapshot: input as any,
      totalFixedCosts: new Decimal(result.totalFixedCosts),
      totalVariableCostRate: new Decimal(result.totalVariableCostRate / 100),
      averageOrderValue: new Decimal(result.averageOrderValue),
      contributionMargin: new Decimal(result.weightedContributionMargin),
      breakEvenUnits: new Decimal(result.breakEvenUnits),
      breakEvenRevenue: new Decimal(result.breakEvenRevenue),
    },
  })

  revalidatePath('/history')
  return saved
}

// Get calculation history
export async function getCalculationHistory(limit: number = 20) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.calculationHistory.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })
}

// Get single calculation by ID
export async function getCalculationById(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.calculationHistory.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })
}
```

### Step 3: Create Calculator Page

Create `src/app/[locale]/(dashboard)/calculator/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { calculateCurrentBreakEven, saveCalculation } from '@/lib/actions/calculations'
import { getProductsSummary } from '@/lib/actions/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/formatters'
import { BreakEvenResults } from '@/components/calculator/break-even-results'
import { BreakEvenChart } from '@/components/calculator/break-even-chart'
import { SaveCalculationButton } from '@/components/calculator/save-calculation-button'

export default async function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('calculation')
  const productsSummary = await getProductsSummary()

  // Check prerequisites
  if (productsSummary.totalProducts === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <Alert>
          <AlertDescription>
            Please add products before calculating break-even.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!productsSummary.salesMixValid) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Sales mix ratios must total 100%. Please adjust product sales mix.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { input, result } = await calculateCurrentBreakEven()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <SaveCalculationButton />
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('breakEvenUnits')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.ceil(result.breakEvenUnits).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">orders/month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('breakEvenRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(result.breakEvenRevenue, locale)}
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalFixedCosts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(result.totalFixedCosts, locale)}
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('contributionMargin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(result.weightedContributionMargin, locale)}
            </p>
            <p className="text-sm text-muted-foreground">per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BreakEvenResults result={result} locale={locale} />
        <BreakEvenChart result={result} locale={locale} />
      </div>
    </div>
  )
}
```

### Step 4: Create Results Component

Create `src/components/calculator/break-even-results.tsx`:

```typescript
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
import { formatCurrency } from '@/lib/formatters'
import type { BreakEvenResult } from '@/lib/calculations/break-even'

interface BreakEvenResultsProps {
  result: BreakEvenResult
  locale: string
}

export function BreakEvenResults({ result, locale }: BreakEvenResultsProps) {
  return (
    <div className="space-y-6">
      {/* Fixed Costs Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Fixed Costs Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.fixedCostsBreakdown.map((fc, i) => (
                <TableRow key={i}>
                  <TableCell>{fc.category}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(fc.amount, locale)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Total</TableCell>
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
          <CardTitle>Product Break-Even</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">CM</TableHead>
                <TableHead className="text-right">Units</TableHead>
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
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Average Order Value</span>
            <span className="font-bold">
              {formatCurrency(result.averageOrderValue, locale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Variable Cost Rate</span>
            <span className="font-bold">
              {result.totalVariableCostRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Variable Cost/Order</span>
            <span className="font-bold">
              {formatCurrency(result.totalVariableCostPerOrder, locale)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 5: Create Save Button Component

Create `src/components/calculator/save-calculation-button.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveCalculation } from '@/lib/actions/calculations'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function SaveCalculationButton() {
  const t = useTranslations('calculation')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCalculation(name || undefined)
      toast.success(tCommon('success'))
      setOpen(false)
      setName('')
    } catch (error) {
      toast.error(tCommon('error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('saveResult')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Calculation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name (optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., January 2026 Projection"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Todo List

- [ ] Create break-even calculation engine
- [ ] Create server actions for calculation
- [ ] Build calculator page
- [ ] Build results display component
- [ ] Build chart visualization
- [ ] Implement save to history
- [ ] Add sensitivity analysis
- [ ] Test with various cost combinations
- [ ] Verify decimal precision

---

## Success Criteria

1. Break-even units calculated correctly
2. Break-even revenue calculated correctly
3. All cost types included (fixed, variable, investment)
4. Multi-product weighted average works
5. Results can be saved to history
6. Product breakdown shows individual contribution

---

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation     |
| ----------------------------- | ---------- | ------ | -------------- |
| Division by zero              | Medium     | High   | Check CM > 0   |
| Negative contribution margin  | Medium     | High   | Show warning   |
| Precision loss in calculation | Medium     | Medium | Use Decimal.js |

---

## Security Considerations

- All calculations performed server-side
- No sensitive data exposed in client
- History linked to authenticated user
- Organization isolation enforced

---

## Next Steps

After completion, proceed to [Phase 10: Email Reports](./phase-10-email-reports.md)
