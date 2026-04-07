import { Decimal } from 'decimal.js'

export interface ForecastInput {
  // Current break-even data
  totalFixedCosts: number
  weightedContributionMargin: number // per order
  averageOrderValue: number
  totalVariableCostRate: number // percentage (0-100)
  totalVariableCostPerOrder: number
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
 * Calculate forecast based on target revenue
 * Given a desired revenue, calculate units needed, variable costs, and profit
 */
export function forecastByRevenue(
  input: ForecastInput,
  targetRevenue: number
): ForecastByRevenueResult {
  const revenue = new Decimal(targetRevenue)
  const aov = new Decimal(input.averageOrderValue)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const variableRate = new Decimal(input.totalVariableCostRate).dividedBy(100)
  const variablePerOrder = new Decimal(input.totalVariableCostPerOrder)

  // Units = Revenue / AOV
  const units = aov.greaterThan(0) ? revenue.dividedBy(aov) : new Decimal(0)

  // Variable costs = (Revenue * variable rate %) + (Units * fixed per order)
  const variableCosts = revenue.times(variableRate).plus(units.times(variablePerOrder))

  // COGS = Units * (AOV - CM per order)
  const cogsPerOrder = aov.minus(input.weightedContributionMargin).minus(variablePerOrder)
  const totalCogs = units.times(cogsPerOrder.greaterThan(0) ? cogsPerOrder : 0)

  // Total variable + COGS
  const totalVariableCosts = variableCosts.plus(totalCogs)

  // Profit = Revenue - Fixed Costs - Variable Costs - COGS
  const profit = revenue.minus(fixedCosts).minus(totalVariableCosts)

  // Profit margin = Profit / Revenue * 100
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
 * Calculate forecast based on target units (orders)
 * Given a desired number of orders, calculate revenue and profit
 */
export function forecastByUnits(input: ForecastInput, targetUnits: number): ForecastByUnitsResult {
  const units = new Decimal(targetUnits)
  const aov = new Decimal(input.averageOrderValue)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const variableRate = new Decimal(input.totalVariableCostRate).dividedBy(100)
  const variablePerOrder = new Decimal(input.totalVariableCostPerOrder)
  const cmPerOrder = new Decimal(input.weightedContributionMargin)

  // Revenue = Units * AOV
  const revenue = units.times(aov)

  // Variable costs = (Revenue * variable rate %) + (Units * fixed per order)
  const variableCosts = revenue.times(variableRate).plus(units.times(variablePerOrder))

  // COGS = Units * (AOV - CM per order - variable per order)
  const cogsPerOrder = aov.minus(cmPerOrder).minus(variablePerOrder)
  const totalCogs = units.times(cogsPerOrder.greaterThan(0) ? cogsPerOrder : 0)

  // Total variable + COGS
  const totalVariableCosts = variableCosts.plus(totalCogs)

  // Profit = Revenue - Fixed Costs - Variable Costs
  const profit = revenue.minus(fixedCosts).minus(totalVariableCosts)

  // Profit margin
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
 * Calculate forecast based on target profit
 * Given a desired profit, calculate required revenue and units
 */
export function forecastByProfit(
  input: ForecastInput,
  targetProfit: number
): ForecastByProfitResult {
  const profit = new Decimal(targetProfit)
  const fixedCosts = new Decimal(input.totalFixedCosts)
  const cmPerOrder = new Decimal(input.weightedContributionMargin)
  const aov = new Decimal(input.averageOrderValue)

  // Required contribution = Fixed Costs + Target Profit
  const requiredContribution = fixedCosts.plus(profit)

  // Required units = Required Contribution / CM per order
  const requiredUnits = cmPerOrder.greaterThan(0)
    ? requiredContribution.dividedBy(cmPerOrder)
    : new Decimal(0)

  // Required revenue = Required Units * AOV
  const requiredRevenue = requiredUnits.times(aov)

  // Variable costs calculation
  const variableRate = new Decimal(input.totalVariableCostRate).dividedBy(100)
  const variablePerOrder = new Decimal(input.totalVariableCostPerOrder)
  const variableCosts = requiredRevenue
    .times(variableRate)
    .plus(requiredUnits.times(variablePerOrder))

  // COGS
  const cogsPerOrder = aov.minus(cmPerOrder).minus(variablePerOrder)
  const totalCogs = requiredUnits.times(cogsPerOrder.greaterThan(0) ? cogsPerOrder : 0)

  return {
    targetProfit,
    requiredRevenue: requiredRevenue.toNumber(),
    requiredUnits: requiredUnits.toNumber(),
    variableCosts: variableCosts.plus(totalCogs).toNumber(),
  }
}
