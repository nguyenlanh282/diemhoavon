'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { variableCostSchema, VariableCostInput } from '@/lib/validations/variable-cost'
import { getCurrentProject } from './projects'
import { Decimal } from 'decimal.js'

export async function getVariableCosts(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  return prisma.variableCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getVariableCostById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.variableCost.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createVariableCost(input: VariableCostInput, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = variableCostSchema.parse(input)

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  // Convert percentage to decimal (10% -> 0.10) for storage
  const rateValue =
    validated.rateType === 'percentage'
      ? new Decimal(validated.rateValue).dividedBy(100)
      : new Decimal(validated.rateValue)

  const cost = await prisma.variableCost.create({
    data: {
      category: validated.category,
      customLabel: validated.customLabel,
      rateType: validated.rateType,
      rateValue,
      perUnit: validated.perUnit,
      notes: validated.notes,
      organizationId: session.user.organizationId,
      projectId: effectiveProjectId,
    },
  })

  revalidatePath('/costs/variable')
  return cost
}

export async function updateVariableCost(id: string, input: VariableCostInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = variableCostSchema.parse(input)

  const existing = await prisma.variableCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const rateValue =
    validated.rateType === 'percentage'
      ? new Decimal(validated.rateValue).dividedBy(100)
      : new Decimal(validated.rateValue)

  const cost = await prisma.variableCost.update({
    where: { id },
    data: {
      category: validated.category,
      customLabel: validated.customLabel,
      rateType: validated.rateType,
      rateValue,
      perUnit: validated.perUnit,
      notes: validated.notes,
    },
  })

  revalidatePath('/costs/variable')
  return cost
}

export async function deleteVariableCost(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const existing = await prisma.variableCost.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  await prisma.variableCost.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/costs/variable')
}

export async function getVariableCostsSummary() {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const costs = await prisma.variableCost.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
  })

  // Sum all percentage-based costs (stored as decimals like 0.10)
  const totalPercentageRate = costs
    .filter((c) => c.rateType === 'percentage')
    .reduce((sum, c) => sum.plus(new Decimal(c.rateValue.toString())), new Decimal(0))

  // Get fixed costs per order
  const fixedPerOrder = costs
    .filter((c) => c.rateType === 'fixed' && c.perUnit === 'per_order')
    .reduce((sum, c) => sum.plus(new Decimal(c.rateValue.toString())), new Decimal(0))

  return {
    totalPercentageRate: totalPercentageRate.times(100).toNumber(), // Display as percentage
    totalPercentageRateDecimal: totalPercentageRate.toNumber(),
    fixedPerOrder: fixedPerOrder.toNumber(),
    count: costs.length,
  }
}
