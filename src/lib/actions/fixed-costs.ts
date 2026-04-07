'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { fixedCostSchema, FixedCostInput } from '@/lib/validations/fixed-cost'
import { getCurrentProject } from './projects'
import { Decimal } from 'decimal.js'

export async function getFixedCosts(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  return prisma.fixedCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFixedCostById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.fixedCost.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createFixedCost(input: FixedCostInput, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = fixedCostSchema.parse(input)

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const cost = await prisma.fixedCost.create({
    data: {
      category: validated.category,
      customLabel: validated.customLabel || null,
      amount: new Decimal(validated.amount),
      frequency: validated.frequency,
      notes: validated.notes || null,
      organizationId: session.user.organizationId,
      projectId: effectiveProjectId,
    },
  })

  revalidatePath('/costs/fixed')
  return cost
}

export async function updateFixedCost(id: string, input: FixedCostInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = fixedCostSchema.parse(input)

  // Verify ownership
  const existing = await prisma.fixedCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const cost = await prisma.fixedCost.update({
    where: { id },
    data: {
      category: validated.category,
      customLabel: validated.customLabel || null,
      amount: new Decimal(validated.amount),
      frequency: validated.frequency,
      notes: validated.notes || null,
    },
  })

  revalidatePath('/costs/fixed')
  return cost
}

export async function deleteFixedCost(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Verify ownership
  const existing = await prisma.fixedCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  // Soft delete
  await prisma.fixedCost.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/costs/fixed')
}

export async function getFixedCostsSummary(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const costs = await prisma.fixedCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
  })

  // Convert all to monthly equivalent
  const monthlyTotal = costs.reduce((sum, cost) => {
    const amount = new Decimal(cost.amount.toString())
    switch (cost.frequency) {
      case 'YEARLY':
        return sum.plus(amount.dividedBy(12))
      case 'QUARTERLY':
        return sum.plus(amount.dividedBy(3))
      default:
        return sum.plus(amount)
    }
  }, new Decimal(0))

  return {
    monthlyTotal: monthlyTotal.toNumber(),
    yearlyTotal: monthlyTotal.times(12).toNumber(),
    count: costs.length,
  }
}
