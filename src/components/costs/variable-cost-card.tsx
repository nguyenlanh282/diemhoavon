'use client'

import { VariableCost } from '@/generated/prisma'
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
      VAT: 'vat',
      COMMISSION: 'commission',
      ADVERTISING: 'advertising',
      OTHER: 'other',
    }
    return t(keyMap[category] || 'other')
  }

  const getPerUnitLabel = (perUnit: string | null) => {
    if (!perUnit) return t('perOrder')
    const keyMap: Record<string, string> = {
      per_order: 'perOrder',
      per_lead: 'perLead',
      per_product: 'perProduct',
    }
    return t(keyMap[perUnit] || 'perOrder')
  }

  const handleDelete = async () => {
    if (!confirm(tCommon('confirm') + '?')) return
    try {
      await deleteVariableCost(cost.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  // Convert stored decimal back to display format
  const displayRate =
    cost.rateType === 'percentage'
      ? `${new Decimal(cost.rateValue.toString()).times(100).toFixed(1)}%`
      : formatCurrency(Number(cost.rateValue), locale)

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-semibold">{cost.customLabel || getCategoryLabel(cost.category)}</h3>
            <p className="text-muted-foreground text-sm">{getPerUnitLabel(cost.perUnit)}</p>
            {cost.notes && <p className="text-muted-foreground mt-1 text-sm">{cost.notes}</p>}
          </div>
          <Badge variant={cost.rateType === 'percentage' ? 'default' : 'secondary'}>
            {cost.rateType === 'percentage' ? t('percentage') : t('fixedAmount')}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">{displayRate}</p>
          <div className="flex gap-2">
            <Link href={`/costs/variable/${cost.id}/edit`}>
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
