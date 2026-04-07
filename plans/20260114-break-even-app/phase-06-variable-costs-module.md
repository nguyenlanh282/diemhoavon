# Phase 06: Variable Costs Module

## Context Links

- [Main Plan](./plan.md)
- [Previous: Fixed Costs Module](./phase-05-fixed-costs-module.md)
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

- Variable costs (bien phi) scale with sales volume
- Can be percentage-based (VAT 10%, commission 5%) or fixed per unit
- COGS typically largest variable cost
- Need to track rate type (percentage vs fixed amount)
- Per-unit basis varies (per order, per lead, per product)

---

## Requirements

1. CRUD operations for variable costs
2. Support percentage-based costs (e.g., 10% VAT)
3. Support fixed per-unit costs (e.g., 50,000 VND/lead)
4. Predefined categories: COGS, VAT, commission, advertising, other
5. Calculate total variable cost rate for break-even
6. Organization-scoped data isolation

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        costs/
          variable/
            page.tsx           # Variable costs list
            new/
              page.tsx         # Add variable cost
            [id]/
              edit/
                page.tsx       # Edit variable cost
  components/
    costs/
      variable-cost-form.tsx   # Shared form component
      variable-cost-card.tsx   # Cost display card
  lib/
    actions/
      variable-costs.ts        # Server actions
    validations/
      variable-cost.ts         # Zod schemas
```

---

## Related Code Files

| File                                                   | Purpose           |
| ------------------------------------------------------ | ----------------- |
| `src/app/[locale]/(dashboard)/costs/variable/page.tsx` | List page         |
| `src/components/costs/variable-cost-form.tsx`          | Form component    |
| `src/lib/actions/variable-costs.ts`                    | Server actions    |
| `src/lib/validations/variable-cost.ts`                 | Validation schema |

---

## Implementation Steps

### Step 1: Create Validation Schema

Create `src/lib/validations/variable-cost.ts`:

```typescript
import { z } from 'zod'
import { VariableCostCategory } from '@prisma/client'

