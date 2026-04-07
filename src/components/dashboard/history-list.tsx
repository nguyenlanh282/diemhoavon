'use client'

import { formatCurrency, formatDate } from '@/lib/formatters'

interface CalculationHistoryItem {
  id: string
  name: string | null
  breakEvenUnits: unknown
  breakEvenRevenue: unknown
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

interface HistoryListProps {
  history: CalculationHistoryItem[]
  locale: string
}

export function HistoryList({ history, locale }: HistoryListProps) {
  const isVi = locale === 'vi'

  if (history.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        {isVi ? 'Chưa có lịch sử tính toán' : 'No calculations saved yet'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((calc) => (
        <div
          key={calc.id}
          className="flex items-center justify-between border-b pb-4 last:border-0"
        >
          <div>
            <p className="font-medium">{calc.name || (isVi ? 'Tính toán' : 'Calculation')}</p>
            <p className="text-muted-foreground text-sm">
              {formatDate(new Date(calc.createdAt), locale)} {isVi ? 'bởi' : 'by'}{' '}
              {calc.user.name || calc.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              {Math.ceil(Number(calc.breakEvenUnits)).toLocaleString()} {isVi ? 'đơn' : 'orders'}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatCurrency(Number(calc.breakEvenRevenue), locale)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
