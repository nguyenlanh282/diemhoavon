import { z } from 'zod'

export const investmentCategories = [
  'EQUIPMENT',
  'SOFTWARE',
  'RENOVATION',
  'INVENTORY',
  'MARKETING',
  'TRAINING',
  'LEGAL',
  'OTHER',
] as const

export type InvestmentCategory = (typeof investmentCategories)[number]

// Form schema - uses string for date input
export const investmentFormSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  category: z.enum(investmentCategories),
  totalAmount: z.number().positive('Amount must be positive'),
  amortizationMonths: z.number().int().min(1).max(120),
  startDate: z.string().min(1, 'Start date required'),
  notes: z.string().max(500).optional().nullable(),
})

// Server schema - converts string to date
export const investmentSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  category: z.enum(investmentCategories),
  totalAmount: z.number().positive('Amount must be positive'),
  amortizationMonths: z.number().int().min(1).max(120),
  startDate: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
})

export type InvestmentFormInput = z.infer<typeof investmentFormSchema>
export type InvestmentInput = z.infer<typeof investmentSchema>
