'use client'

import { Investment } from '@/generated/prisma'
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
import { InvestmentCategory } from '@/lib/validations/investment'

interface InvestmentCardProps {
  investment: Investment
  locale: string
}

export function InvestmentCard({ investment, locale }: InvestmentCardProps) {
  const t = useTranslations('investments')
  const tCommon = useTranslations('common')

  const handleDelete = async () => {
    if (!confirm(tCommon('confirm') + '?')) return
    try {
      await deleteInvestment(investment.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const getCategoryLabel = (cat: string) => {
    const keyMap: Record<string, string> = {
      EQUIPMENT: 'equipment',
      SOFTWARE: 'software',
      RENOVATION: 'renovation',
      INVENTORY: 'inventory',
      MARKETING: 'marketing',
      TRAINING: 'training',
      LEGAL: 'legal',
      OTHER: 'other',
    }
    return t(keyMap[cat] || 'other')
  }

  const amount = new Decimal(investment.totalAmount.toString())
  const monthlyAmount = amount.dividedBy(investment.amortizationMonths)

  // Calculate progress
  const now = new Date()
  const startDate = new Date(investment.startDate)
  const monthsElapsed = Math.max(
    0,
    (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  )
  const progress = Math.min(100, (monthsElapsed / investment.amortizationMonths) * 100)
  const remaining = Math.max(0, investment.amortizationMonths - monthsElapsed)

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{investment.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{getCategoryLabel(investment.category)}</Badge>
              <span className="text-muted-foreground text-sm">{formatDate(startDate, locale)}</span>
            </div>
            {investment.notes && (
              <p className="text-muted-foreground mt-2 text-sm">{investment.notes}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(amount.toNumber(), locale)}</p>
            <p className="text-muted-foreground text-sm">
              {formatCurrency(monthlyAmount.toNumber(), locale)}
              {locale === 'vi' ? '/tháng' : '/month'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {monthsElapsed} {locale === 'vi' ? 'tháng đã qua' : 'months elapsed'}
            </span>
            <span>
              {remaining} {locale === 'vi' ? 'tháng còn lại' : 'months remaining'}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link href={`/investments/${investment.id}/edit`}>
            <Button variant="outline" size="sm">
              {tCommon('edit')}
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            {tCommon('delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
