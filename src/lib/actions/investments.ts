'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { investmentSchema, InvestmentInput } from '@/lib/validations/investment'
import { getCurrentProject } from './projects'
import { Decimal } from 'decimal.js'

export async function getInvestments(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  return prisma.investment.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInvestmentById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.investment.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createInvestment(input: InvestmentInput, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = investmentSchema.parse(input)

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const investment = await prisma.investment.create({
    data: {
      name: validated.name,
      category: validated.category,
      totalAmount: new Decimal(validated.totalAmount),
      amortizationMonths: validated.amortizationMonths,
      startDate: validated.startDate,
      notes: validated.notes,
      organizationId: session.user.organizationId,
      projectId: effectiveProjectId,
    },
  })

  revalidatePath('/investments')
  return investment
}

export async function updateInvestment(id: string, input: InvestmentInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = investmentSchema.parse(input)

  const existing = await prisma.investment.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const investment = await prisma.investment.update({
    where: { id },
    data: {
      name: validated.name,
      category: validated.category,
      totalAmount: new Decimal(validated.totalAmount),
      amortizationMonths: validated.amortizationMonths,
      startDate: validated.startDate,
      notes: validated.notes,
    },
  })

  revalidatePath('/investments')
  return investment
}

export async function deleteInvestment(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const existing = await prisma.investment.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  await prisma.investment.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/investments')
}

// Calculate monthly amortization for all active investments
export async function getInvestmentsSummary(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const investments = await prisma.investment.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
  })

  const now = new Date()

  let totalMonthlyAmortization = new Decimal(0)
  let totalOriginalValue = new Decimal(0)
  let totalRemainingValue = new Decimal(0)

  for (const inv of investments) {
    const amount = new Decimal(inv.totalAmount.toString())
    const monthlyAmount = amount.dividedBy(inv.amortizationMonths)

    // Calculate months elapsed
    const startDate = new Date(inv.startDate)
    const monthsElapsed = Math.max(
      0,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    )

    // Check if still amortizing
    if (monthsElapsed < inv.amortizationMonths) {
      totalMonthlyAmortization = totalMonthlyAmortization.plus(monthlyAmount)
    }

    // Calculate remaining value
    const amortized = monthlyAmount.times(Math.min(monthsElapsed, inv.amortizationMonths))
    const remaining = amount.minus(amortized)

    totalOriginalValue = totalOriginalValue.plus(amount)
    totalRemainingValue = totalRemainingValue.plus(Decimal.max(0, remaining))
  }

  return {
    totalMonthlyAmortization: totalMonthlyAmortization.toNumber(),
    totalOriginalValue: totalOriginalValue.toNumber(),
    totalRemainingValue: totalRemainingValue.toNumber(),
    count: investments.length,
  }
}

// Helper to get monthly cost for break-even calculation
export async function getMonthlyInvestmentCost(projectId?: string) {
  const summary = await getInvestmentsSummary(projectId)
  return summary.totalMonthlyAmortization
}
