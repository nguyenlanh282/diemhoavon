# Codebase Analysis Report: Project Saving Mechanism

**Date**: 2026-01-15
**Focus**: Current calculation saving mechanism and project management feature
**Status**: Analysis Complete

---

## Executive Summary

**Current State**: Application has basic calculation history saving but NO project management system. Each calculation saves a snapshot but lacks project context/organization.

**User Issue**: Users want separate projects with individual saved calculations. Current system stores all calculations in flat history without project hierarchy.

**Root Cause**: Missing `Project` model in database schema. `CalculationHistory` directly links to Organization without intermediate project grouping.

---

## 1. Current Saving Mechanism

### SaveCalculationButton Component

**Location**: `C:\Users\Administrator\claude-diemhoavon\src\components\calculator\save-calculation-button.tsx`

**Functionality**:

- Dialog-based UI for saving calculations
- Accepts optional name input (defaults to "Calculation {date}")
- Calls `saveCalculation()` server action
- Shows toast notifications for success/error
- No project selection/context

**Key Code**:

```typescript
const handleSave = async () => {
  setSaving(true)
  try {
    await saveCalculation(name || undefined)
    toast.success(tCommon('success'))
    setOpen(false)
    setName('')
  } catch {
    toast.error(tCommon('error'))
  } finally {
    setSaving(false)
  }
}
```

**Issue**: No project parameter or selection UI.

---

## 2. Server Actions for Saving

### saveCalculation Function

**Location**: `C:\Users\Administrator\claude-diemhoavon\src\lib\actions\calculations.ts`

**Current Implementation**:

```typescript
export async function saveCalculation(name?: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const { input, result } = await calculateCurrentBreakEven()

  const saved = await prisma.calculationHistory.create({
    data: {
      organizationId: session.user.organizationId,
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
  return saved
}
```

**What It Saves**:

- Organization ID and User ID
- Optional name (or auto-generated with date)
- Complete input snapshot (JSON)
- Calculation results (break-even metrics)
- Timestamp (createdAt)

**What's Missing**:

- No project ID reference
- No project context
- Cannot filter calculations by project
- Cannot organize calculations hierarchically

---

## 3. Database Schema Analysis

### Current Schema

**Location**: `C:\Users\Administrator\claude-diemhoavon\prisma\schema.prisma`

**Relevant Models**:

