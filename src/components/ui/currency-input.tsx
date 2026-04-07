'use client'

import { forwardRef, useCallback, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: number | string
  onChange?: (value: number) => void
  locale?: string
  allowDecimal?: boolean
  decimalPlaces?: number
}

/**
 * Currency input with automatic thousand separators
 * - Displays formatted numbers (e.g., 1.000.000 for Vietnamese locale)
 * - Returns raw numeric value through onChange
 * - Supports both VND (no decimals) and USD (2 decimals)
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      locale = 'vi',
      allowDecimal = false,
      decimalPlaces = 0,
      className,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)

    // Determine separator based on locale
    const thousandSeparator = locale === 'vi' ? '.' : ','
    const decimalSeparator = locale === 'vi' ? ',' : '.'

    // Format number for display
    const formatNumber = useCallback(
      (num: number): string => {
        if (isNaN(num)) return ''

        const options: Intl.NumberFormatOptions = {
          maximumFractionDigits: allowDecimal ? decimalPlaces : 0,
          minimumFractionDigits: 0,
          useGrouping: true,
        }

        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', options).format(num)
      },
      [allowDecimal, decimalPlaces, locale]
    )

    // Parse display value to number
    const parseNumber = useCallback(
      (str: string): number => {
        if (!str) return 0

        // Remove thousand separators and convert decimal separator
        let cleaned = str
        if (locale === 'vi') {
          cleaned = str.replace(/\./g, '').replace(',', '.')
        } else {
          cleaned = str.replace(/,/g, '')
        }

        const num = parseFloat(cleaned)
        return isNaN(num) ? 0 : num
      },
      [locale]
    )

    // Compute display value from external value when not editing
    const displayValue = useMemo(() => {
      if (isEditing) return localValue

      if (value !== undefined) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (!isNaN(numValue)) {
          return formatNumber(numValue)
        }
      }
      return ''
    }, [value, isEditing, localValue, formatNumber])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value

      // Allow empty input
      if (!input) {
        setLocalValue('')
        onChange?.(0)
        return
      }

      // Remove all non-numeric characters except separators
      const allowedChars = allowDecimal
        ? `0-9${thousandSeparator}${decimalSeparator}`
        : `0-9${thousandSeparator}`
      const regex = new RegExp(`[^${allowedChars}]`, 'g')
      const cleaned = input.replace(regex, '')

      // Parse to number and reformat
      const numValue = parseNumber(cleaned)

      // Update local display with formatted value
      setLocalValue(formatNumber(numValue))

      // Notify parent of numeric value
      onChange?.(numValue)
    }

    const handleFocus = () => {
      setIsEditing(true)
      setLocalValue(displayValue)
    }

    const handleBlur = () => {
      setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if (
        ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        return
      }

      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return
      }

      // Allow: numbers
      if (/^[0-9]$/.test(e.key)) {
        return
      }

      // Allow: decimal separator (if allowed)
      if (allowDecimal && e.key === decimalSeparator) {
        return
      }

      // Block everything else
      e.preventDefault()
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (locale === 'vi' ? '1.000.000' : '1,000,000')}
        className={cn('text-right', className)}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
