import { getTranslations } from 'next-intl/server'
import { FixedCostForm } from '@/components/costs/fixed-cost-form'

export default async function NewFixedCostPage() {
  const t = await getTranslations('costs.fixed')
  const tCommon = await getTranslations('common')

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('add')} {t('title')}
      </h1>
      <FixedCostForm mode="create" />
    </div>
  )
}
