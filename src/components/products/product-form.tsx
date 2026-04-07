'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'
import { productBaseSchema, ProductInput } from '@/lib/validations/product'
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
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productBaseSchema),
    defaultValues: initialData || {
      salesMixRatio: 0,
    },
  })

  const sellingPrice = watch('sellingPrice')
  const costPrice = watch('costPrice')

  // Calculate contribution margin preview
  const contributionMargin =
    sellingPrice && costPrice ? new Decimal(sellingPrice).minus(costPrice).toNumber() : 0

  const marginPercentage =
    sellingPrice && costPrice && sellingPrice > 0
      ? ((contributionMargin / sellingPrice) * 100).toFixed(1)
      : '0'

  const costPercentage =
    sellingPrice && costPrice && sellingPrice > 0
      ? ((costPrice / sellingPrice) * 100).toFixed(1)
      : '0'

  const onSubmit = async (data: ProductInput) => {
    try {
      if (mode === 'create') {
        await createProduct(data)
        toast.success(tCommon('success'))
      } else if (initialData?.id) {
        await updateProduct(initialData.id, data)
        toast.success(tCommon('success'))
      }
      router.push('/products')
    } catch {
      toast.error(tCommon('error'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label>{t('name')}</Label>
        <Input {...register('name')} placeholder={t('namePlaceholder')} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* SKU */}
      <div className="space-y-2">
        <Label>
          {t('sku')} ({t('optional')})
        </Label>
        <Input {...register('sku')} placeholder="PRD-001" />
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <Label>{t('sellingPrice')} (VND)</Label>
        <Controller
          name="sellingPrice"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              locale={locale}
              placeholder={locale === 'vi' ? '500.000' : '500,000'}
            />
          )}
        />
        {errors.sellingPrice && (
          <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>
        )}
      </div>

      {/* Cost Price */}
      <div className="space-y-2">
        <Label>{t('costPrice')} (VND)</Label>
        <Controller
          name="costPrice"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              locale={locale}
              placeholder={locale === 'vi' ? '300.000' : '300,000'}
            />
          )}
        />
        {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
      </div>

      {/* Contribution Margin Preview */}
      {contributionMargin !== 0 && (
        <div className="bg-muted space-y-2 rounded-lg p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t('costPercent')}</span>
            <span className="font-bold">{costPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t('contributionMargin')}</span>
            <span className="font-bold">{formatCurrency(contributionMargin, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t('margin')} %</span>
            <span className="font-bold">{marginPercentage}%</span>
          </div>
        </div>
      )}

      {/* Sales Mix Ratio */}
      <div className="space-y-2">
        <Label>{t('salesMixRatio')} (0-1)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          {...register('salesMixRatio', { valueAsNumber: true })}
          placeholder="0.25"
        />
        <p className="text-muted-foreground text-sm">{t('salesMixHint')}</p>
        {errors.salesMixRatio && (
          <p className="text-sm text-red-500">{errors.salesMixRatio.message}</p>
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
