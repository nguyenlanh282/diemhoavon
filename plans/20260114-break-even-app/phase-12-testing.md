# Phase 12: Testing

## Context Links

- [Main Plan](./plan.md)
- [Previous: Dashboard UI](./phase-11-dashboard-ui.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | High       |
| Status         | Pending    |
| Estimated Time | 1 week     |

---

## Key Insights

- Vitest for unit and integration tests (fast, Vite-compatible)
- Playwright for end-to-end tests (cross-browser)
- Focus on critical paths: auth, calculations, data persistence
- Mock external services (SMTP, OAuth)
- Test both Vietnamese and English locales

---

## Requirements

1. Unit tests for calculation engine
2. Integration tests for server actions
3. E2E tests for critical user flows
4. Test authentication flows
5. Test i18n rendering
6. Minimum 80% code coverage for core logic
7. CI/CD pipeline integration

---

## Architecture

```
tests/
  unit/
    calculations/
      break-even.test.ts      # Calculation engine tests
    validations/
      fixed-cost.test.ts      # Zod schema tests
  integration/
    actions/
      fixed-costs.test.ts     # Server action tests
      calculations.test.ts    # Calculation action tests
  e2e/
    auth.spec.ts              # Authentication flows
    costs.spec.ts             # Cost management flows
    calculator.spec.ts        # Calculator flow
    i18n.spec.ts              # Locale switching
vitest.config.ts              # Vitest configuration
playwright.config.ts          # Playwright configuration
```

---

## Related Code Files

| File                                         | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `vitest.config.ts`                           | Unit/integration test config |
| `playwright.config.ts`                       | E2E test config              |
| `tests/unit/calculations/break-even.test.ts` | Core calculation tests       |
| `tests/e2e/auth.spec.ts`                     | Auth flow tests              |

---

## Implementation Steps

### Step 1: Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/db/prisma.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import { beforeAll, afterAll, afterEach } from 'vitest'
import { prisma } from '@/lib/db/prisma'

// Setup test database
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

afterEach(async () => {
  // Clean up test data if needed
})
```

### Step 2: Unit Tests - Calculation Engine

Create `tests/unit/calculations/break-even.test.ts`:

```typescript
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
    }

    const result = calculateBreakEven(zeroCMInput)
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
    expect(result.productBreakdown[0].salesMixRatio).toBe(1)
  })

  it('should include investment in fixed costs breakdown', () => {
    const result = calculateBreakEven(baseInput)

    const investmentEntry = result.fixedCostsBreakdown.find(
      (fc) => fc.category === 'Investment Amortization'
    )

    expect(investmentEntry).toBeDefined()
    expect(investmentEntry?.amount).toBe(5000000)
  })
})
```

### Step 3: Unit Tests - Validation Schemas

Create `tests/unit/validations/fixed-cost.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { fixedCostSchema } from '@/lib/validations/fixed-cost'

describe('Fixed Cost Validation', () => {
  it('should validate valid fixed cost', () => {
    const validCost = {
      category: 'RENT',
      amount: 15000000,
      frequency: 'MONTHLY',
    }

    const result = fixedCostSchema.safeParse(validCost)
    expect(result.success).toBe(true)
  })

  it('should reject negative amount', () => {
    const invalidCost = {
      category: 'RENT',
      amount: -1000,
      frequency: 'MONTHLY',
    }

    const result = fixedCostSchema.safeParse(invalidCost)
    expect(result.success).toBe(false)
  })

  it('should require customLabel for OTHER category', () => {
    const otherWithoutLabel = {
      category: 'OTHER',
      amount: 1000000,
      frequency: 'MONTHLY',
    }

    const result = fixedCostSchema.safeParse(otherWithoutLabel)
    expect(result.success).toBe(false)
  })

  it('should accept OTHER with customLabel', () => {
    const otherWithLabel = {
      category: 'OTHER',
      customLabel: 'Custom Expense',
      amount: 1000000,
      frequency: 'MONTHLY',
    }

    const result = fixedCostSchema.safeParse(otherWithLabel)
    expect(result.success).toBe(true)
  })

  it('should coerce string amounts to numbers', () => {
    const stringAmount = {
      category: 'RENT',
      amount: '15000000',
      frequency: 'MONTHLY',
    }

    const result = fixedCostSchema.safeParse(stringAmount)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(typeof result.data.amount).toBe('number')
    }
  })
})
```

### Step 4: Integration Tests - Server Actions

Create `tests/integration/actions/fixed-costs.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      organizationId: 'test-org-id',
    },
  })),
}))

// Mock prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    fixedCost: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db/prisma'
import { getFixedCosts, createFixedCost, getFixedCostsSummary } from '@/lib/actions/fixed-costs'

