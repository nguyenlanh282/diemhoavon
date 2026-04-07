'use client'

import { FixedCost } from '@/generated/prisma'
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
  const tFreq = useTranslations('frequency')

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

  const getFrequencyLabel = (frequency: string) => {
    const keyMap: Record<string, string> = {
      MONTHLY: 'monthly',
      QUARTERLY: 'quarterly',
      YEARLY: 'yearly',
    }
    return tFreq(keyMap[frequency] || 'monthly')
  }

  const handleDelete = async () => {
    if (!confirm(tCommon('confirm') + '?')) return
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
          <h3 className="font-semibold">{cost.customLabel || getCategoryLabel(cost.category)}</h3>
          <p className="text-muted-foreground text-sm">{getFrequencyLabel(cost.frequency)}</p>
          {cost.notes && <p className="text-muted-foreground mt-1 text-sm">{cost.notes}</p>}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">{formatCurrency(Number(cost.amount), locale)}</p>
          <div className="flex gap-2">
            <Link href={`/costs/fixed/${cost.id}/edit`}>
              <Button variant="outline" size="sm">
                {tCommon('edit')}
              </Button>
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
