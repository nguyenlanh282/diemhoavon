# Phase 05: Fixed Costs Module

## Context Links

- [Main Plan](./plan.md)
- [Previous: i18n Setup](./phase-04-i18n-setup.md)
- [Database Schema](./phase-02-database-schema.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | High       |
| Status         | Pending    |
| Estimated Time | 2-3 days   |

---

## Key Insights

- Fixed costs (dinh phi) are recurring expenses independent of sales volume
- Categories match Vietnamese business context: rent, utilities, salaries, etc.
- Support both monthly and annual frequency with automatic conversion
- "Other" category allows custom labels for flexibility
- Soft delete for audit trail; filter by isActive

---

## Requirements

1. CRUD operations for fixed costs
2. Predefined categories with Vietnamese/English labels
3. Custom category support (OTHER with customLabel)
4. Frequency support (monthly, quarterly, yearly)
5. Automatic monthly equivalent calculation
6. Organization-scoped data isolation
7. Form validation with Zod
8. Real-time cost summary

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        costs/
          fixed/
            page.tsx           # Fixed costs list
            new/
              page.tsx         # Add fixed cost
            [id]/
              edit/
                page.tsx       # Edit fixed cost
  components/
    costs/
      fixed-cost-form.tsx      # Shared form component
      fixed-cost-card.tsx      # Cost display card
      fixed-cost-summary.tsx   # Total summary
  lib/
    actions/
      fixed-costs.ts           # Server actions
    validations/
      fixed-cost.ts            # Zod schemas
```

---

## Related Code Files

| File                                                | Purpose           |
| --------------------------------------------------- | ----------------- |
| `src/app/[locale]/(dashboard)/costs/fixed/page.tsx` | List page         |
| `src/components/costs/fixed-cost-form.tsx`          | Form component    |
| `src/lib/actions/fixed-costs.ts`                    | Server actions    |
| `src/lib/validations/fixed-cost.ts`                 | Validation schema |

---

## Implementation Steps

### Step 1: Create Validation Schema

Create `src/lib/validations/fixed-cost.ts`:

```typescript
import { z } from 'zod'
import { FixedCostCategory, Frequency } from '@prisma/client'

export const fixedCostSchema = z
  .object({
    category: z.nativeEnum(FixedCostCategory),
    customLabel: z.string().max(100).optional(),
    amount: z.coerce.number().positive('Amount must be positive'),
    frequency: z.nativeEnum(Frequency).default('MONTHLY'),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.category !== 'OTHER' || data.customLabel, {
    message: 'Custom label required for OTHER category',
    path: ['customLabel'],
  })

export type FixedCostInput = z.infer<typeof fixedCostSchema>
```

### Step 2: Create Server Actions

Create `src/lib/actions/fixed-costs.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { fixedCostSchema, FixedCostInput } from '@/lib/validations/fixed-cost'
import { Decimal } from 'decimal.js'

export async function getFixedCosts() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.fixedCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFixedCostById(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.fixedCost.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createFixedCost(input: FixedCostInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = fixedCostSchema.parse(input)

  const cost = await prisma.fixedCost.create({
    data: {
      ...validated,
      amount: new Decimal(validated.amount),
      organizationId: session.user.organizationId,
    },
  })

  revalidatePath('/costs/fixed')
  return cost
}

export async function updateFixedCost(id: string, input: FixedCostInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = fixedCostSchema.parse(input)

  // Verify ownership
  const existing = await prisma.fixedCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const cost = await prisma.fixedCost.update({
    where: { id },
    data: {
      ...validated,
      amount: new Decimal(validated.amount),
    },
  })

  revalidatePath('/costs/fixed')
  return cost
}

export async function deleteFixedCost(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Soft delete
  await prisma.fixedCost.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/costs/fixed')
}

export async function getFixedCostsSummary() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const costs = await prisma.fixedCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  // Convert all to monthly equivalent
  const monthlyTotal = costs.reduce((sum, cost) => {
    const amount = new Decimal(cost.amount.toString())
    switch (cost.frequency) {
      case 'YEARLY':
        return sum.plus(amount.dividedBy(12))
      case 'QUARTERLY':
        return sum.plus(amount.dividedBy(3))
      default:
        return sum.plus(amount)
    }
  }, new Decimal(0))

  return {
    monthlyTotal: monthlyTotal.toNumber(),
    yearlyTotal: monthlyTotal.times(12).toNumber(),
    count: costs.length,
  }
}
```

### Step 3: Create Form Component

Create `src/components/costs/fixed-cost-form.tsx`:

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
import { fixedCostSchema, FixedCostInput } from '@/lib/validations/fixed-cost'
import { createFixedCost, updateFixedCost } from '@/lib/actions/fixed-costs'
import { FixedCostCategory, Frequency } from '@prisma/client'
import { toast } from 'sonner'

const categories: FixedCostCategory[] = [
  'RENT', 'ELECTRICITY', 'WATER', 'INTERNET', 'SALARY',
  'LOAN_INTEREST', 'OUTSOURCED', 'ACCOUNTING', 'TAX',
  'MARKETING_AGENCY', 'BRAND_ADVERTISING', 'OTHER',
]

const frequencies: Frequency[] = ['MONTHLY', 'QUARTERLY', 'YEARLY']

interface FixedCostFormProps {
  initialData?: FixedCostInput & { id: string }
  mode: 'create' | 'edit'
}

export function FixedCostForm({ initialData, mode }: FixedCostFormProps) {
  const t = useTranslations('costs.fixed')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FixedCostInput>({
    resolver: zodResolver(fixedCostSchema),
    defaultValues: initialData || {
      category: 'RENT',
      frequency: 'MONTHLY',
    },
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: FixedCostInput) => {
    try {
      if (mode === 'create') {
        await createFixedCost(data)
        toast.success(tCommon('success'))
      } else if (initialData?.id) {
        await updateFixedCost(initialData.id, data)
        toast.success(tCommon('success'))
      }
      router.push('/costs/fixed')
    } catch (error) {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: FixedCostCategory) => {
    const keyMap: Record<FixedCostCategory, string> = {
      RENT: 'rent',
      ELECTRICITY: 'electricity',
      WATER: 'water',
      INTERNET: 'internet',
      SALARY: 'salary',
      LOAN_INTEREST: 'loanInterest',
      OUTSOURCED: 'outsourced',
      ACCOUNTING: 'accounting',
      TAX: 'tax',
      MARKETING_AGENCY: 'marketingAgency',
      BRAND_ADVERTISING: 'brandAdvertising',
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
          onValueChange={(val) => setValue('category', val as FixedCostCategory)}
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
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      {/* Custom Label (for OTHER) */}
      {selectedCategory === 'OTHER' && (
        <div className="space-y-2">
          <Label>Custom Label</Label>
          <Input {...register('customLabel')} />
          {errors.customLabel && (
            <p className="text-red-500 text-sm">{errors.customLabel.message}</p>
          )}
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('amount')}
          placeholder="15000000"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount.message}</p>
        )}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select
          value={watch('frequency')}
          onValueChange={(val) => setValue('frequency', val as Frequency)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencies.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {freq.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

Create `src/app/[locale]/(dashboard)/costs/fixed/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { getFixedCosts, getFixedCostsSummary } from '@/lib/actions/fixed-costs'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { FixedCostCard } from '@/components/costs/fixed-cost-card'

export default async function FixedCostsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('costs.fixed')
  const [costs, summary] = await Promise.all([
    getFixedCosts(),
    getFixedCostsSummary(),
  ])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href="/costs/fixed/new">
          <Button>Add Fixed Cost</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.monthlyTotal, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yearly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.yearlyTotal, locale)}
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
          <FixedCostCard key={cost.id} cost={cost} locale={locale} />
        ))}

        {costs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No fixed costs added yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Step 5: Create Cost Card Component

Create `src/components/costs/fixed-cost-card.tsx`:

```typescript
'use client'

import { FixedCost } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { deleteFixedCost } from '@/lib/actions/fixed-costs'
import { toast } from 'sonner'

interface FixedCostCardProps {
  cost: FixedCost
  locale: string
}

export function FixedCostCard({ cost, locale }: FixedCostCardProps) {
  const t = useTranslations('costs.fixed')
  const tCommon = useTranslations('common')

  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      RENT: 'rent',
      ELECTRICITY: 'electricity',
      WATER: 'water',
      INTERNET: 'internet',
      SALARY: 'salary',
      LOAN_INTEREST: 'loanInterest',
      OUTSOURCED: 'outsourced',
      ACCOUNTING: 'accounting',
      TAX: 'tax',
      MARKETING_AGENCY: 'marketingAgency',
      BRAND_ADVERTISING: 'brandAdvertising',
      OTHER: 'other',
    }
    return t(keyMap[category] || 'other')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteFixedCost(cost.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <h3 className="font-semibold">
            {cost.customLabel || getCategoryLabel(cost.category)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {cost.frequency.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">
            {formatCurrency(Number(cost.amount), locale)}
          </p>
          <div className="flex gap-2">
            <Link href={`/costs/fixed/${cost.id}/edit`}>
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

### Step 6: Create Add/Edit Pages

Create `src/app/[locale]/(dashboard)/costs/fixed/new/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { FixedCostForm } from '@/components/costs/fixed-cost-form'

export default async function NewFixedCostPage() {
  const t = await getTranslations('costs.fixed')

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Add {t('title')}</h1>
      <FixedCostForm mode="create" />
    </div>
  )
}
```

Create `src/app/[locale]/(dashboard)/costs/fixed/[id]/edit/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getFixedCostById } from '@/lib/actions/fixed-costs'
import { FixedCostForm } from '@/components/costs/fixed-cost-form'

