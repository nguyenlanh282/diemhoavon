# Phase 08: Products Module

## Context Links

- [Main Plan](./plan.md)
- [Previous: Investment Module](./phase-07-investment-module.md)
- [Research: Break-Even Analysis](../../docs/research-break-even-analysis.md)

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

- Products define revenue streams and cost structure
- Contribution margin = selling price - cost price
- Sales mix ratio determines weighted average for multi-product
- AOV (Average Order Value) can be calculated from product mix
- Variable costs apply to products at order level

---

## Requirements

1. CRUD operations for products
2. Fields: name, SKU, selling price, cost price
3. Sales mix ratio (percentage of total sales)
4. Calculate contribution margin per product
5. Calculate weighted average contribution margin
6. Calculate average order value from product mix
7. Sales mix must sum to 100% (validated)

---

## Architecture

```
src/
  app/
    [locale]/
      (dashboard)/
        products/
          page.tsx              # Product list
          new/
            page.tsx            # Add product
          [id]/
            edit/
              page.tsx          # Edit product
  components/
    products/
      product-form.tsx          # Shared form
      product-card.tsx          # Display card
      sales-mix-editor.tsx      # Adjust sales mix
  lib/
    actions/
      products.ts               # Server actions
    validations/
      product.ts                # Zod schemas
```

---

## Related Code Files

| File                                             | Purpose        |
| ------------------------------------------------ | -------------- |
| `src/app/[locale]/(dashboard)/products/page.tsx` | List page      |
| `src/components/products/product-form.tsx`       | Form component |
| `src/lib/actions/products.ts`                    | Server actions |

---

## Implementation Steps

### Step 1: Create Validation Schema

Create `src/lib/validations/product.ts`:

```typescript
import { z } from 'zod'

export const productSchema = z
  .object({
    name: z.string().min(1, 'Name required').max(200),
    sku: z.string().max(50).optional(),
    sellingPrice: z.coerce.number().positive('Selling price must be positive'),
    costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
    salesMixRatio: z.coerce.number().min(0).max(1).default(0),
  })
  .refine((data) => data.costPrice < data.sellingPrice, {
    message: 'Cost price must be less than selling price',
    path: ['costPrice'],
  })

export type ProductInput = z.infer<typeof productSchema>

// Validate that sales mix sums to ~100%
export const validateSalesMix = (products: { salesMixRatio: number }[]) => {
  const total = products.reduce((sum, p) => sum + p.salesMixRatio, 0)
  return Math.abs(total - 1) < 0.001 // Allow small floating point error
}
```

### Step 2: Create Server Actions

