import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getFixedCostById } from '@/lib/actions/fixed-costs'
import { FixedCostForm } from '@/components/costs/fixed-cost-form'

export default async function EditFixedCostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await getTranslations('costs.fixed')
  const tCommon = await getTranslations('common')
  const cost = await getFixedCostById(id)

  if (!cost) notFound()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('edit')} {t('title')}
      </h1>
      <FixedCostForm
        mode="edit"
        initialData={{
          id: cost.id,
          category: cost.category,
          customLabel: cost.customLabel || undefined,
          amount: Number(cost.amount),
          frequency: cost.frequency,
          notes: cost.notes || undefined,
        }}
      />
    </div>
  )
}
