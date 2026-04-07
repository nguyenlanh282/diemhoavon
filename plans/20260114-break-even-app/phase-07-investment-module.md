# Phase 07: Investment Module

## Context Links

- [Main Plan](./plan.md)
- [Previous: Variable Costs Module](./phase-06-variable-costs-module.md)
- [Database Schema](./phase-02-database-schema.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | High       |
| Status         | Pending    |
| Estimated Time | 2 days     |

---

## Key Insights

- Initial investments amortized monthly for break-even calculation
- Common categories: equipment, software, renovation, inventory, etc.
- Monthly deduction = total / amortization months
- Track start date to calculate remaining amortization
- Include in fixed costs for break-even calculation period

---

## Requirements

1. CRUD operations for investments
2. Categories: equipment, software, renovation, inventory, marketing, other
3. Amortization period (months)
4. Start date for tracking depreciation
5. Calculate monthly deduction amount
6. Calculate remaining value at any point
7. Add to monthly fixed costs for break-even

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        investments/
          page.tsx              # Investment list
          new/
            page.tsx            # Add investment
          [id]/
            edit/
              page.tsx          # Edit investment
  components/
    investments/
      investment-form.tsx       # Shared form
      investment-card.tsx       # Display card
      investment-timeline.tsx   # Amortization timeline
  lib/
    actions/
      investments.ts            # Server actions
    validations/
      investment.ts             # Zod schemas
```

---

## Related Code Files

| File                                                | Purpose        |
| --------------------------------------------------- | -------------- |
| `src/app/[locale]/(dashboard)/investments/page.tsx` | List page      |
| `src/components/investments/investment-form.tsx`    | Form component |
| `src/lib/actions/investments.ts`                    | Server actions |

---

## Implementation Steps

### Step 1: Create Validation Schema

Create `src/lib/validations/investment.ts`:

```typescript
import { z } from 'zod'

export const investmentCategories = [
  'EQUIPMENT',
  'SOFTWARE',
  'RENOVATION',
  'INVENTORY',
  'MARKETING',
  'TRAINING',
  'LEGAL',
  'OTHER',
] as const

export type InvestmentCategory = (typeof investmentCategories)[number]

export const investmentSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  category: z.enum(investmentCategories),
  totalAmount: z.coerce.number().positive('Amount must be positive'),
  amortizationMonths: z.coerce.number().int().min(1).max(120), // 1-120 months
  startDate: z.coerce.date(),
  notes: z.string().max(500).optional(),
})

export type InvestmentInput = z.infer<typeof investmentSchema>
```

### Step 2: Create Server Actions

Create `src/lib/actions/investments.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { investmentSchema, InvestmentInput } from '@/lib/validations/investment'
import { Decimal } from 'decimal.js'

export async function getInvestments() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.investment.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInvestmentById(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.investment.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createInvestment(input: InvestmentInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = investmentSchema.parse(input)

  const investment = await prisma.investment.create({
    data: {
      name: validated.name,
      category: validated.category,
      totalAmount: new Decimal(validated.totalAmount),
      amortizationMonths: validated.amortizationMonths,
      startDate: validated.startDate,
      notes: validated.notes,
      organizationId: session.user.organizationId,
    },
  })

  revalidatePath('/investments')
  return investment
}

export async function updateInvestment(id: string, input: InvestmentInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = investmentSchema.parse(input)

  const existing = await prisma.investment.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const investment = await prisma.investment.update({
    where: { id },
    data: {
      name: validated.name,
      category: validated.category,
      totalAmount: new Decimal(validated.totalAmount),
      amortizationMonths: validated.amortizationMonths,
      startDate: validated.startDate,
      notes: validated.notes,
    },
  })

  revalidatePath('/investments')
  return investment
}

export async function deleteInvestment(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.investment.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/investments')
}

// Calculate monthly amortization for all active investments
export async function getInvestmentsSummary() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const investments = await prisma.investment.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  const now = new Date()

  let totalMonthlyAmortization = new Decimal(0)
  let totalOriginalValue = new Decimal(0)
  let totalRemainingValue = new Decimal(0)

  for (const inv of investments) {
    const amount = new Decimal(inv.totalAmount.toString())
    const monthlyAmount = amount.dividedBy(inv.amortizationMonths)

    // Calculate months elapsed
    const startDate = new Date(inv.startDate)
    const monthsElapsed = Math.max(
      0,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    )

    // Check if still amortizing
    if (monthsElapsed < inv.amortizationMonths) {
      totalMonthlyAmortization = totalMonthlyAmortization.plus(monthlyAmount)
    }

    // Calculate remaining value
    const amortized = monthlyAmount.times(Math.min(monthsElapsed, inv.amortizationMonths))
    const remaining = amount.minus(amortized)

    totalOriginalValue = totalOriginalValue.plus(amount)
    totalRemainingValue = totalRemainingValue.plus(Decimal.max(0, remaining))
  }

  return {
    totalMonthlyAmortization: totalMonthlyAmortization.toNumber(),
    totalOriginalValue: totalOriginalValue.toNumber(),
    totalRemainingValue: totalRemainingValue.toNumber(),
    count: investments.length,
  }
}

