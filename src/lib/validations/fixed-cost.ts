import { z } from 'zod'
import { FixedCostCategory, Frequency } from '@/generated/prisma'

// Base schema without refinement for form type inference
export const fixedCostBaseSchema = z.object({
  category: z.nativeEnum(FixedCostCategory),
  customLabel: z.string().max(100).optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.nativeEnum(Frequency),
  notes: z.string().max(500).optional().nullable(),
})

// Full schema with refinement for server-side validation
export const fixedCostSchema = fixedCostBaseSchema.refine(
  (data) => data.category !== 'OTHER' || data.customLabel,
  {
    message: 'Custom label required for OTHER category',
    path: ['customLabel'],
  }
)

// Use base schema for form input type to avoid ZodEffects type issues
export type FixedCostInput = z.infer<typeof fixedCostBaseSchema>
