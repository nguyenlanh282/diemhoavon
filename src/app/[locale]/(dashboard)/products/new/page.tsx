import { getLocale, getTranslations } from 'next-intl/server'
import { ProductForm } from '@/components/products/product-form'

export default async function NewProductPage() {
  const locale = await getLocale()
  const t = await getTranslations('products')
  const tCommon = await getTranslations('common')

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('add')} {t('title')}
      </h1>
      <ProductForm mode="create" locale={locale} />
    </div>
  )
}