Create `src/lib/actions/products.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { productSchema, ProductInput } from '@/lib/validations/product'
import { Decimal } from 'decimal.js'

export async function getProducts() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.product.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProductById(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.product.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createProduct(input: ProductInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = productSchema.parse(input)

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      sku: validated.sku,
      sellingPrice: new Decimal(validated.sellingPrice),
      costPrice: new Decimal(validated.costPrice),
      salesMixRatio: new Decimal(validated.salesMixRatio),
      organizationId: session.user.organizationId,
    },
  })

  revalidatePath('/products')
  return product
}

export async function updateProduct(id: string, input: ProductInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = productSchema.parse(input)

  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: validated.name,
      sku: validated.sku,
      sellingPrice: new Decimal(validated.sellingPrice),
      costPrice: new Decimal(validated.costPrice),
      salesMixRatio: new Decimal(validated.salesMixRatio),
    },
  })

  revalidatePath('/products')
  return product
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/products')
}

// Update sales mix for multiple products at once
export async function updateSalesMix(updates: { id: string; salesMixRatio: number }[]) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Validate total equals 1
  const total = updates.reduce((sum, u) => sum + u.salesMixRatio, 0)
  if (Math.abs(total - 1) > 0.001) {
    throw new Error('Sales mix must total 100%')
  }

  // Update all products
  await Promise.all(
    updates.map((u) =>
      prisma.product.update({
        where: { id: u.id },
        data: { salesMixRatio: new Decimal(u.salesMixRatio) },
      })
    )
  )

  revalidatePath('/products')
}

// Calculate key metrics for break-even
export async function getProductsSummary() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  if (products.length === 0) {
    return {
      averageOrderValue: 0,
      weightedContributionMargin: 0,
      totalProducts: 0,
      salesMixValid: false,
    }
  }

  // Check if sales mix is valid (sums to ~1)
  const mixTotal = products.reduce(
    (sum, p) => sum.plus(new Decimal(p.salesMixRatio.toString())),
    new Decimal(0)
  )
  const salesMixValid = mixTotal.greaterThan(0.99) && mixTotal.lessThan(1.01)

  // Calculate weighted contribution margin
  // CM = (Selling Price - Cost Price) * Sales Mix Ratio
  let weightedCM = new Decimal(0)
  let weightedAOV = new Decimal(0)

  for (const product of products) {
    const sellingPrice = new Decimal(product.sellingPrice.toString())
    const costPrice = new Decimal(product.costPrice.toString())
    const mixRatio = new Decimal(product.salesMixRatio.toString())

    const contributionMargin = sellingPrice.minus(costPrice)
    weightedCM = weightedCM.plus(contributionMargin.times(mixRatio))
    weightedAOV = weightedAOV.plus(sellingPrice.times(mixRatio))
  }

  return {
    averageOrderValue: weightedAOV.toNumber(),
    weightedContributionMargin: weightedCM.toNumber(),
    totalProducts: products.length,
    salesMixValid,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      sellingPrice: Number(p.sellingPrice),
      costPrice: Number(p.costPrice),
      contributionMargin: Number(p.sellingPrice) - Number(p.costPrice),
      salesMixRatio: Number(p.salesMixRatio),
    })),
  }
}
```

### Step 3: Create Form Component

Create `src/components/products/product-form.tsx`:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { productSchema, ProductInput } from '@/lib/validations/product'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/formatters'
import { Decimal } from 'decimal.js'

interface ProductFormProps {
  initialData?: ProductInput & { id: string }
  mode: 'create' | 'edit'
  locale: string
}

