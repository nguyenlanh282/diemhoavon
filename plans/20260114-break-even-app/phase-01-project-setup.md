# Phase 01: Project Setup

## Context Links

- [Main Plan](./plan.md)
- [Tech Stack](../../docs/tech-stack.md)

---

## Overview

| Field           | Value      |
| --------------- | ---------- |
| Date            | 2026-01-14 |
| Priority        | Critical   |
| Status          | Complete   |
| Estimated Time  | 2-3 days   |
| Completion Date | 2026-01-14 |

---

## Key Insights

- Next.js 15 App Router provides RSC and Server Actions for server-side financial calculations
- Prisma 5 offers type-safe database access with automatic TypeScript generation
- shadcn/ui components are copy-paste, avoiding version lock-in
- Decimal.js required for precise financial calculations (avoid floating-point errors)

---

## Requirements

1. Initialize Next.js 15 with TypeScript and App Router
2. Configure Prisma 5 with PostgreSQL 16
3. Set up shadcn/ui with Tailwind CSS
4. Install core dependencies (React Hook Form, Zod, Decimal.js)
5. Configure ESLint, Prettier, Husky for code quality
6. Create base project structure

---

## Architecture

```
C:\Users\Administrator\claude-diemhoavon\
  src/
    app/
      layout.tsx           # Root layout with providers
      page.tsx             # Landing/redirect
      globals.css          # Tailwind base styles
    components/
      ui/                  # shadcn/ui components
    lib/
      db/
        prisma.ts          # Prisma client singleton
      utils.ts             # cn() and helpers
    types/
      index.ts             # Shared TypeScript types
  prisma/
    schema.prisma          # Database schema
  .env                     # Environment variables
  .env.example             # Template for env vars
  next.config.ts           # Next.js config
  tailwind.config.ts       # Tailwind config
  tsconfig.json            # TypeScript config
```

---

## Related Code Files

| File                   | Purpose                                |
| ---------------------- | -------------------------------------- |
| `src/app/layout.tsx`   | Root layout with fonts, metadata       |
| `src/lib/db/prisma.ts` | Prisma client singleton for serverless |
| `prisma/schema.prisma` | Database schema definition             |
| `.env.example`         | Environment variable template          |

---

## Implementation Steps

### Step 1: Initialize Next.js Project

```bash
cd C:\Users\Administrator\claude-diemhoavon
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Step 2: Install Core Dependencies

```bash
npm install prisma @prisma/client decimal.js
npm install react-hook-form @hookform/resolvers zod
npm install -D @types/node vitest @vitest/ui
```

### Step 3: Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

### Step 4: Configure Prisma Client Singleton

Create `src/lib/db/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Step 5: Set Up shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card form toast
```

### Step 6: Configure Environment Variables

Create `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/breakeven?schema=public"

# Auth (Phase 03)
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Phase 10)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

### Step 7: Configure Git Hooks

```bash
npm install -D husky lint-staged prettier
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Step 8: Create Base Types

Create `src/types/index.ts`:

```typescript
import { Decimal } from 'decimal.js'

export type CostCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'internet'
  | 'salary'
  | 'loan_interest'
  | 'outsourced'
  | 'accounting'
  | 'tax'
  | 'marketing'
  | 'brand'
  | 'other'

export type VariableCostCategory = 'cogs' | 'vat' | 'commission' | 'advertising' | 'other'

export interface MoneyValue {
  amount: Decimal
  currency: 'VND' | 'USD'
}
```

---

## Todo List

- [x] Initialize Next.js 15 project (with TypeScript, Tailwind CSS v4, ESLint)
- [x] Install and configure Prisma 7 (PostgreSQL)
- [x] Set up shadcn/ui components (15 components installed)
- [x] Create Prisma client singleton
- [x] Configure environment variables
- [x] Set up ESLint, Prettier, Husky, lint-staged
- [x] Create base TypeScript types
- [x] Verify project builds successfully

---

## Success Criteria

1. `npm run dev` starts development server without errors
2. `npm run build` completes successfully
3. Prisma client generates types without errors
4. shadcn/ui Button component renders correctly
5. ESLint and Prettier run on pre-commit

---

## Risk Assessment

| Risk                            | Likelihood | Impact | Mitigation            |
| ------------------------------- | ---------- | ------ | --------------------- |
| Node.js version incompatibility | Low        | High   | Use Node.js 20 LTS    |
| PostgreSQL connection issues    | Medium     | High   | Test connection early |
| shadcn/ui config conflicts      | Low        | Low    | Follow official docs  |

---

## Security Considerations

- Never commit `.env` file (add to `.gitignore`)
- Use strong `NEXTAUTH_SECRET` (32+ chars)
- Database credentials stored only in environment
- Enable Prisma query logging only in development

---

## Next Steps

After completion, proceed to [Phase 02: Database Schema](./phase-02-database-schema.md)
