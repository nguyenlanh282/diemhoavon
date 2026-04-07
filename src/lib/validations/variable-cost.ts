import { z } from 'zod'
import { VariableCostCategory } from '@/generated/prisma'

// Base schema without refinement for form type inference
export const variableCostBaseSchema = z.object({
  category: z.nativeEnum(VariableCostCategory),
  customLabel: z.string().max(100).optional().nullable(),
  rateType: z.enum(['percentage', 'fixed']),
  rateValue: z.number().positive('Rate must be positive'),
  perUnit: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

// Full schema with refinements for server-side validation
export const variableCostSchema = variableCostBaseSchema
  .refine((data) => data.category !== 'OTHER' || data.customLabel, {
    message: 'Custom label required for OTHER category',
    path: ['customLabel'],
  })
  .refine((data) => data.rateType !== 'percentage' || data.rateValue <= 100, {
    message: 'Percentage cannot exceed 100%',
    path: ['rateValue'],
  })

// Use base schema for form input type to avoid ZodEffects type issues
export type VariableCostInput = z.infer<typeof variableCostBaseSchema>