export function ProductForm({ initialData, mode, locale }: ProductFormProps) {
  const tCommon = useTranslations('common')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      salesMixRatio: 0,
    },
  })

  const sellingPrice = watch('sellingPrice')
  const costPrice = watch('costPrice')

  // Calculate contribution margin preview
  const contributionMargin = sellingPrice && costPrice
    ? new Decimal(sellingPrice).minus(costPrice).toNumber()
    : 0

  const marginPercentage = sellingPrice && costPrice && sellingPrice > 0
    ? (contributionMargin / sellingPrice * 100).toFixed(1)
    : '0'

  const onSubmit = async (data: ProductInput) => {
    try {
      if (mode === 'create') {
        await createProduct(data)
      } else if (initialData?.id) {
        await updateProduct(initialData.id, data)
      }
      toast.success(tCommon('success'))
      router.push('/products')
    } catch (error) {
      toast.error(tCommon('error'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Name */}
      <div className="space-y-2">
        <Label>Product Name</Label>
        <Input {...register('name')} placeholder="e.g., Premium Package" />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* SKU */}
      <div className="space-y-2">
        <Label>SKU (Optional)</Label>
        <Input {...register('sku')} placeholder="e.g., PRD-001" />
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <Label>Selling Price (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('sellingPrice')}
          placeholder="500000"
        />
        {errors.sellingPrice && (
          <p className="text-red-500 text-sm">{errors.sellingPrice.message}</p>
        )}
      </div>

      {/* Cost Price */}
      <div className="space-y-2">
        <Label>Cost Price (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('costPrice')}
          placeholder="300000"
        />
        {errors.costPrice && (
          <p className="text-red-500 text-sm">{errors.costPrice.message}</p>
        )}
      </div>

      {/* Contribution Margin Preview */}
      {contributionMargin !== 0 && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Contribution Margin</span>
            <span className="font-bold">
              {formatCurrency(contributionMargin, locale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Margin %</span>
            <span className="font-bold">{marginPercentage}%</span>
          </div>
        </div>
      )}

      {/* Sales Mix Ratio */}
      <div className="space-y-2">
        <Label>Sales Mix Ratio (0-1)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          {...register('salesMixRatio')}
          placeholder="0.25"
        />
        <p className="text-sm text-muted-foreground">
          Proportion of total sales (e.g., 0.25 = 25%)
        </p>
        {errors.salesMixRatio && (
          <p className="text-red-500 text-sm">{errors.salesMixRatio.message}</p>
        )}
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

Create `src/app/[locale]/(dashboard)/products/page.tsx`:

```typescript
import { getTranslations } from 'next-intl/server'
import { getProducts, getProductsSummary } from '@/lib/actions/products'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/formatters'
import { ProductCard } from '@/components/products/product-card'

export default async function ProductsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [products, summary] = await Promise.all([
    getProducts(),
    getProductsSummary(),
  ])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {/* Sales Mix Warning */}
      {products.length > 0 && !summary.salesMixValid && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>
            Sales mix ratios must total 100%. Current total is not valid.
            Please adjust the ratios.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.averageOrderValue, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weighted Contribution Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.weightedContributionMargin, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}

        {products.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No products added yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Step 5: Create Product Card

Create `src/components/products/product-card.tsx`:

```typescript
'use client'

import { Product } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/formatters'
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import { Decimal } from 'decimal.js'

interface ProductCardProps {
  product: Product
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const tCommon = useTranslations('common')

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteProduct(product.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const sellingPrice = new Decimal(product.sellingPrice.toString())
  const costPrice = new Decimal(product.costPrice.toString())
  const contributionMargin = sellingPrice.minus(costPrice)
  const marginPercent = sellingPrice.greaterThan(0)
    ? contributionMargin.dividedBy(sellingPrice).times(100).toFixed(1)
    : '0'
  const salesMixPercent = new Decimal(product.salesMixRatio.toString())
    .times(100)
    .toFixed(0)

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {product.sku && (
                <Badge variant="outline">{product.sku}</Badge>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Selling: {formatCurrency(sellingPrice.toNumber(), locale)}</span>
              <span>Cost: {formatCurrency(costPrice.toNumber(), locale)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(contributionMargin.toNumber(), locale)}
            </p>
            <p className="text-sm text-muted-foreground">
              {marginPercent}% margin | {salesMixPercent}% mix
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Link href={`/products/${product.id}/edit`}>
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
- [ ] Build product form with margin preview
- [ ] Build product card component
- [ ] Create list page with summary
- [ ] Create add/edit pages
- [ ] Implement sales mix batch update
- [ ] Add sales mix validation warning
- [ ] Test weighted calculations

---

## Success Criteria

1. Can create products with pricing
2. Contribution margin calculated correctly
3. Sales mix ratios validated
4. Weighted average values correct
5. Warning shown when mix invalid
6. Ready for break-even integration

---

## Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation                  |
| ----------------------------- | ---------- | ------ | --------------------------- |
| Sales mix not summing to 100% | High       | Medium | Clear warning, batch update |
| Negative margin products      | Medium     | Low    | Validation prevents         |
| Floating point precision      | Medium     | Medium | Use Decimal.js              |

---

## Security Considerations

- Prices validated as positive numbers
- Cost must be less than selling price
- Organization isolation enforced
- No SQL injection via SKU field

---

## Next Steps

After completion, proceed to [Phase 09: Break-Even Calculation](./phase-09-break-even-calculation.md)
