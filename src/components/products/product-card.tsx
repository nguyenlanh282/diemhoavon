'use client'

import { Product } from '@/generated/prisma'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/formatters'
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import { Decimal } from 'decimal.js'

interface ProductCardProps {
  product: Product
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')

  const handleDelete = async () => {
    if (!confirm(tCommon('confirm') + '?')) return
    try {
      await deleteProduct(product.id)
      toast.success(tCommon('success'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  const sellingPrice = new Decimal(product.sellingPrice.toString())
  const costPrice = new Decimal(product.costPrice.toString())
  const contributionMargin = sellingPrice.minus(costPrice)
  const marginPercent = sellingPrice.greaterThan(0)
    ? contributionMargin.dividedBy(sellingPrice).times(100).toFixed(1)
    : '0'
  const costPercent = sellingPrice.greaterThan(0)
    ? costPrice.dividedBy(sellingPrice).times(100).toFixed(1)
    : '0'
  const salesMixPercent = new Decimal(product.salesMixRatio.toString()).times(100).toFixed(0)

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.sku && <Badge variant="outline">{product.sku}</Badge>}
            </div>
            <div className="text-muted-foreground mt-2 flex gap-4 text-sm">
              <span>
                {t('sellingPrice')}: {formatCurrency(sellingPrice.toNumber(), locale)}
              </span>
              <span>
                {t('costPrice')}: {formatCurrency(costPrice.toNumber(), locale)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(contributionMargin.toNumber(), locale)}
            </p>
            <p className="text-muted-foreground text-sm">
              {t('costPercent')}: {costPercent}% | {marginPercent}% {t('margin')} |{' '}
              {salesMixPercent}% mix
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="outline" size="sm">
              {tCommon('edit')}
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            {tCommon('delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
