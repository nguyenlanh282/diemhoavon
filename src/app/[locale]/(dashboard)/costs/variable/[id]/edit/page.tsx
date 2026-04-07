import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getVariableCostById } from '@/lib/actions/variable-costs'
import { VariableCostForm } from '@/components/costs/variable-cost-form'
import { Decimal } from 'decimal.js'

export default async function EditVariableCostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations('costs.variable')
  const tCommon = await getTranslations('common')
  const cost = await getVariableCostById(id)

  if (!cost) notFound()

  // Convert stored decimal rate back to display format for editing
  const rateValue =
    cost.rateType === 'percentage'
      ? new Decimal(cost.rateValue.toString()).times(100).toNumber()
      : Number(cost.rateValue)

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('edit')} {t('title')}
      </h1>
      <VariableCostForm
        mode="edit"
        initialData={{
          id: cost.id,
          category: cost.category,
          customLabel: cost.customLabel || undefined,
          rateType: cost.rateType as 'percentage' | 'fixed',
          rateValue,
          perUnit: cost.perUnit || undefined,
          notes: cost.notes || undefined,
        }}
      />
    </div>
  )
}
