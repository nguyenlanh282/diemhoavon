import { Decimal } from 'decimal.js'

export interface BreakEvenInput {
  // Fixed costs (monthly)
  fixedCosts: {
    category: string
    amount: number // already converted to monthly
  }[]

  // Variable costs
  variableCosts: {
    category: string
    rateType: 'percentage' | 'fixed'
    rateValue: number // percentage as decimal (0.10) or fixed amount
  }[]

  // Investment amortization (monthly)
  monthlyInvestmentCost: number

  // Products
  products: {
    id: string
    name: string
    sellingPrice: number
    costPrice: number
    salesMixRatio: number
  }[]
}

export interface BreakEvenResult {
  // Inputs summary
  totalFixedCosts: number
  totalVariableCostRate: number // percentage of revenue
  totalVariableCostPerOrder: number
  averageOrderValue: number
  weightedCOGS: number // weighted cost of goods sold
  weightedContributionMargin: number

  // Results
  breakEvenUnits: number
  breakEvenRevenue: number
  marginOfSafety?: number // if current sales provided

  // Breakdown
  fixedCostsBreakdown: { category: string; amount: number }[]
  productBreakdown: {
    id: string
    name: string
    contributionMargin: number
    breakEvenUnits: number
  }[]
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  // 1. Calculate total fixed costs (including investment amortization)
  const totalFixedCosts = input.fixedCosts.reduce(
    (sum, fc) => sum.plus(fc.amount),
    new Decimal(input.monthlyInvestmentCost)
  )

  // 2. Calculate weighted AOV and contribution margin
  let weightedAOV = new Decimal(0)
  let weightedCM = new Decimal(0)
  let weightedCOGS = new Decimal(0)

  for (const product of input.products) {
    const price = new Decimal(product.sellingPrice)
    const cost = new Decimal(product.costPrice)
    const mix = new Decimal(product.salesMixRatio)

    weightedAOV = weightedAOV.plus(price.times(mix))
    weightedCOGS = weightedCOGS.plus(cost.times(mix))
    weightedCM = weightedCM.plus(price.minus(cost).times(mix))
  }

  // 3. Calculate variable costs
  // Percentage-based costs reduce contribution margin
  const percentageCosts = input.variableCosts
    .filter((vc) => vc.rateType === 'percentage')
    .reduce((sum, vc) => sum.plus(vc.rateValue), new Decimal(0))

  // Fixed per-order costs add to variable cost
  const fixedPerOrderCosts = input.variableCosts
    .filter((vc) => vc.rateType === 'fixed')
    .reduce((sum, vc) => sum.plus(vc.rateValue), new Decimal(0))

  // Variable cost = percentage of revenue + fixed per order
  // For percentage: variableCostPerOrder = AOV * percentageRate
  const variableCostFromPercentage = weightedAOV.times(percentageCosts)
  const totalVariableCostPerOrder = variableCostFromPercentage.plus(fixedPerOrderCosts)

  // 4. Calculate effective contribution margin
  // CM = AOV - COGS (already in weightedCM) - variable costs
  // Note: COGS is product.costPrice, which is in weightedCM
  // Variable costs are additional (VAT, commission, etc.)
  const effectiveCM = weightedCM.minus(variableCostFromPercentage).minus(fixedPerOrderCosts)

  // 5. Calculate break-even
  // BE Units = Fixed Costs / Contribution Margin per Unit
  let breakEvenUnits = new Decimal(0)
  let breakEvenRevenue = new Decimal(0)

  if (effectiveCM.greaterThan(0)) {
    breakEvenUnits = totalFixedCosts.dividedBy(effectiveCM)
    breakEvenRevenue = breakEvenUnits.times(weightedAOV)
  }

  // 6. Calculate product breakdown (units per product)
  const productBreakdown = input.products.map((product) => {
    const productUnits = breakEvenUnits.times(product.salesMixRatio)
    return {
      id: product.id,
      name: product.name,
      contributionMargin: product.sellingPrice - product.costPrice,
      breakEvenUnits: productUnits.toNumber(),
    }
  })

  // 7. Fixed costs breakdown
  const fixedCostsBreakdown = [
    ...input.fixedCosts.map((fc) => ({
      category: fc.category,
      amount: fc.amount,
    })),
  ]

  // Only add investment amortization if it's greater than 0
  if (input.monthlyInvestmentCost > 0) {
    fixedCostsBreakdown.push({
      category: 'Investment Amortization',
      amount: input.monthlyInvestmentCost,
    })
  }

  return {
    totalFixedCosts: totalFixedCosts.toNumber(),
    totalVariableCostRate: percentageCosts.times(100).toNumber(),
    totalVariableCostPerOrder: totalVariableCostPerOrder.toNumber(),
    averageOrderValue: weightedAOV.toNumber(),
    weightedCOGS: weightedCOGS.toNumber(),
    weightedContributionMargin: effectiveCM.toNumber(),
    breakEvenUnits: breakEvenUnits.toNumber(),
    breakEvenRevenue: breakEvenRevenue.toNumber(),
    fixedCostsBreakdown,
    productBreakdown,
  }
}

// Sensitivity analysis: how break-even changes with input variations
export function calculateSensitivity(
  baseInput: BreakEvenInput,
  variations: { name: string; modifier: (input: BreakEvenInput) => BreakEvenInput }[]
) {
  const baseResult = calculateBreakEven(baseInput)

  return variations.map((v) => {
    const modifiedInput = v.modifier({ ...baseInput })
    const result = calculateBreakEven(modifiedInput)

    return {
      name: v.name,
      breakEvenUnits: result.breakEvenUnits,
      breakEvenRevenue: result.breakEvenRevenue,
      changeFromBase: {
        units: result.breakEvenUnits - baseResult.breakEvenUnits,
        unitsPercent:
          baseResult.breakEvenUnits > 0
            ? ((result.breakEvenUnits - baseResult.breakEvenUnits) / baseResult.breakEvenUnits) *
              100
            : 0,
      },
    }
  })
}
