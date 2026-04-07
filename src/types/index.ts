import { Decimal } from 'decimal.js'

// Re-export Prisma generated types
export { Role, FixedCostCategory, VariableCostCategory, Frequency } from '@/generated/prisma'

export type {
  Organization,
  User,
  Account,
  Session,
  FixedCost,
  VariableCost,
  Investment,
  Product,
  CalculationHistory,
} from '@/generated/prisma'

// Money handling
export type Currency = 'VND' | 'USD'

export interface MoneyValue {
  amount: Decimal
  currency: Currency
}

// Common interfaces for forms
export interface SelectOption {
  value: string
  label: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Date range for reports
export interface DateRange {
  from: Date
  to: Date
}

// Break-even calculation result
export interface BreakEvenResult {
  breakEvenUnits: Decimal
  breakEvenRevenue: Decimal
  contributionMargin: Decimal
  contributionMarginRatio: Decimal
  totalFixedCosts: Decimal
  totalVariableCostsPerUnit: Decimal
  weightedAveragePrice: Decimal
}

// Form input types for cost categories (bilingual labels)
export const FIXED_COST_LABELS = {
  RENT: { en: 'Rent', vi: 'Tiền thuê' },
  ELECTRICITY: { en: 'Electricity', vi: 'Tiền điện' },
  WATER: { en: 'Water', vi: 'Tiền nước' },
  INTERNET: { en: 'Internet', vi: 'Internet' },
  SALARY: { en: 'Salary', vi: 'Lương nhân viên' },
  LOAN_INTEREST: { en: 'Loan Interest', vi: 'Lãi vay' },
  OUTSOURCED: { en: 'Outsourced Services', vi: 'Dịch vụ thuê ngoài' },
  ACCOUNTING: { en: 'Accounting', vi: 'Kế toán' },
  TAX: { en: 'Tax', vi: 'Thuế' },
  MARKETING_AGENCY: { en: 'Marketing Agency', vi: 'Agency Marketing' },
  BRAND_ADVERTISING: { en: 'Brand Advertising', vi: 'Quảng cáo thương hiệu' },
  OTHER: { en: 'Other', vi: 'Khác' },
} as const

export const VARIABLE_COST_LABELS = {
  VAT: { en: 'VAT', vi: 'Thuế VAT' },
  COMMISSION: { en: 'Commission', vi: 'Hoa hồng' },
  ADVERTISING: { en: 'Advertising', vi: 'Quảng cáo' },
  OTHER: { en: 'Other', vi: 'Khác' },
} as const

export const FREQUENCY_LABELS = {
  MONTHLY: { en: 'Monthly', vi: 'Hàng tháng' },
  QUARTERLY: { en: 'Quarterly', vi: 'Hàng quý' },
  YEARLY: { en: 'Yearly', vi: 'Hàng năm' },
} as const

export const ROLE_LABELS = {
  ADMIN: { en: 'Administrator', vi: 'Quản trị viên' },
  MANAGER: { en: 'Manager', vi: 'Quản lý' },
  USER: { en: 'User', vi: 'Người dùng' },
} as const
