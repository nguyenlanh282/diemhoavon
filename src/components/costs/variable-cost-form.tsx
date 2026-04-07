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
import { variableCostBaseSchema, VariableCostInput } from '@/lib/validations/variable-cost'
import { createVariableCost, updateVariableCost } from '@/lib/actions/variable-costs'
import { VariableCostCategory } from '@/generated/prisma'
import { toast } from 'sonner'

const categories: VariableCostCategory[] = ['VAT', 'COMMISSION', 'ADVERTISING', 'OTHER']

const perUnitOptions = [
  { value: 'per_order', labelKey: 'perOrder' },
  { value: 'per_lead', labelKey: 'perLead' },
  { value: 'per_product', labelKey: 'perProduct' },
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
    resolver: zodResolver(variableCostBaseSchema),
    defaultValues: initialData || {
      category: 'VAT',
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
        toast.success(tCommon('success'))
      } else if (initialData?.id) {
        await updateVariableCost(initialData.id, data)
        toast.success(tCommon('success'))
      }
      router.push('/costs/variable')
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: VariableCostCategory) => {
    const keyMap: Record<VariableCostCategory, string> = {
      VAT: 'vat',
      COMMISSION: 'commission',
      ADVERTISING: 'advertising',
      OTHER: 'other',
    }
    return t(keyMap[cat])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>{t('category')}</Label>
        <Select
          value={selectedCategory}
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
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Custom Label (for OTHER) */}
      {selectedCategory === 'OTHER' && (
        <div className="space-y-2">
          <Label>{t('customLabel')}</Label>
          <Input {...register('customLabel')} />
          {errors.customLabel && (
            <p className="text-sm text-red-500">{errors.customLabel.message}</p>
          )}
        </div>
      )}

      {/* Rate Type */}
      <div className="space-y-2">
        <Label>{t('rateType')}</Label>
        <RadioGroup
          value={rateType}
          onValueChange={(val) => setValue('rateType', val as 'percentage' | 'fixed')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="percentage" id="percentage" />
            <Label htmlFor="percentage">{t('percentage')} (%)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">{t('fixedAmount')} (VND)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Rate Value */}
      <div className="space-y-2">
        <Label>{rateType === 'percentage' ? t('ratePercent') : t('rateAmount')}</Label>
        <Input
          type="number"
          step={rateType === 'percentage' ? '0.1' : '1000'}
          {...register('rateValue', { valueAsNumber: true })}
          placeholder={rateType === 'percentage' ? '10' : '50000'}
        />
        {errors.rateValue && <p className="text-sm text-red-500">{errors.rateValue.message}</p>}
      </div>

      {/* Per Unit (for fixed type) */}
      {rateType === 'fixed' && (
        <div className="space-y-2">
          <Label>{t('perUnit')}</Label>
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
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t('notes')}</Label>
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
