/**
 * Format a number as currency based on locale
 * VND: Vietnamese Dong (no decimals)
 * USD: US Dollar (2 decimals)
 */
export function formatCurrency(amount: number, locale: string = 'vi'): string {
  if (locale === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(num: number, locale: string = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num)
}

/**
 * Format a decimal number as percentage
 * e.g., 0.15 -> "15%"
 */
export function formatPercent(value: number, locale: string = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a date based on locale
 * VN: dd/MM/yyyy
 * EN: MM/dd/yyyy
 */
export function formatDate(date: Date, locale: string = 'vi'): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date, locale: string = 'vi'): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal separators
  const cleaned = value.replace(/[^\d.,]/g, '')
  // Handle both comma and period as decimal separator
  const normalized = cleaned.replace(/,/g, '.')
  return parseFloat(normalized) || 0
}

/**
 * Format a number for display in input fields (no currency symbol)
 */
export function formatInputNumber(num: number, locale: string = 'vi'): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(num)
}
