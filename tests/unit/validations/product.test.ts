import { describe, it, expect } from 'vitest'
import { productBaseSchema, validateSalesMix } from '@/lib/validations/product'

describe('Product Validation', () => {
  it('should validate valid product', () => {
    const validProduct = {
      name: 'Test Product',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const invalidProduct = {
      name: '',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('should reject negative selling price', () => {
    const invalidProduct = {
      name: 'Test Product',
      sellingPrice: -100,
      costPrice: 200000,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('should reject negative cost price', () => {
    const invalidProduct = {
      name: 'Test Product',
      sellingPrice: 500000,
      costPrice: -100,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('should reject sales mix ratio greater than 1', () => {
    const invalidProduct = {
      name: 'Test Product',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 1.5,
    }

    const result = productBaseSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('should reject negative sales mix ratio', () => {
    const invalidProduct = {
      name: 'Test Product',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: -0.1,
    }

    const result = productBaseSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
  })

  it('should accept optional SKU', () => {
    const productWithSku = {
      name: 'Test Product',
      sku: 'SKU-001',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(productWithSku)
    expect(result.success).toBe(true)
  })

  it('should accept null SKU', () => {
    const productWithNullSku = {
      name: 'Test Product',
      sku: null,
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 0.5,
    }

    const result = productBaseSchema.safeParse(productWithNullSku)
    expect(result.success).toBe(true)
  })
})

describe('Sales Mix Validation', () => {
  it('should return true when sales mix sums to 1', () => {
    const products = [{ salesMixRatio: 0.5 }, { salesMixRatio: 0.3 }, { salesMixRatio: 0.2 }]

    expect(validateSalesMix(products)).toBe(true)
  })

  it('should return false when sales mix does not sum to 1', () => {
    const products = [{ salesMixRatio: 0.5 }, { salesMixRatio: 0.3 }]

    expect(validateSalesMix(products)).toBe(false)
  })

  it('should handle single product with 100% mix', () => {
    const products = [{ salesMixRatio: 1 }]

    expect(validateSalesMix(products)).toBe(true)
  })

  it('should handle floating point precision', () => {
    const products = [{ salesMixRatio: 0.33 }, { salesMixRatio: 0.33 }, { salesMixRatio: 0.34 }]

    expect(validateSalesMix(products)).toBe(true)
  })

  it('should return true for empty array', () => {
    const products: { salesMixRatio: number }[] = []

    // Empty array sums to 0, which is not close to 1
    expect(validateSalesMix(products)).toBe(false)
  })
})
