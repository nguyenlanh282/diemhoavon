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
import {
  investmentFormSchema,
  InvestmentFormInput,
  investmentCategories,
  InvestmentCategory,
} from '@/lib/validations/investment'
import { createInvestment, updateInvestment } from '@/lib/actions/investments'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/formatters'
import { Decimal } from 'decimal.js'

interface InvestmentFormProps {
  initialData?: InvestmentFormInput & { id: string }
  mode: 'create' | 'edit'
  locale: string
}

export function InvestmentForm({ initialData, mode, locale }: InvestmentFormProps) {
  const t = useTranslations('investments')
  const tCommon = useTranslations('common')
  const router = useRouter()

  // Format date for input
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return new Date().toISOString().split('T')[0]
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentFormInput>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: formatDateForInput(initialData.startDate),
        }
      : {
          category: 'EQUIPMENT',
          amortizationMonths: 12,
          startDate: formatDateForInput(new Date()),
        },
  })

  const totalAmount = watch('totalAmount')
  const amortizationMonths = watch('amortizationMonths')
  const selectedCategory = watch('category')

  // Calculate monthly amount preview
  const monthlyAmount =
    totalAmount && amortizationMonths
      ? new Decimal(totalAmount).dividedBy(amortizationMonths).toNumber()
      : 0

  const onSubmit = async (data: InvestmentFormInput) => {
    try {
      // Convert string date to Date for server action
      const serverData = {
        ...data,
        startDate: new Date(data.startDate),
      }
      if (mode === 'create') {
        await createInvestment(serverData)
        toast.success(tCommon('success'))
      } else if (initialData?.id) {
        await updateInvestment(initialData.id, serverData)
        toast.success(tCommon('success'))
      }
      router.push('/investments')
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: InvestmentCategory) => {
    const keyMap: Record<InvestmentCategory, string> = {
      EQUIPMENT: 'equipment',
      SOFTWARE: 'software',
      RENOVATION: 'renovation',
      INVENTORY: 'inventory',
      MARKETING: 'marketing',
      TRAINING: 'training',
      LEGAL: 'legal',
      OTHER: 'other',
    }
    return t(keyMap[cat])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label>{t('name')}</Label>
        <Input {...register('name')} placeholder={t('namePlaceholder')} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t('category')}</Label>
        <Select
          value={selectedCategory}
          onValueChange={(val) => setValue('category', val as InvestmentCategory)}
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
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Total Amount */}
      <div className="space-y-2">
        <Label>{t('totalAmount')} (VND)</Label>
        <Input
          type="number"
          step="1000"
          {...register('totalAmount', { valueAsNumber: true })}
          placeholder="100000000"
        />
        {errors.totalAmount && <p className="text-sm text-red-500">{errors.totalAmount.message}</p>}
      </div>

      {/* Amortization Period */}
      <div className="space-y-2">
        <Label>{t('amortizationMonths')}</Label>
        <Input
          type="number"
          min="1"
          max="120"
          {...register('amortizationMonths', { valueAsNumber: true })}
        />
        {errors.amortizationMonths && (
          <p className="text-sm text-red-500">{errors.amortizationMonths.message}</p>
        )}
      </div>

      {/* Monthly Preview */}
      {monthlyAmount > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('monthlyAmount')}</p>
          <p className="text-xl font-bold">{formatCurrency(monthlyAmount, locale)}</p>
        </div>
      )}

      {/* Start Date */}
      <div className="space-y-2">
        <Label>{t('startDate')}</Label>
        <Input type="date" {...register('startDate')} />
        {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
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
