import { getLocale, getTranslations } from 'next-intl/server'
import { getProducts, getProductsSummary } from '@/lib/actions/products'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/formatters'
import { ProductCard } from '@/components/products/product-card'

export default async function ProductsPage() {
  const locale = await getLocale()
  const t = await getTranslations('products')

  const [products, summary] = await Promise.all([getProducts(), getProductsSummary()])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/products/new">
          <Button>{t('addNew')}</Button>
        </Link>
      </div>

      {/* Sales Mix Warning */}
      {products.length > 0 && !summary.salesMixValid && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{t('salesMixWarning')}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('averageOrderValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.averageOrderValue, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('weightedContributionMargin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.weightedContributionMargin, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('productCount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}

        {products.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center">
              {locale === 'vi'
                ? `Chưa có sản phẩm nào. Nhấn "${t('addNew')}" để bắt đầu.`
                : `No products added yet. Click "${t('addNew')}" to get started.`}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
