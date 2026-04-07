'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { productSchema, ProductInput } from '@/lib/validations/product'
import { getCurrentProject } from './projects'
import { Decimal } from 'decimal.js'

export async function getProducts(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  return prisma.product.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProductById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  return prisma.product.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })
}

export async function createProduct(input: ProductInput, projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = productSchema.parse(input)

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      sku: validated.sku,
      sellingPrice: new Decimal(validated.sellingPrice),
      costPrice: new Decimal(validated.costPrice),
      salesMixRatio: new Decimal(validated.salesMixRatio),
      organizationId: session.user.organizationId,
      projectId: effectiveProjectId,
    },
  })

  revalidatePath('/products')
  return product
}

export async function updateProduct(id: string, input: ProductInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = productSchema.parse(input)

  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: validated.name,
      sku: validated.sku,
      sellingPrice: new Decimal(validated.sellingPrice),
      costPrice: new Decimal(validated.costPrice),
      salesMixRatio: new Decimal(validated.salesMixRatio),
    },
  })

  revalidatePath('/products')
  return product
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!existing) throw new Error('Not found')

  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  revalidatePath('/products')
}

// Update sales mix for multiple products at once
export async function updateSalesMix(updates: { id: string; salesMixRatio: number }[]) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Validate total equals 1
  const total = updates.reduce((sum, u) => sum + u.salesMixRatio, 0)
  if (Math.abs(total - 1) > 0.001) {
    throw new Error('Sales mix must total 100%')
  }

  // Update all products
  await Promise.all(
    updates.map((u) =>
      prisma.product.update({
        where: { id: u.id },
        data: { salesMixRatio: new Decimal(u.salesMixRatio) },
      })
    )
  )

  revalidatePath('/products')
}

// Calculate key metrics for break-even
export async function getProductsSummary(projectId?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Get current project if not provided
  let effectiveProjectId = projectId
  if (!effectiveProjectId) {
    const currentProject = await getCurrentProject()
    effectiveProjectId = currentProject?.id
  }

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(effectiveProjectId ? { projectId: effectiveProjectId } : {}),
      isActive: true,
      deletedAt: null,
    },
  })

  if (products.length === 0) {
    return {
      averageOrderValue: 0,
      weightedContributionMargin: 0,
      totalProducts: 0,
      salesMixValid: false,
    }
  }

  // Check if sales mix is valid (sums to ~1)
  const mixTotal = products.reduce(
    (sum, p) => sum.plus(new Decimal(p.salesMixRatio.toString())),
    new Decimal(0)
  )
  const salesMixValid = mixTotal.greaterThan(0.99) && mixTotal.lessThan(1.01)

  // Calculate weighted contribution margin
  // CM = (Selling Price - Cost Price) * Sales Mix Ratio
  let weightedCM = new Decimal(0)
  let weightedAOV = new Decimal(0)

  for (const product of products) {
    const sellingPrice = new Decimal(product.sellingPrice.toString())
    const costPrice = new Decimal(product.costPrice.toString())
    const mixRatio = new Decimal(product.salesMixRatio.toString())

    const contributionMargin = sellingPrice.minus(costPrice)
    weightedCM = weightedCM.plus(contributionMargin.times(mixRatio))
    weightedAOV = weightedAOV.plus(sellingPrice.times(mixRatio))
  }

  return {
    averageOrderValue: weightedAOV.toNumber(),
    weightedContributionMargin: weightedCM.toNumber(),
    totalProducts: products.length,
    salesMixValid,
  }
}
