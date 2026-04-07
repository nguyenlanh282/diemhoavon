import { describe, it, expect } from 'vitest'
import { calculateBreakEven, BreakEvenInput } from '@/lib/calculations/break-even'

describe('Break-Even Calculation', () => {
  const baseInput: BreakEvenInput = {
    fixedCosts: [
      { category: 'RENT', amount: 15000000 },
      { category: 'SALARY', amount: 50000000 },
    ],
    variableCosts: [
      { category: 'VAT', rateType: 'percentage', rateValue: 0.1 },
      { category: 'COMMISSION', rateType: 'percentage', rateValue: 0.05 },
    ],
    monthlyInvestmentCost: 5000000,
    products: [
      {
        id: '1',
        name: 'Product A',
        sellingPrice: 500000,
        costPrice: 200000,
        salesMixRatio: 0.6,
      },
      {
        id: '2',
        name: 'Product B',
        sellingPrice: 800000,
        costPrice: 400000,
        salesMixRatio: 0.4,
      },
    ],
  }

  it('should calculate total fixed costs correctly', () => {
    const result = calculateBreakEven(baseInput)

    // 15M + 50M + 5M investment = 70M
    expect(result.totalFixedCosts).toBe(70000000)
  })

  it('should calculate weighted AOV correctly', () => {
    const result = calculateBreakEven(baseInput)

    // (500000 * 0.6) + (800000 * 0.4) = 300000 + 320000 = 620000
    expect(result.averageOrderValue).toBe(620000)
  })

  it('should calculate weighted contribution margin correctly', () => {
    const result = calculateBreakEven(baseInput)

    // Product A CM: 500000 - 200000 = 300000, weighted: 300000 * 0.6 = 180000
    // Product B CM: 800000 - 400000 = 400000, weighted: 400000 * 0.4 = 160000
    // Total weighted CM: 340000
    // Variable costs (15% of AOV): 620000 * 0.15 = 93000
    // Effective CM: 340000 - 93000 = 247000
    expect(result.weightedContributionMargin).toBeCloseTo(247000, 0)
  })

  it('should calculate break-even units correctly', () => {
    const result = calculateBreakEven(baseInput)

    // BE = Fixed Costs / CM = 70000000 / 247000 ≈ 283.4
    expect(result.breakEvenUnits).toBeCloseTo(283.4, 1)
  })

  it('should calculate break-even revenue correctly', () => {
    const result = calculateBreakEven(baseInput)

    // Revenue = BE Units * AOV
    const expectedRevenue = result.breakEvenUnits * result.averageOrderValue
    expect(result.breakEvenRevenue).toBeCloseTo(expectedRevenue, 0)
  })

  it('should handle zero contribution margin', () => {
    const zeroCMInput: BreakEvenInput = {
      ...baseInput,
      products: [
        {
          id: '1',
          name: 'Product A',
          sellingPrice: 100000,
          costPrice: 100000, // Zero margin
          salesMixRatio: 1,
        },
      ],
      variableCosts: [], // No variable costs
    }

    const result = calculateBreakEven(zeroCMInput)
    expect(result.breakEvenUnits).toBe(0)
  })

  it('should handle negative contribution margin', () => {
    const negativeCMInput: BreakEvenInput = {
      ...baseInput,
      products: [
        {
          id: '1',
          name: 'Product A',
          sellingPrice: 100000,
          costPrice: 150000, // Negative margin
          salesMixRatio: 1,
        },
      ],
      variableCosts: [],
    }

    const result = calculateBreakEven(negativeCMInput)
    // With negative CM, break-even should be 0 (cannot be reached)
    expect(result.breakEvenUnits).toBe(0)
  })

  it('should handle single product correctly', () => {
    const singleProductInput: BreakEvenInput = {
      ...baseInput,
      products: [
        {
          id: '1',
          name: 'Single Product',
          sellingPrice: 1000000,
          costPrice: 400000,
          salesMixRatio: 1,
        },
      ],
    }

    const result = calculateBreakEven(singleProductInput)

    expect(result.averageOrderValue).toBe(1000000)
    expect(result.productBreakdown).toHaveLength(1)
  })

  it('should include investment in fixed costs breakdown', () => {
    const result = calculateBreakEven(baseInput)

    const investmentEntry = result.fixedCostsBreakdown.find(
      (fc) => fc.category === 'Investment Amortization'
    )

    expect(investmentEntry).toBeDefined()
    expect(investmentEntry?.amount).toBe(5000000)
  })

  it('should not include investment if zero', () => {
    const noInvestmentInput: BreakEvenInput = {
      ...baseInput,
      monthlyInvestmentCost: 0,
    }

    const result = calculateBreakEven(noInvestmentInput)

    const investmentEntry = result.fixedCostsBreakdown.find(
      (fc) => fc.category === 'Investment Amortization'
    )

    expect(investmentEntry).toBeUndefined()
  })

  it('should calculate variable cost rate correctly', () => {
    const result = calculateBreakEven(baseInput)

    // 10% VAT + 5% Commission = 15%
    expect(result.totalVariableCostRate).toBe(15)
  })

  it('should handle fixed per-order variable costs', () => {
    const fixedVarCostInput: BreakEvenInput = {
      ...baseInput,
      variableCosts: [{ category: 'SHIPPING', rateType: 'fixed', rateValue: 30000 }],
    }

    const result = calculateBreakEven(fixedVarCostInput)

    expect(result.totalVariableCostPerOrder).toBe(30000)
  })

  it('should calculate product breakdown correctly', () => {
    const result = calculateBreakEven(baseInput)

    expect(result.productBreakdown).toHaveLength(2)

    const productA = result.productBreakdown.find((p) => p.name === 'Product A')
    const productB = result.productBreakdown.find((p) => p.name === 'Product B')

    expect(productA).toBeDefined()
    expect(productB).toBeDefined()

    // Product A contribution margin = 500000 - 200000 = 300000
    expect(productA?.contributionMargin).toBe(300000)

    // Product B contribution margin = 800000 - 400000 = 400000
    expect(productB?.contributionMargin).toBe(400000)

    // Product A units = total break-even * 0.6 (sales mix)
    expect(productA?.breakEvenUnits).toBeCloseTo(result.breakEvenUnits * 0.6, 1)
  })

  it('should handle empty products array', () => {
    const emptyProductsInput: BreakEvenInput = {
      ...baseInput,
      products: [],
    }

    const result = calculateBreakEven(emptyProductsInput)

    expect(result.averageOrderValue).toBe(0)
    expect(result.breakEvenUnits).toBe(0)
    expect(result.productBreakdown).toHaveLength(0)
  })

  it('should handle empty fixed costs array', () => {
    const emptyFixedCostsInput: BreakEvenInput = {
      ...baseInput,
      fixedCosts: [],
      monthlyInvestmentCost: 0,
    }

    const result = calculateBreakEven(emptyFixedCostsInput)

    expect(result.totalFixedCosts).toBe(0)
    expect(result.breakEvenUnits).toBe(0)
  })
})