describe('Fixed Costs Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFixedCosts', () => {
    it('should fetch fixed costs for organization', async () => {
      const mockCosts = [
        { id: '1', category: 'RENT', amount: 15000000 },
        { id: '2', category: 'SALARY', amount: 50000000 },
      ]

      vi.mocked(prisma.fixedCost.findMany).mockResolvedValue(mockCosts as any)

      const result = await getFixedCosts()

      expect(prisma.fixedCost.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'test-org-id',
          isActive: true,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockCosts)
    })
  })

  describe('createFixedCost', () => {
    it('should create fixed cost with valid input', async () => {
      const input = {
        category: 'RENT' as const,
        amount: 15000000,
        frequency: 'MONTHLY' as const,
      }

      vi.mocked(prisma.fixedCost.create).mockResolvedValue({
        id: 'new-id',
        ...input,
      } as any)

      const result = await createFixedCost(input)

      expect(prisma.fixedCost.create).toHaveBeenCalled()
      expect(result.category).toBe('RENT')
    })
  })

  describe('getFixedCostsSummary', () => {
    it('should calculate monthly totals correctly', async () => {
      const mockCosts = [
        { amount: { toString: () => '15000000' }, frequency: 'MONTHLY' },
        { amount: { toString: () => '120000000' }, frequency: 'YEARLY' },
      ]

      vi.mocked(prisma.fixedCost.findMany).mockResolvedValue(mockCosts as any)

      const result = await getFixedCostsSummary()

      // 15M monthly + 120M yearly (10M monthly) = 25M monthly
      expect(result.monthlyTotal).toBe(25000000)
      expect(result.yearlyTotal).toBe(300000000)
    })
  })
})
```

### Step 5: Configure Playwright

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Step 6: E2E Tests - Authentication

Create `tests/e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/vi/login')

    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder(/mật khẩu/i)).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/vi/login')

    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Should show validation errors
    await expect(page.getByText(/email/i)).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/vi/login')

    await page.getByText(/đăng ký/i).click()

    await expect(page).toHaveURL(/\/vi\/register/)
  })

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/vi/login')

    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/vi/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/vi\/login/)
  })
})
```

### Step 7: E2E Tests - Calculator Flow

Create `tests/e2e/calculator.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Calculator', () => {
  test.beforeEach(async ({ page }) => {
    // Login (mock or use test credentials)
    await page.goto('/vi/login')
    await page.getByPlaceholder('Email').fill('test@example.com')
    await page.getByPlaceholder(/mật khẩu/i).fill('password123')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/)
  })

  test('should navigate to calculator page', async ({ page }) => {
    await page.getByRole('link', { name: /calculator/i }).click()

    await expect(page).toHaveURL(/\/calculator/)
  })

  test('should display break-even results when data exists', async ({ page }) => {
    await page.goto('/vi/calculator')

    // Should show result cards
    await expect(page.getByText(/điểm hòa vốn/i)).toBeVisible()
  })

  test('should save calculation to history', async ({ page }) => {
    await page.goto('/vi/calculator')

    // Click save button
    await page.getByRole('button', { name: /lưu/i }).click()

    // Fill in name
    await page.getByPlaceholder(/tên/i).fill('Test Calculation')
    await page.getByRole('button', { name: /lưu/i }).click()

    // Should show success message
    await expect(page.getByText(/thành công/i)).toBeVisible()
  })
})
```

### Step 8: E2E Tests - i18n

Create `tests/e2e/i18n.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Internationalization', () => {
  test('should display Vietnamese by default', async ({ page }) => {
    await page.goto('/vi/login')

    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    await expect(page.getByPlaceholder(/mật khẩu/i)).toBeVisible()
  })

  test('should display English when locale is en', async ({ page }) => {
    await page.goto('/en/login')

    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
  })

  test('should switch language via switcher', async ({ page }) => {
    await page.goto('/vi/login')

    // Click EN button
    await page.getByRole('button', { name: 'EN' }).click()

    // Should redirect to English
    await expect(page).toHaveURL(/\/en\/login/)
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('should format currency in Vietnamese', async ({ page }) => {
    // Need to be logged in
    await page.goto('/vi/dashboard')

    // Currency should be in VND format
    await expect(page.getByText(/\u20ab|\d{1,3}(\.\d{3})*(\,\d{2})?/)).toBeVisible()
  })
})
```

### Step 9: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Todo List

- [ ] Configure Vitest
- [ ] Write unit tests for calculation engine
- [ ] Write unit tests for validation schemas
- [ ] Write integration tests for server actions
- [ ] Configure Playwright
- [ ] Write E2E tests for authentication
- [ ] Write E2E tests for calculator flow
- [ ] Write E2E tests for i18n
- [ ] Set up CI/CD pipeline
- [ ] Achieve 80% code coverage

---

## Success Criteria

1. All unit tests pass
2. All integration tests pass
3. All E2E tests pass on Chrome, Firefox, mobile
4. Code coverage >= 80% for core logic
5. Tests run in CI/CD pipeline
6. No flaky tests

---

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                    |
| ----------------------- | ---------- | ------ | ----------------------------- |
| Flaky E2E tests         | High       | Medium | Use proper waits, retries     |
| Test database pollution | Medium     | High   | Use transactions, cleanup     |
| CI timeout              | Medium     | Low    | Optimize test parallelization |

---

## Security Considerations

- Test credentials not in version control
- Test database isolated from production
- Mock external services (OAuth, SMTP)
- No sensitive data in test fixtures

---

## Next Steps

After testing is complete:

1. Deploy to staging environment
2. Conduct user acceptance testing
3. Performance optimization
4. Production deployment
