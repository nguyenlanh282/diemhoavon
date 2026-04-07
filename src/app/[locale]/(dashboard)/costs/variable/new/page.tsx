import { getTranslations } from 'next-intl/server'
import { VariableCostForm } from '@/components/costs/variable-cost-form'

export default async function NewVariableCostPage() {
  const t = await getTranslations('costs.variable')
  const tCommon = await getTranslations('common')

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('add')} {t('title')}
      </h1>
      <VariableCostForm mode="create" />
    </div>
  )
}
