import { PrismaClient } from '../src/generated/prisma/client'
import {
  Role,
  FixedCostCategory,
  VariableCostCategory,
  Frequency,
} from '../src/generated/prisma/client'
import { hash } from 'bcryptjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({} as any)

async function main() {
  console.log('Starting seed...')

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Company',
    },
  })
  console.log('Created organization:', org.name)

  // Create admin user (password: "demo123")
  const hashedPassword = await hash('demo123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create manager user
  await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      name: 'Manager User',
      password: hashedPassword,
      role: Role.MANAGER,
      organizationId: org.id,
    },
  })

  // Create sample fixed costs (VND amounts)
  const fixedCosts = [
    { category: FixedCostCategory.RENT, amount: 15000000, notes: 'Office rent' },
    { category: FixedCostCategory.ELECTRICITY, amount: 3000000, notes: 'Monthly electricity' },
    { category: FixedCostCategory.WATER, amount: 500000, notes: 'Water bill' },
    { category: FixedCostCategory.INTERNET, amount: 800000, notes: 'Internet + phone' },
    { category: FixedCostCategory.SALARY, amount: 50000000, notes: 'Staff salaries' },
    { category: FixedCostCategory.ACCOUNTING, amount: 2000000, notes: 'Accountant fee' },
    { category: FixedCostCategory.MARKETING_AGENCY, amount: 5000000, notes: 'Marketing retainer' },
  ]

  for (const cost of fixedCosts) {
    await prisma.fixedCost.create({
      data: {
        organizationId: org.id,
        category: cost.category,
        amount: cost.amount,
        frequency: Frequency.MONTHLY,
        notes: cost.notes,
      },
    })
  }
  console.log('Created', fixedCosts.length, 'fixed costs')

  // Create sample variable costs
  const variableCosts = [
    { category: VariableCostCategory.VAT, rateValue: 0.1, notes: 'VAT - 10%' },
    { category: VariableCostCategory.COMMISSION, rateValue: 0.05, notes: 'Sales commission - 5%' },
    { category: VariableCostCategory.ADVERTISING, rateValue: 0.08, notes: 'Advertising - 8%' },
  ]

  for (const cost of variableCosts) {
    await prisma.variableCost.create({
      data: {
        organizationId: org.id,
        category: cost.category,
        rateType: 'percentage',
        rateValue: cost.rateValue,
        notes: cost.notes,
      },
    })
  }
  console.log('Created', variableCosts.length, 'variable costs')

  // Create sample investment
  await prisma.investment.create({
    data: {
      organizationId: org.id,
      name: 'Equipment Purchase',
      category: 'equipment',
      totalAmount: 100000000, // 100M VND
      amortizationMonths: 24,
      startDate: new Date(),
      notes: 'Production equipment',
    },
  })
  console.log('Created sample investment')

  // Create sample products
  const products = [
    {
      name: 'Product A',
      sku: 'PRD-A',
      sellingPrice: 500000,
      costPrice: 200000,
      salesMixRatio: 0.4,
    },
    {
      name: 'Product B',
      sku: 'PRD-B',
      sellingPrice: 750000,
      costPrice: 300000,
      salesMixRatio: 0.35,
    },
    {
      name: 'Product C',
      sku: 'PRD-C',
      sellingPrice: 1200000,
      costPrice: 480000,
      salesMixRatio: 0.25,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        organizationId: org.id,
        name: product.name,
        sku: product.sku,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice,
        salesMixRatio: product.salesMixRatio,
      },
    })
  }
  console.log('Created', products.length, 'products')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
