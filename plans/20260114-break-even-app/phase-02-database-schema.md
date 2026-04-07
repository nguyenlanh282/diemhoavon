# Phase 02: Database Schema

## Context Links

- [Main Plan](./plan.md)
- [Previous: Project Setup](./phase-01-project-setup.md)
- [Research: Break-Even Analysis](../../docs/research-break-even-analysis.md)

---

## Overview

| Field           | Value      |
| --------------- | ---------- |
| Date            | 2026-01-14 |
| Priority        | Critical   |
| Status          | Complete   |
| Completion Date | 2026-01-14 |
| Estimated Time  | 1-2 days   |

---

## Key Insights

- Use Decimal type for all monetary values (avoid floating-point)
- Soft delete pattern for audit trail compliance
- Separate calculation history from current data
- Multi-tenant design with organization-level isolation
- Vietnamese cost categories need bilingual labels

---

## Requirements

1. User and organization management (multi-tenant)
2. Role-based access control (Admin, Manager, User)
3. Fixed costs with categories and recurring frequency
4. Variable costs linked to products/orders
5. Initial investments with monthly amortization
6. Products with pricing and cost breakdown
7. Calculation history with snapshots
8. Audit trail (created_at, updated_at, deleted_at)

---

## Architecture

### Entity Relationship Diagram

```
Organization (1) ──── (N) User
     │
     └──── (N) FixedCost
     └──── (N) VariableCost
     └──── (N) Investment
     └──── (N) Product
     └──── (N) CalculationHistory
```

---

## Related Code Files

| File                   | Purpose                       |
| ---------------------- | ----------------------------- |
| `prisma/schema.prisma` | Complete database schema      |
| `prisma/seed.ts`       | Seed data for development     |
| `src/lib/db/prisma.ts` | Prisma client (from Phase 01) |

---

## Implementation Steps

### Step 1: Define Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ ENUMS ============

enum Role {
  ADMIN
  MANAGER
  USER
}

enum FixedCostCategory {
  RENT
  ELECTRICITY
  WATER
  INTERNET
  SALARY
  LOAN_INTEREST
  OUTSOURCED
  ACCOUNTING
  TAX
  MARKETING_AGENCY
  BRAND_ADVERTISING
  OTHER
}

enum VariableCostCategory {
  COGS
  VAT
  COMMISSION
  ADVERTISING
  OTHER
}

enum Frequency {
  MONTHLY
  QUARTERLY
  YEARLY
}

// ============ ORGANIZATIONS ============

model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users        User[]
  fixedCosts   FixedCost[]
  variableCosts VariableCost[]
  investments  Investment[]
  products     Product[]
  calculations CalculationHistory[]

  @@map("organizations")
}

// ============ USERS ============

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  password       String?   // null for OAuth-only users
  emailVerified  DateTime? @map("email_verified")
  image          String?
  role           Role      @default(USER)
  organizationId String    @map("organization_id")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id])
  accounts     Account[]
  sessions     Session[]
  calculations CalculationHistory[]

  @@map("users")
}

// ============ NEXTAUTH MODELS ============

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============ FIXED COSTS ============

model FixedCost {
  id             String            @id @default(cuid())
  organizationId String            @map("organization_id")
  category       FixedCostCategory
  customLabel    String?           @map("custom_label") // for OTHER category
  amount         Decimal           @db.Decimal(15, 2)
  frequency      Frequency         @default(MONTHLY)
  notes          String?
  isActive       Boolean           @default(true) @map("is_active")
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")
  deletedAt      DateTime?         @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isActive])
  @@map("fixed_costs")
}

// ============ VARIABLE COSTS ============

model VariableCost {
  id             String               @id @default(cuid())
  organizationId String               @map("organization_id")
  category       VariableCostCategory
  customLabel    String?              @map("custom_label")
  rateType       String               @default("percentage") // percentage or fixed
  rateValue      Decimal              @db.Decimal(10, 4) // e.g., 0.10 for 10%
  perUnit        String?              @map("per_unit") // e.g., "per_lead", "per_order"
  notes          String?
  isActive       Boolean              @default(true) @map("is_active")
  createdAt      DateTime             @default(now()) @map("created_at")
  updatedAt      DateTime             @updatedAt @map("updated_at")
  deletedAt      DateTime?            @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isActive])
  @@map("variable_costs")
}

