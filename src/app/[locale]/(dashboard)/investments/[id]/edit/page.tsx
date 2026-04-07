import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { getInvestmentById } from '@/lib/actions/investments'
import { InvestmentForm } from '@/components/investments/investment-form'
import { InvestmentCategory } from '@/lib/validations/investment'

// Format date for form input
const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export default async function EditInvestmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations('investments')
  const tCommon = await getTranslations('common')
  const investment = await getInvestmentById(id)

  if (!investment) notFound()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('edit')} {t('title')}
      </h1>
      <InvestmentForm
        mode="edit"
        locale={locale}
        initialData={{
          id: investment.id,
          name: investment.name,
          category: investment.category as InvestmentCategory,
          totalAmount: Number(investment.totalAmount),
          amortizationMonths: investment.amortizationMonths,
          startDate: formatDateForInput(investment.startDate),
          notes: investment.notes || undefined,
        }}
      />
    </div>
  )
}