export const variableCostSchema = z
  .object({
    category: z.nativeEnum(VariableCostCategory),
    customLabel: z.string().max(100).optional(),
    rateType: z.enum(['percentage', 'fixed']),
    rateValue: z.coerce.number().positive('Rate must be positive'),
    perUnit: z.string().max(50).optional(), // per_order, per_lead, per_product
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.category !== 'OTHER' || data.customLabel, {
    message: 'Custom label required for OTHER category',
    path: ['customLabel'],
  })
  .refine((data) => data.rateType !== 'percentage' || data.rateValue <= 100, {
    message: 'Percentage cannot exceed 100%',
    path: ['rateValue'],
  })

export type VariableCostInput = z.infer<typeof variableCostSchema>
```

### Step 2: Create Server Actions

Create `src/lib/actions/variable-costs.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { variableCostSchema, VariableCostInput } from '@/lib/validations/variable-cost'
import { Decimal } from 'decimal.js'

export async function getVariableCosts() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.variableCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getVariableCostById(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.variableCost.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createVariableCost(input: VariableCostInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = variableCostSchema.parse(input)

  // Convert percentage to decimal (10% -> 0.10)
  const rateValue =
    validated.rateType === 'percentage'
      ? new Decimal(validated.rateValue).dividedBy(100)
      : new Decimal(validated.rateValue)

  const cost = await prisma.variableCost.create({
    data: {
      ...validated,
      rateValue,
      organizationId: session.user.organizationId,
    },
  })

  revalidatePath('/costs/variable')
  return cost
}

export async function updateVariableCost(id: string, input: VariableCostInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = variableCostSchema.parse(input)

  const existing = await prisma.variableCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const rateValue =
    validated.rateType === 'percentage'
      ? new Decimal(validated.rateValue).dividedBy(100)
      : new Decimal(validated.rateValue)

  const cost = await prisma.variableCost.update({
    where: { id },
    data: {
      ...validated,
      rateValue,
    },
  })

  revalidatePath('/costs/variable')
  return cost
}

export async function deleteVariableCost(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.variableCost.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/costs/variable')
}

export async function getVariableCostsSummary() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const costs = await prisma.variableCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  // Sum all percentage-based costs
  const totalPercentageRate = costs
    .filter((c) => c.rateType === 'percentage')
    .reduce((sum, c) => sum.plus(new Decimal(c.rateValue.toString())), new Decimal(0))

  // Get fixed costs per order (to show separately)
  const fixedPerOrder = costs
    .filter((c) => c.rateType === 'fixed' && c.perUnit === 'per_order')
    .reduce((sum, c) => sum.plus(new Decimal(c.rateValue.toString())), new Decimal(0))

  return {
    totalPercentageRate: totalPercentageRate.times(100).toNumber(), // Display as percentage
    totalPercentageRateDecimal: totalPercentageRate.toNumber(),
    fixedPerOrder: fixedPerOrder.toNumber(),
    count: costs.length,
  }
}
```

### Step 3: Create Form Component

Create `src/components/costs/variable-cost-form.tsx`:

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { variableCostSchema, VariableCostInput } from '@/lib/validations/variable-cost'
import { createVariableCost, updateVariableCost } from '@/lib/actions/variable-costs'
import { VariableCostCategory } from '@prisma/client'
import { toast } from 'sonner'

const categories: VariableCostCategory[] = [
  'COGS', 'VAT', 'COMMISSION', 'ADVERTISING', 'OTHER',
]

const perUnitOptions = [
  { value: 'per_order', label: 'Per Order' },
  { value: 'per_lead', label: 'Per Lead' },
  { value: 'per_product', label: 'Per Product' },
]

interface VariableCostFormProps {
  initialData?: VariableCostInput & { id: string }
  mode: 'create' | 'edit'
}

export function VariableCostForm({ initialData, mode }: VariableCostFormProps) {
  const t = useTranslations('costs.variable')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VariableCostInput>({
    resolver: zodResolver(variableCostSchema),
    defaultValues: initialData || {
      category: 'COGS',
      rateType: 'percentage',
      perUnit: 'per_order',
    },
  })

  const selectedCategory = watch('category')
  const rateType = watch('rateType')

  const onSubmit = async (data: VariableCostInput) => {
    try {
      if (mode === 'create') {
        await createVariableCost(data)
      } else if (initialData?.id) {
        await updateVariableCost(initialData.id, data)
      }
      toast.success(tCommon('success'))
      router.push('/costs/variable')
    } catch (error) {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: VariableCostCategory) => {
    const keyMap: Record<VariableCostCategory, string> = {
      COGS: 'cogs',
      VAT: 'vat',
      COMMISSION: 'commission',
      ADVERTISING: 'advertising',
      OTHER: 'other',
    }
    return t(keyMap[cat])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={watch('category')}
          onValueChange={(val) => setValue('category', val as VariableCostCategory)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Label */}
      {selectedCategory === 'OTHER' && (
        <div className="space-y-2">
          <Label>Custom Label</Label>
          <Input {...register('customLabel')} />
          {errors.customLabel && (
            <p className="text-red-500 text-sm">{errors.customLabel.message}</p>
          )}
        </div>
      )}

      {/* Rate Type */}
      <div className="space-y-2">
        <Label>Rate Type</Label>
        <RadioGroup
          value={rateType}
          onValueChange={(val) => setValue('rateType', val as 'percentage' | 'fixed')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="percentage" id="percentage" />
            <Label htmlFor="percentage">Percentage (%)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">Fixed Amount (VND)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Rate Value */}
      <div className="space-y-2">
        <Label>
          {rateType === 'percentage' ? 'Rate (%)' : 'Amount (VND)'}
        </Label>
        <Input
          type="number"
          step={rateType === 'percentage' ? '0.1' : '1000'}
          {...register('rateValue')}
          placeholder={rateType === 'percentage' ? '10' : '50000'}
        />
        {errors.rateValue && (
          <p className="text-red-500 text-sm">{errors.rateValue.message}</p>
        )}
      </div>

      {/* Per Unit (for fixed type) */}
      {rateType === 'fixed' && (
        <div className="space-y-2">
          <Label>Per Unit</Label>
          <Select
            value={watch('perUnit') || 'per_order'}
            onValueChange={(val) => setValue('perUnit', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perUnitOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

Create `src/app/[locale]/(dashboard)/costs/variable/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { getVariableCosts, getVariableCostsSummary } from '@/lib/actions/variable-costs'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { VariableCostCard } from '@/components/costs/variable-cost-card'

export default async function VariableCostsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('costs.variable')
  const [costs, summary] = await Promise.all([
    getVariableCosts(),
    getVariableCostsSummary(),
  ])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href="/costs/variable/new">
          <Button>Add Variable Cost</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Percentage Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.totalPercentageRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fixed Cost / Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.fixedPerOrder, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost Items
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
            <CardContent className="py-8 text-center text-muted-foreground">
              No variable costs added yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Step 5: Create Card Component

Create `src/components/costs/variable-cost-card.tsx`:

```typescript
'use client'

import { VariableCost } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/formatters'
import { deleteVariableCost } from '@/lib/actions/variable-costs'
import { toast } from 'sonner'
import { Decimal } from 'decimal.js'

interface VariableCostCardProps {
  cost: VariableCost
  locale: string
}

export function VariableCostCard({ cost, locale }: VariableCostCardProps) {
  const t = useTranslations('costs.variable')
  const tCommon = useTranslations('common')

  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      COGS: 'cogs',
      VAT: 'vat',
      COMMISSION: 'commission',
      ADVERTISING: 'advertising',
      OTHER: 'other',
    }
    return t(keyMap[category] || 'other')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteVariableCost(cost.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const displayRate = cost.rateType === 'percentage'
    ? `${new Decimal(cost.rateValue.toString()).times(100).toFixed(1)}%`
    : formatCurrency(Number(cost.rateValue), locale)

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-semibold">
              {cost.customLabel || getCategoryLabel(cost.category)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {cost.perUnit?.replace('_', ' ') || 'per order'}
            </p>
          </div>
          <Badge variant={cost.rateType === 'percentage' ? 'default' : 'secondary'}>
            {cost.rateType}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">{displayRate}</p>
          <div className="flex gap-2">
            <Link href={`/costs/variable/${cost.id}/edit`}>
              <Button variant="outline" size="sm">{tCommon('edit')}</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              {tCommon('delete')}
            </Button>
          </div>
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
- [ ] Build variable cost form component
- [ ] Build variable cost card component
- [ ] Create list page with summary
- [ ] Create add page
- [ ] Create edit page
- [ ] Test percentage vs fixed rate handling
- [ ] Verify rate calculations

---

## Success Criteria

1. Can create percentage-based costs (VAT 10%)
2. Can create fixed per-unit costs (50,000/lead)
3. Summary shows total percentage rate correctly
4. Rate storage is accurate (10% stored as 0.10)
5. Display converts back to user-friendly format
6. All CRUD operations work correctly

---

## Risk Assessment

| Risk                         | Likelihood | Impact | Mitigation                  |
| ---------------------------- | ---------- | ------ | --------------------------- |
| Percentage/decimal confusion | High       | High   | Clear UI labels, validation |
| Division by zero             | Low        | High   | Validate non-zero values    |
| Rate precision loss          | Medium     | Medium | Use Decimal.js              |

---

## Security Considerations

- Rate values validated on server
- Percentage capped at 100%
- Organization isolation enforced
- No negative rates allowed

---

## Next Steps

After completion, proceed to [Phase 07: Investment Module](./phase-07-investment-module.md)