export default async function EditFixedCostPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const t = await getTranslations('costs.fixed')
  const cost = await getFixedCostById(id)

  if (!cost) notFound()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Edit {t('title')}</h1>
      <FixedCostForm
        mode="edit"
        initialData={{
          id: cost.id,
          category: cost.category,
          customLabel: cost.customLabel || undefined,
          amount: Number(cost.amount),
          frequency: cost.frequency,
          notes: cost.notes || undefined,
        }}
      />
    </div>
  )
}
```

---

## Todo List

- [ ] Create Zod validation schema
- [ ] Implement server actions (CRUD)
- [ ] Build fixed cost form component
- [ ] Build fixed cost card component
- [ ] Create list page with summary
- [ ] Create add page
- [ ] Create edit page
- [ ] Add delete confirmation
- [ ] Test all CRUD operations
- [ ] Verify organization isolation

---

## Success Criteria

1. Can create new fixed cost with all categories
2. Can edit existing fixed cost
3. Can delete (soft delete) fixed cost
4. Summary shows correct monthly/yearly totals
5. Frequency conversion works correctly
6. Organization isolation prevents cross-tenant access
7. Form validation shows appropriate errors

---

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation                  |
| ----------------------------- | ---------- | ------ | --------------------------- |
| Decimal precision loss        | Medium     | High   | Use Decimal.js consistently |
| Missing category translations | Low        | Low    | Fallback to English         |
| Race condition on delete      | Low        | Medium | Optimistic UI with rollback |

---

## Security Considerations

- Server actions verify session and organization ownership
- Soft delete preserves audit trail
- Input validation on both client and server
- No direct database ID exposure in URLs (use CUID)

---

## Next Steps

After completion, proceed to [Phase 06: Variable Costs Module](./phase-06-variable-costs-module.md)
