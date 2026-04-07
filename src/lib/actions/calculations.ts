'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { getVariableCosts } from './variable-costs'
import { getMonthlyInvestmentCost } from './investments'
import { getProducts } from './products'
import { getCurrentProject } from './projects'
import { calculateBreakEven, BreakEvenInput, BreakEvenResult } from '@/lib/calculations/break-even'
import { Decimal } from 'decimal.js'

// Gather all data and calculate break-even
export async function calculateCurrentBreakEven(projectId?: string): Promise<{
  input: BreakEvenInput
  result: BreakEvenResult
}> {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  // Fetch all required data with project filtering
  const [variableCosts, monthlyInvestmentCost, products, fixedCostsData] = await Promise.all([
    getVariableCosts(effectiveProjectId),
    getMonthlyInvestmentCost(effectiveProjectId),
    getProducts(effectiveProjectId),
    prisma.fixedCost.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
        isActive: true,
        deletedAt: null,
      },
    }),
  ])

  // Convert fixed costs to monthly amounts
  const fixedCostsInput = fixedCostsData.map((fc) => {
    const amount = new Decimal(fc.amount.toString())
    let monthlyAmount: Decimal

    switch (fc.frequency) {
      case 'YEARLY':
        monthlyAmount = amount.dividedBy(12)
        break
      case 'QUARTERLY':
        monthlyAmount = amount.dividedBy(3)
        break
      default:
        monthlyAmount = amount
    }

    return {
      category: fc.customLabel || fc.category,
      amount: monthlyAmount.toNumber(),
    }
  })

  // Variable costs input
  const variableCostsInput = variableCosts.map((vc) => ({
    category: vc.customLabel || vc.category,
    rateType: vc.rateType as 'percentage' | 'fixed',
    rateValue: Number(vc.rateValue),
  }))

  // Products input
  const productsInput = products.map((p) => ({
    id: p.id,
    name: p.name,
    sellingPrice: Number(p.sellingPrice),
    costPrice: Number(p.costPrice),
    salesMixRatio: Number(p.salesMixRatio),
  }))

  const input: BreakEvenInput = {
    fixedCosts: fixedCostsInput,
    variableCosts: variableCostsInput,
    monthlyInvestmentCost,
    products: productsInput,
  }

  const result = calculateBreakEven(input)

  return { input, result }
}

// Save calculation to history
export async function saveCalculation(name?: string, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const { input, result } = await calculateCurrentBreakEven(effectiveProjectId)

  const saved = await prisma.calculationHistory.create({
    data: {
      organizationId: session.user.organizationId,
      projectId: effectiveProjectId,
      userId: session.user.id,
      name: name || `Calculation ${new Date().toLocaleDateString()}`,
      inputSnapshot: input as object,
      totalFixedCosts: new Decimal(result.totalFixedCosts),
      totalVariableCostRate: new Decimal(result.totalVariableCostRate / 100),
      averageOrderValue: new Decimal(result.averageOrderValue),
      contributionMargin: new Decimal(result.weightedContributionMargin),
      breakEvenUnits: new Decimal(result.breakEvenUnits),
      breakEvenRevenue: new Decimal(result.breakEvenRevenue),
    },
  })

  revalidatePath('/calculator')
  revalidatePath('/history')
  revalidatePath('/projects')
  return saved
}

// Get calculation history
export async function getCalculationHistory(limit: number = 20, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.calculationHistory.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true, email: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  })
}

// Get single calculation by ID
export async function getCalculationById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.calculationHistory.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })
}
