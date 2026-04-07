import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { getProductById } from '@/lib/actions/products'
import { ProductForm } from '@/components/products/product-form'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations('products')
  const tCommon = await getTranslations('common')
  const product = await getProductById(id)

  if (!product) notFound()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {tCommon('edit')} {t('title')}
      </h1>
      <ProductForm
        mode="edit"
        locale={locale}
        initialData={{
          id: product.id,
          name: product.name,
          sku: product.sku || undefined,
          sellingPrice: Number(product.sellingPrice),
          costPrice: Number(product.costPrice),
          salesMixRatio: Number(product.salesMixRatio),
        }}
      />
    </div>
  )
}
