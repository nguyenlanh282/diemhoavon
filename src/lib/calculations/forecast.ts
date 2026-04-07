import { Decimal } from 'decimal.js'

export interface ForecastInput {
  // Current break-even data
  totalFixedCosts: number
  weightedContributionMargin: number // per order (already deducts COGS + all variable costs)
  averageOrderValue: number
  totalVariableCostRate: number // percentage of revenue (for display only)
  totalVariableCostPerOrder: number // per order (for display only)
}

export interface ForecastByRevenueResult {
  targetRevenue: number
  requiredUnits: number
  variableCosts: number
  profit: number
  profitMargin: number // percentage
}

export interface ForecastByUnitsResult {
  targetUnits: number
  revenue: number
  variableCosts: number
  profit: number
  profitMargin: number // percentage
}

export interface ForecastByProfitResult {
  targetProfit: number
  requiredRevenue: number
  requiredUnits: number
  variableCosts: number
}

/**
 * Calculate forecast based on target revenue.
 *
 * Core identity (per order):
 *   Revenue = CM + VariableCosts  →  VariableCosts = AOV - CM
 * Therefore:
 *   totalVariableCosts = units × (AOV - CM)
 *   profit             = units × CM - fixedCosts
 */
export function forecastByRevenue(
  input: ForecastInput,
  targetRevenue: number
): ForecastByRevenueResult {
  const revenue = new Decimal(targetRevenue)
  const aov = new Decimal(input.averageOrderValue)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const cmPerOrder = new Decimal(input.weightedContributionMargin)

  // Số đơn hàng = Doanh số / Giá trị đơn hàng TB
  const units = aov.greaterThan(0) ? revenue.dividedBy(aov) : new Decimal(0)

  // Chi phí biến đổi = Đơn hàng × (AOV - CM)
  const variableCostPerOrder = aov.minus(cmPerOrder)
  const totalVariableCosts = units.times(
    variableCostPerOrder.greaterThan(0) ? variableCostPerOrder : new Decimal(0)
  )

  // Lợi nhuận = Doanh số - Chi phí cố định - Chi phí biến đổi
  const profit = revenue.minus(fixedCosts).minus(totalVariableCosts)

  // Biên lợi nhuận = Lợi nhuận / Doanh số × 100
  const profitMargin = revenue.greaterThan(0)
    ? profit.dividedBy(revenue).times(100)
    : new Decimal(0)

  return {
    targetRevenue,
    requiredUnits: units.toNumber(),
    variableCosts: totalVariableCosts.toNumber(),
    profit: profit.toNumber(),
    profitMargin: profitMargin.toNumber(),
  }
}

/**
 * Calculate forecast based on target units (orders).
 *
 *   revenue        = units × AOV
 *   variableCosts  = units × (AOV - CM)
 *   profit         = units × CM - fixedCosts
 */
export function forecastByUnits(input: ForecastInput, targetUnits: number): ForecastByUnitsResult {
  const units = new Decimal(targetUnits)
  const aov = new Decimal(input.averageOrderValue)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const cmPerOrder = new Decimal(input.weightedContributionMargin)

  // Doanh số = Đơn hàng × AOV
  const revenue = units.times(aov)

  // Chi phí biến đổi = Đơn hàng × (AOV - CM)
  const variableCostPerOrder = aov.minus(cmPerOrder)
  const totalVariableCosts = units.times(
    variableCostPerOrder.greaterThan(0) ? variableCostPerOrder : new Decimal(0)
  )

  // Lợi nhuận = Đơn hàng × CM - Chi phí cố định
  const profit = units.times(cmPerOrder).minus(fixedCosts)

  // Biên lợi nhuận
  const profitMargin = revenue.greaterThan(0)
    ? profit.dividedBy(revenue).times(100)
    : new Decimal(0)

  return {
    targetUnits,
    revenue: revenue.toNumber(),
    variableCosts: totalVariableCosts.toNumber(),
    profit: profit.toNumber(),
    profitMargin: profitMargin.toNumber(),
  }
}

/**
 * Calculate forecast based on target profit.
 *
 *   requiredUnits   = (fixedCosts + targetProfit) / CM
 *   requiredRevenue = requiredUnits × AOV
 *   variableCosts   = requiredUnits × (AOV - CM)
 */
export function forecastByProfit(
  input: ForecastInput,
  targetProfit: number
): ForecastByProfitResult {
  const profit = new Decimal(targetProfit)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const cmPerOrder = new Decimal(input.weightedContributionMargin)
  const aov = new Decimal(input.averageOrderValue)

  // Số đơn cần bán = (Chi phí cố định + Lợi nhuận mục tiêu) / CM
  const requiredUnits = cmPerOrder.greaterThan(0)
    ? fixedCosts.plus(profit).dividedBy(cmPerOrder)
    : new Decimal(0)

  // Doanh số cần đạt = Đơn hàng × AOV
  const requiredRevenue = requiredUnits.times(aov)

  // Chi phí biến đổi = Đơn hàng × (AOV - CM)
  const variableCostPerOrder = aov.minus(cmPerOrder)
  const totalVariableCosts = requiredUnits.times(
    variableCostPerOrder.greaterThan(0) ? variableCostPerOrder : new Decimal(0)
  )

  return {
    targetProfit,
    requiredRevenue: requiredRevenue.toNumber(),
    requiredUnits: requiredUnits.toNumber(),
    variableCosts: totalVariableCosts.toNumber(),
  }
}