// Helper to get monthly cost for break-even calculation
export async function getMonthlyInvestmentCost() {
  const summary = await getInvestmentsSummary()
  return summary.totalMonthlyAmortization
}
```

### Step 3: Create Form Component

Create `src/components/investments/investment-form.tsx`:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { investmentSchema, InvestmentInput, investmentCategories } from '@/lib/validations/investment'
import { createInvestment, updateInvestment } from '@/lib/actions/investments'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/formatters'
import { Decimal } from 'decimal.js'

interface InvestmentFormProps {
  initialData?: InvestmentInput & { id: string }
  mode: 'create' | 'edit'
  locale: string
}

export function InvestmentForm({ initialData, mode, locale }: InvestmentFormProps) {
  const tCommon = useTranslations('common')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: initialData || {
      category: 'EQUIPMENT',
      amortizationMonths: 12,
      startDate: new Date(),
    },
  })

  const totalAmount = watch('totalAmount')
  const amortizationMonths = watch('amortizationMonths')

  // Calculate monthly amount preview
  const monthlyAmount = totalAmount && amortizationMonths
    ? new Decimal(totalAmount).dividedBy(amortizationMonths).toNumber()
    : 0

  const onSubmit = async (data: InvestmentInput) => {
    try {
      if (mode === 'create') {
        await createInvestment(data)
      } else if (initialData?.id) {
        await updateInvestment(initialData.id, data)
      }
      toast.success(tCommon('success'))
      router.push('/investments')
    } catch (error) {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      EQUIPMENT: 'Equipment',
      SOFTWARE: 'Software',
      RENOVATION: 'Renovation',
      INVENTORY: 'Inventory',
      MARKETING: 'Marketing',
      TRAINING: 'Training',
      LEGAL: 'Legal',
      OTHER: 'Other',
    }
    return labels[cat] || cat
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Name */}
      <div className="space-y-2">
        <Label>Investment Name</Label>
        <Input {...register('name')} placeholder="e.g., Office Equipment" />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={watch('category')}
          onValueChange={(val) => setValue('category', val as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {investmentCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Total Amount */}
      <div className="space-y-2">
        <Label>Total Amount (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('totalAmount')}
          placeholder="100000000"
        />
        {errors.totalAmount && (
          <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>
        )}
      </div>

      {/* Amortization Period */}
      <div className="space-y-2">
        <Label>Amortization Period (months)</Label>
        <Input
          type="number"
          min="1"
          max="120"
          {...register('amortizationMonths')}
        />
        {errors.amortizationMonths && (
          <p className="text-red-500 text-sm">{errors.amortizationMonths.message}</p>
        )}
      </div>

      {/* Monthly Preview */}
      {monthlyAmount > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Monthly Deduction</p>
          <p className="text-xl font-bold">
            {formatCurrency(monthlyAmount, locale)}
          </p>
        </div>
      )}

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          {...register('startDate')}
        />
        {errors.startDate && (
          <p className="text-red-500 text-sm">{errors.startDate.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...register('notes')} rows={3} />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tCommon('loading') : tCommon('save')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  )
}
```

### Step 4: Create List Page

Create `src/app/[locale]/(dashboard)/investments/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { getInvestments, getInvestmentsSummary } from '@/lib/actions/investments'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { InvestmentCard } from '@/components/investments/investment-card'

export default async function InvestmentsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [investments, summary] = await Promise.all([
    getInvestments(),
    getInvestmentsSummary(),
  ])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Investments</h1>
        <Link href="/investments/new">
          <Button>Add Investment</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Amortization
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investment
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Value
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investments
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
            <CardContent className="py-8 text-center text-muted-foreground">
              No investments added yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Step 5: Create Investment Card

Create `src/components/investments/investment-card.tsx`:

```typescript
'use client'

import { Investment } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { deleteInvestment } from '@/lib/actions/investments'
import { toast } from 'sonner'
import { Decimal } from 'decimal.js'

interface InvestmentCardProps {
  investment: Investment
  locale: string
}

export function InvestmentCard({ investment, locale }: InvestmentCardProps) {
  const tCommon = useTranslations('common')

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteInvestment(investment.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const amount = new Decimal(investment.totalAmount.toString())
  const monthlyAmount = amount.dividedBy(investment.amortizationMonths)

  // Calculate progress
  const now = new Date()
  const startDate = new Date(investment.startDate)
  const monthsElapsed = Math.max(0,
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth())
  )
  const progress = Math.min(100, (monthsElapsed / investment.amortizationMonths) * 100)
  const remaining = Math.max(0, investment.amortizationMonths - monthsElapsed)

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{investment.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{investment.category}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(startDate, locale)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {formatCurrency(amount.toNumber(), locale)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(monthlyAmount.toNumber(), locale)}/month
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{monthsElapsed} months elapsed</span>
            <span>{remaining} months remaining</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Link href={`/investments/${investment.id}/edit`}>
            <Button variant="outline" size="sm">{tCommon('edit')}</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            {tCommon('delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Todo List

- [ ] Create Zod validation schema
- [ ] Implement server actions (CRUD)
- [ ] Build investment form with preview
- [ ] Build investment card with progress
- [ ] Create list page with summary
- [ ] Create add/edit pages
- [ ] Implement amortization calculation
- [ ] Add progress bar visualization
- [ ] Test date calculations

---

## Success Criteria

1. Can create investment with amortization period
2. Monthly deduction calculated correctly
3. Progress bar shows elapsed vs remaining
4. Remaining value calculated accurately
5. Summary totals include only active amortizations
6. Integration ready for break-even calculation

---

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation                |
| ----------------------------- | ---------- | ------ | ------------------------- |
| Date calculation edge cases   | Medium     | Medium | Use library like date-fns |
| Timezone issues               | Medium     | Low    | Store as UTC              |
| Amortization after completion | Low        | Low    | Check months elapsed      |

---

## Security Considerations

- Date validation prevents future abuse
- Amortization period capped at 120 months
- Amount validated as positive number
- Organization isolation enforced

---

## Next Steps

After completion, proceed to [Phase 08: Products Module](./phase-08-products-module.md)
