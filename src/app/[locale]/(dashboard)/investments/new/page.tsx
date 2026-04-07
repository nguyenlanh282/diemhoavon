import { getLocale, getTranslations } from 'next-intl/server'
import { InvestmentForm } from '@/components/investments/investment-form'

export default async function NewInvestmentPage() {
  const locale = await getLocale()
  const t = await getTranslations('investments')
  const tCommon = await getTranslations('common')

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('add')} {t('title')}
      </h1>
      <InvestmentForm mode="create" locale={locale} />
    </div>
  )
}