// ============ INVESTMENTS ============

model Investment {
  id               String    @id @default(cuid())
  organizationId   String    @map("organization_id")
  name             String
  category         String
  totalAmount      Decimal   @map("total_amount") @db.Decimal(15, 2)
  amortizationMonths Int     @map("amortization_months")
  startDate        DateTime  @map("start_date")
  notes            String?
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isActive])
  @@map("investments")
}

// ============ PRODUCTS ============

model Product {
  id             String    @id @default(cuid())
  organizationId String    @map("organization_id")
  name           String
  sku            String?
  sellingPrice   Decimal   @map("selling_price") @db.Decimal(15, 2)
  costPrice      Decimal   @map("cost_price") @db.Decimal(15, 2)
  salesMixRatio  Decimal   @default(0) @map("sales_mix_ratio") @db.Decimal(5, 4) // 0.0000 to 1.0000
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isActive])
  @@map("products")
}

// ============ CALCULATION HISTORY ============

model CalculationHistory {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  userId         String   @map("user_id")
  name           String?  // user-defined name for this calculation

  // Snapshot of inputs at calculation time
  inputSnapshot  Json     @map("input_snapshot")

  // Calculation results
  totalFixedCosts       Decimal @map("total_fixed_costs") @db.Decimal(15, 2)
  totalVariableCostRate Decimal @map("total_variable_cost_rate") @db.Decimal(10, 4)
  averageOrderValue     Decimal @map("average_order_value") @db.Decimal(15, 2)
  contributionMargin    Decimal @map("contribution_margin") @db.Decimal(15, 2)
  breakEvenUnits        Decimal @map("break_even_units") @db.Decimal(15, 2)
  breakEvenRevenue      Decimal @map("break_even_revenue") @db.Decimal(15, 2)

  createdAt DateTime @default(now()) @map("created_at")

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@index([organizationId, createdAt])
  @@map("calculation_history")
}
```

### Step 2: Create Migration

```bash
npx prisma migrate dev --name init
```

### Step 3: Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, Role, FixedCostCategory, Frequency } from '@prisma/client'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

async function main() {
  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Company',
    },
  })

  // Create admin user (password: "demo123")
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: '$2b$10$...', // bcrypt hash
      role: Role.ADMIN,
      organizationId: org.id,
    },
  })

  // Create sample fixed costs
  const fixedCosts = [
    { category: FixedCostCategory.RENT, amount: 15000000 },
    { category: FixedCostCategory.ELECTRICITY, amount: 3000000 },
    { category: FixedCostCategory.SALARY, amount: 50000000 },
    { category: FixedCostCategory.INTERNET, amount: 500000 },
  ]

  for (const cost of fixedCosts) {
    await prisma.fixedCost.create({
      data: {
        organizationId: org.id,
        category: cost.category,
        amount: cost.amount,
        frequency: Frequency.MONTHLY,
      },
    })
  }

  console.log('Seed completed')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

### Step 4: Run Seed

```bash
npm install -D tsx
npx prisma db seed
```

---

## Todo List

- [x] Write complete Prisma schema (11 models, 4 enums)
- [x] Create initial migration
- [x] Write seed script with demo data (bcryptjs password hashing)
- [x] Verify all tables created in PostgreSQL
- [x] Test Prisma client type generation
- [x] Document database indexes
- [x] Update types file with Prisma re-exports and bilingual labels
- [x] Verify build success

---

## Success Criteria

1. `npx prisma migrate dev` runs without errors
2. All tables created with correct columns and types
3. Foreign key relationships work correctly
4. Prisma client generates all types
5. Seed script populates demo data

---

## Risk Assessment

| Risk                     | Likelihood | Impact | Mitigation                      |
| ------------------------ | ---------- | ------ | ------------------------------- |
| Decimal precision issues | Medium     | High   | Use Decimal(15,2) for money     |
| Migration conflicts      | Low        | Medium | Use descriptive migration names |
| Index performance        | Low        | Medium | Add indexes for common queries  |

---

## Security Considerations

- Passwords stored as bcrypt hashes (never plaintext)
- Soft delete preserves audit trail
- Organization isolation prevents cross-tenant access
- Sensitive tokens stored in separate Account table

---

## Next Steps

After completion, proceed to [Phase 03: Authentication](./phase-03-authentication.md)
