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
import { fixedCostBaseSchema, FixedCostInput } from '@/lib/validations/fixed-cost'
import { createFixedCost, updateFixedCost } from '@/lib/actions/fixed-costs'
import { FixedCostCategory, Frequency } from '@/generated/prisma'
import { toast } from 'sonner'

const categories: FixedCostCategory[] = [
  'RENT',
  'ELECTRICITY',
  'WATER',
  'INTERNET',
  'SALARY',
  'LOAN_INTEREST',
  'OUTSOURCED',
  'ACCOUNTING',
  'TAX',
  'MARKETING_AGENCY',
  'BRAND_ADVERTISING',
  'OTHER',
]

const frequencies: Frequency[] = ['MONTHLY', 'QUARTERLY', 'YEARLY']

interface FixedCostFormProps {
  initialData?: FixedCostInput & { id: string }
  mode: 'create' | 'edit'
}

export function FixedCostForm({ initialData, mode }: FixedCostFormProps) {
  const t = useTranslations('costs.fixed')
  const tCommon = useTranslations('common')
  const tFreq = useTranslations('frequency')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FixedCostInput>({
    resolver: zodResolver(fixedCostBaseSchema),
    defaultValues: initialData || {
      category: 'RENT',
      frequency: 'MONTHLY',
    },
  })

  const selectedCategory = watch('category')
  const selectedFrequency = watch('frequency')

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
    } catch {
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

  const getFrequencyLabel = (freq: Frequency) => {
    const keyMap: Record<Frequency, string> = {
      MONTHLY: 'monthly',
      QUARTERLY: 'quarterly',
      YEARLY: 'yearly',
    }
    return tFreq(keyMap[freq])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>{t('category')}</Label>
        <Select
          value={selectedCategory}
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
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Custom Label (for OTHER) */}
      {selectedCategory === 'OTHER' && (
        <div className="space-y-2">
          <Label>Custom Label</Label>
          <Input {...register('customLabel')} />
          {errors.customLabel && (
            <p className="text-sm text-red-500">{errors.customLabel.message}</p>
          )}
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label>{t('amount')} (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('amount', { valueAsNumber: true })}
          placeholder="15000000"
        />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>{t('frequency')}</Label>
        <Select
          value={selectedFrequency}
          onValueChange={(val) => setValue('frequency', val as Frequency)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencies.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {getFrequencyLabel(freq)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