#### Organization Model (Lines 52-66)

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users         User[]
  fixedCosts    FixedCost[]
  variableCosts VariableCost[]
  investments   Investment[]
  products      Product[]
  calculations  CalculationHistory[]

  @@map("organizations")
}
```

#### CalculationHistory Model (Lines 220-244)

```prisma
model CalculationHistory {
  id             String  @id @default(cuid())
  organizationId String  @map("organization_id")
  userId         String  @map("user_id")
  name           String? // user-defined name for this calculation

  // Snapshot of inputs at calculation time
  inputSnapshot Json @map("input_snapshot")

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

**Critical Finding**: NO `Project` model exists in schema.

**Current Data Hierarchy**:

```
Organization
├── User
├── FixedCost
├── VariableCost
├── Investment
├── Product
└── CalculationHistory (flat list, no grouping)
```

**Needed Hierarchy**:

```
Organization
├── User
├── Project (MISSING)
│   ├── FixedCost (scoped to project)
│   ├── VariableCost (scoped to project)
│   ├── Investment (scoped to project)
│   ├── Product (scoped to project)
│   └── CalculationHistory (scoped to project)
```

---

## 4. Current State of Project Management

### Findings:

1. **NO Project Model**: Schema lacks `Project` table
2. **NO Project UI**: No project creation/selection interface
3. **NO Project Scoping**: All data (costs, products, investments) scoped to Organization only
4. **NO Project Context**: SaveCalculationButton has no project awareness

### Search Results:

- Searched for "project" in schema: 0 matches
- Searched for project-related files: 0 files found
- No `/projects` route in app directory

**Conclusion**: Project management feature does NOT exist.

---

## 5. Data Scoping Issue

**Current Behavior**:
All entities (FixedCost, VariableCost, Investment, Product) belong directly to Organization. When user creates products/costs, they're organization-wide, not project-specific.

**Problem**:

- User A creates products for "Project Alpha"
- User B creates products for "Project Beta"
- Both sets mixed in same organization-wide pool
- Calculations pull ALL organization products regardless of intended project
- No isolation between projects

**Example from schema**:

```prisma
model Product {
  organizationId String  @map("organization_id")
  // No projectId field!

  organization Organization @relation(...)
  // No project relation!

  @@index([organizationId, isActive])
  @@map("products")
}
```

---

## 6. History Display

### Location:

- `C:\Users\Administrator\claude-diemhoavon\src\components\dashboard\history-list.tsx`
- `C:\Users\Administrator\claude-diemhoavon\src\app\[locale]\(dashboard)\dashboard\page.tsx`

**Current Implementation**:

```typescript
// Fetches last 5 calculations from organization
const recentHistory = await getCalculationHistory(5)

// Displays flat list with:
// - Calculation name (or "Calculation")
// - Created date and user
// - Break-even units and revenue
```

**Missing**:

- No project filtering
- No project grouping
- No project name display
- Cannot view calculations by project

---

## 7. Calculation Flow Analysis

### Current Flow:

1. User navigates to `/calculator`
2. Page fetches ALL organization data:
   - All fixed costs (organization-wide)
   - All variable costs (organization-wide)
   - All investments (organization-wide)
   - All products (organization-wide)
3. Calculates break-even from ALL organization data
4. User clicks "Save"
5. Saves to CalculationHistory with organization/user ID only

**Issue**: No project context at any step.

### Code from calculator page:

```typescript
// Line 55 - calculates from ALL org data
const { result } = await calculateCurrentBreakEven()

// Line 63 - no project param
<SaveCalculationButton />
```

---

## 8. What's Missing for Project Feature

### Database Layer:

1. **Project Model** with fields:
   - id, name, description
   - organizationId (foreign key)
   - createdAt, updatedAt, deletedAt
   - isActive, isArchived

2. **Schema Updates** to existing models:
   - Add `projectId` to: FixedCost, VariableCost, Investment, Product
   - Add `projectId` to: CalculationHistory
   - Add Project relations to all above models
   - Update indexes to include projectId

3. **Migration Strategy** for existing data:
   - Create default project for existing calculations
   - Migrate orphaned data to default project

### Application Layer:

1. **Project Management UI**:
   - Project list/selector
   - Create/edit/archive project forms
   - Project switching mechanism

2. **Updated Components**:
   - SaveCalculationButton needs project selector
   - Calculator page needs active project context
   - All CRUD forms (products, costs) need project context

3. **Server Actions**:
   - createProject, updateProject, deleteProject
   - getProjects, getActiveProject, setActiveProject
   - Update all existing actions to filter by projectId

4. **Session/Context Management**:
   - Store active projectId in session or context
   - Project switcher in navigation
   - Default project selection logic

### Business Logic:

1. **Project Isolation**:
   - Calculations only use data from active project
   - Cannot mix data across projects
   - Clear project boundaries

2. **Access Control**:
   - Users can only see projects in their organization
   - Role-based project permissions (if needed)

---

## 9. Unresolved Questions

1. **Multi-project vs Single-active**:
   - Should users select one "active" project at a time?
   - Or allow side-by-side project comparison?

2. **Data Migration**:
   - What happens to existing calculations without projectId?
   - Create "Default Project" or "Uncategorized"?

3. **Project Templates**:
   - Should users be able to copy/template projects?
   - Clone products/costs from one project to another?

4. **Project Archival**:
   - Soft delete vs archive projects?
   - Keep calculations from archived projects?

5. **Navigation**:
   - Project selector in header/sidebar?
   - Project-specific routes (e.g., `/projects/:id/calculator`)?

---

## 10. Recommended Next Steps

### Phase 1: Database Schema (Critical)

1. Define Project model in Prisma schema
2. Add projectId foreign keys to dependent models
3. Create migration with default project for existing data
4. Test migration on dev database

### Phase 2: Core Backend (High Priority)

1. Implement project CRUD server actions
2. Update existing actions to filter by projectId
3. Add project context to auth session
4. Revalidate paths for project changes

### Phase 3: UI Components (High Priority)

1. Create ProjectSelector component
2. Update SaveCalculationButton with project context
3. Add project management pages
4. Update calculator page to use active project

### Phase 4: Testing & Migration (Medium Priority)

1. Test with multiple projects
2. Validate data isolation
3. Run production migration
4. User acceptance testing

---

## Appendix: Key Files Referenced

1. **Components**:
   - `src/components/calculator/save-calculation-button.tsx`
   - `src/components/dashboard/history-list.tsx`

2. **Pages**:
   - `src/app/[locale]/(dashboard)/calculator/page.tsx`
   - `src/app/[locale]/(dashboard)/dashboard/page.tsx`

3. **Actions**:
   - `src/lib/actions/calculations.ts`
   - `src/lib/actions/products.ts`
   - `src/lib/actions/fixed-costs.ts`
   - `src/lib/actions/variable-costs.ts`
   - `src/lib/actions/investments.ts`

4. **Schema**:
   - `prisma/schema.prisma`

5. **Calculations**:
   - `src/lib/calculations/break-even.ts`

---

**Report Generated**: 2026-01-15
**Analyst**: System Investigation Agent
