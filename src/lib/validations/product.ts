import { z } from 'zod'

// Base schema for form type inference
export const productBaseSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  sku: z.string().max(50).optional().nullable(),
  sellingPrice: z.number().positive('Selling price must be positive'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  salesMixRatio: z.number().min(0).max(1),
})

// Full schema with refinement for server validation
export const productSchema = productBaseSchema.refine(
  (data) => data.costPrice < data.sellingPrice,
  { message: 'Cost price must be less than selling price', path: ['costPrice'] }
)

export type ProductInput = z.infer<typeof productBaseSchema>

// Validate that sales mix sums to ~100%
export const validateSalesMix = (products: { salesMixRatio: number }[]) => {
  const total = products.reduce((sum, p) => sum + p.salesMixRatio, 0)
  return Math.abs(total - 1) < 0.001 // Allow small floating point error
}
