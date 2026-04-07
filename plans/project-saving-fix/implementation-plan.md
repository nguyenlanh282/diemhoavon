# Project Management Feature - Implementation Plan

## Executive Summary

Add Project model to enable users to organize calculation data into separate projects. Each project contains its own products, costs, investments, and calculation history. Users can create, select, and switch between projects while maintaining backward compatibility with existing organization-scoped data.

---

## Current State Analysis

### Database Models (Organization-scoped only)

- `FixedCost` - has `organizationId`
- `VariableCost` - has `organizationId`
- `Investment` - has `organizationId`
- `Product` - has `organizationId`
- `CalculationHistory` - has `organizationId` and `userId`

### Key Files

- `prisma/schema.prisma` - Database schema
- `src/lib/actions/calculations.ts` - Save/retrieve calculations
- `src/lib/actions/products.ts` - Product CRUD
- `src/lib/actions/fixed-costs.ts` - Fixed cost CRUD
- `src/components/calculator/save-calculation-button.tsx` - Save UI
- `src/components/dashboard/history-list.tsx` - History display
- `src/app/[locale]/(dashboard)/calculator/page.tsx` - Calculator page
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` - Dashboard page

### Current Flow

1. User accesses calculator page
2. System fetches all products/costs/investments for organization
3. Break-even calculation performed
4. SaveCalculationButton saves to CalculationHistory with org context only

---

## Phase 1: Database Schema Extension

### Goal

Add Project model and link existing entities to projects.

### 1.1 Add Project Model to Schema

**File:** `prisma/schema.prisma`

```prisma
model Project {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  name           String
  description    String?
  isDefault      Boolean  @default(false) @map("is_default")
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  organization   Organization        @relation(fields: [organizationId], references: [id])
  fixedCosts     FixedCost[]
  variableCosts  VariableCost[]
  investments    Investment[]
  products       Product[]
  calculations   CalculationHistory[]

  @@unique([organizationId, name])
  @@index([organizationId, isActive])
  @@map("projects")
}
```

### 1.2 Update Existing Models with Optional projectId

Add to each model (FixedCost, VariableCost, Investment, Product, CalculationHistory):

```prisma
projectId String? @map("project_id")
project   Project? @relation(fields: [projectId], references: [id])
```

### 1.3 Update Organization Model

Add relation:

```prisma
projects Project[]
```

### Deliverables

- [ ] Updated `prisma/schema.prisma`
- [ ] Migration file created

---

## Phase 2: Database Migration Strategy

### Goal

Migrate existing data safely with zero downtime.

### 2.1 Migration Script

Create migration that:

1. Adds Project table
2. Adds nullable `project_id` column to affected tables
3. Creates default project per organization for existing data
4. Updates existing records to reference default project
5. (Optional later) Make `project_id` required after data migrated

**Migration SQL Outline:**

```sql
-- Step 1: Create projects table
CREATE TABLE projects (...);

-- Step 2: Add project_id columns (nullable)
ALTER TABLE fixed_costs ADD COLUMN project_id TEXT;
ALTER TABLE variable_costs ADD COLUMN project_id TEXT;
ALTER TABLE investments ADD COLUMN project_id TEXT;
ALTER TABLE products ADD COLUMN project_id TEXT;
ALTER TABLE calculation_history ADD COLUMN project_id TEXT;

-- Step 3: Create default project per organization
INSERT INTO projects (id, organization_id, name, is_default, is_active, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Default Project', true, true, NOW(), NOW()
FROM organizations;

-- Step 4: Assign existing data to default projects
UPDATE fixed_costs SET project_id = (
  SELECT id FROM projects WHERE organization_id = fixed_costs.organization_id AND is_default = true
);
-- Repeat for other tables

-- Step 5: Add foreign key constraints
ALTER TABLE fixed_costs ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id);
-- Repeat for other tables

-- Step 6: Add indexes
CREATE INDEX idx_fixed_costs_project ON fixed_costs(project_id);
-- Repeat for other tables
```

### 2.2 Rollback Strategy

Keep `organizationId` on all models for backward compatibility. If migration fails:

1. Drop `project_id` columns
2. Drop projects table
3. Application continues working with org-only scoping

### Deliverables

- [ ] Migration file: `prisma/migrations/XXXXXX_add_projects/migration.sql`
- [ ] Prisma client regenerated
- [ ] Rollback procedure documented

---

## Phase 3: Server Actions Layer

### Goal

Update server actions to support project context.

### 3.1 New Project Actions

**File:** `src/lib/actions/projects.ts`

```typescript
// CRUD operations
export async function getProjects(): Promise<Project[]>
export async function getProjectById(id: string): Promise<Project | null>
export async function createProject(input: ProjectInput): Promise<Project>
export async function updateProject(id: string, input: ProjectInput): Promise<Project>
export async function deleteProject(id: string): Promise<void>
export async function setDefaultProject(id: string): Promise<void>
export async function getCurrentProject(): Promise<Project | null>
```

### 3.2 Update Existing Actions

Modify all data-fetching actions to accept optional `projectId`:

**File:** `src/lib/actions/products.ts`

```typescript
export async function getProducts(projectId?: string) {
  // If projectId provided, filter by project
  // If not, return all for organization (backward compat)
}
```

Same pattern for:

- `src/lib/actions/fixed-costs.ts`
- `src/lib/actions/variable-costs.ts`
- `src/lib/actions/investments.ts`

### 3.3 Update Calculations Actions

**File:** `src/lib/actions/calculations.ts`

```typescript
export async function calculateCurrentBreakEven(projectId?: string) {
  // Fetch data scoped to project if provided
}

export async function saveCalculation(name?: string, projectId?: string) {
  // Save with project context
}

export async function getCalculationHistory(limit?: number, projectId?: string) {
  // Filter by project if provided
}
```

### 3.4 Validation Schema

**File:** `src/lib/validations/project.ts`

```typescript
import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
```

### Deliverables

- [ ] `src/lib/actions/projects.ts` - New file
- [ ] `src/lib/validations/project.ts` - New file
- [ ] Updated `src/lib/actions/products.ts`
- [ ] Updated `src/lib/actions/fixed-costs.ts`
- [ ] Updated `src/lib/actions/variable-costs.ts`
- [ ] Updated `src/lib/actions/investments.ts`
- [ ] Updated `src/lib/actions/calculations.ts`

---

## Phase 4: Project Context Management

### Goal

Implement project selection state management.

### 4.1 Project Context Provider

**Option A: URL-based (Recommended)**

- Project ID in URL: `/[locale]/(dashboard)/projects/[projectId]/calculator`
- Clean URLs, shareable, bookmarkable
- Server-side rendering friendly

**Option B: Cookie/Session-based**

- Store selected project in cookie
- Less URL pollution
- Requires client-side state management

### Recommendation: Use URL-based approach

### 4.2 Route Structure Update

Current:

```
/[locale]/(dashboard)/calculator
/[locale]/(dashboard)/products
/[locale]/(dashboard)/costs/fixed
```

New:

```
/[locale]/(dashboard)/projects                    # Project list
/[locale]/(dashboard)/projects/new                # Create project
/[locale]/(dashboard)/projects/[projectId]        # Project dashboard
/[locale]/(dashboard)/projects/[projectId]/calculator
/[locale]/(dashboard)/projects/[projectId]/products
/[locale]/(dashboard)/projects/[projectId]/costs/fixed
```

### 4.3 Alternative: Keep current routes + project selector

Add project selector component in header/sidebar:

- Dropdown shows all projects
- Selection stored in cookie
- All existing routes read from cookie
- Minimal route changes

### Recommendation

Start with cookie-based selector for minimal disruption, migrate to URL-based later if needed.

### 4.4 Project Selector Component

**File:** `src/components/projects/project-selector.tsx`

```typescript
'use client'

export function ProjectSelector({
  projects,
  currentProjectId,
}: {
  projects: Project[]
  currentProjectId: string | null
}) {
  // Dropdown to select project
  // Updates cookie on selection
  // Triggers page refresh/revalidation
}
```

### 4.5 Server-side Project Resolution

**File:** `src/lib/project-context.ts`

```typescript
import { cookies } from 'next/headers'

export async function getCurrentProjectId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('currentProjectId')?.value || null
}

export async function setCurrentProjectId(projectId: string): Promise<void> {
  // Set cookie via server action
}
```

### Deliverables

- [ ] `src/components/projects/project-selector.tsx`
- [ ] `src/lib/project-context.ts`
- [ ] Cookie-based project state management
- [ ] Integration with header/sidebar

---

## Phase 5: UI Components

### Goal

Create project management UI and update existing components.

### 5.1 Projects List Page

**File:** `src/app/[locale]/(dashboard)/projects/page.tsx`

Features:

- List all projects for organization
- Show project stats (products count, calculations count)
- Create new project button
- Edit/Delete actions
- Set as default action

### 5.2 Create/Edit Project Form

**File:** `src/components/projects/project-form.tsx`

Fields:

- Name (required)
- Description (optional)

### 5.3 Update SaveCalculationButton

**File:** `src/components/calculator/save-calculation-button.tsx`

Changes:

- Accept `projectId` prop
- Pass to `saveCalculation()` action
- Show current project name in dialog

### 5.4 Update HistoryList

**File:** `src/components/dashboard/history-list.tsx`

Changes:

- Accept optional `projectId` filter
- Show project name badge if viewing org-wide

### 5.5 Update Header/Sidebar

**File:** `src/components/layout/header.tsx` or `src/components/layout/sidebar.tsx`

Changes:

- Add ProjectSelector component
- Show current project name

### Deliverables

- [ ] `src/app/[locale]/(dashboard)/projects/page.tsx`
- [ ] `src/app/[locale]/(dashboard)/projects/new/page.tsx`
- [ ] `src/app/[locale]/(dashboard)/projects/[id]/edit/page.tsx`
- [ ] `src/components/projects/project-form.tsx`
- [ ] `src/components/projects/project-card.tsx`
- [ ] Updated `save-calculation-button.tsx`
- [ ] Updated `history-list.tsx`
- [ ] Updated header/sidebar with project selector

---

## Phase 6: Integration and Testing

### Goal

Wire everything together and test.

### 6.1 Update Calculator Page

**File:** `src/app/[locale]/(dashboard)/calculator/page.tsx`

Changes:

- Get current project from context
- Pass projectId to `calculateCurrentBreakEven()`
- Pass projectId to `SaveCalculationButton`

### 6.2 Update Dashboard Page

**File:** `src/app/[locale]/(dashboard)/dashboard/page.tsx`

Changes:

- Show project-specific metrics when project selected
- Show org-wide metrics when no project selected
- Add link to projects page

### 6.3 Update Navigation

Add "Projects" link to sidebar navigation.

### 6.4 Testing Checklist

- [ ] Create new project
- [ ] Switch between projects
- [ ] Add product to project
- [ ] Calculate break-even for project
- [ ] Save calculation with project context
- [ ] View calculation history by project
- [ ] Delete project (soft delete)
- [ ] Default project behavior
- [ ] Existing data accessible in default project

### Deliverables

- [ ] Fully integrated project feature
- [ ] All tests passing
- [ ] Manual testing completed

---

## Phase 7: Polish and Documentation

### Goal

Finalize UX and document changes.

### 7.1 UX Improvements

- Empty state for new projects
- Onboarding flow for first project
- Project quick-switch keyboard shortcut
- Project color/icon customization (optional)

### 7.2 Translations

Update translation files:

- `messages/en.json`
- `messages/vi.json`

Add keys for:

- Project (singular/plural)
- Create Project
- Select Project
- Default Project
- Project description placeholders

### 7.3 Documentation

- Update README if needed
- Add inline code comments

### Deliverables

- [ ] Updated translation files
- [ ] UX polish complete
- [ ] Documentation updated

---

## Implementation Timeline

| Phase                   | Duration  | Dependencies |
| ----------------------- | --------- | ------------ |
| Phase 1: Schema         | 1-2 hours | None         |
| Phase 2: Migration      | 1-2 hours | Phase 1      |
| Phase 3: Server Actions | 2-3 hours | Phase 2      |
| Phase 4: Context        | 1-2 hours | Phase 3      |
| Phase 5: UI Components  | 3-4 hours | Phase 4      |
| Phase 6: Integration    | 2-3 hours | Phase 5      |
| Phase 7: Polish         | 1-2 hours | Phase 6      |

**Total Estimated Time: 11-18 hours**

---

## Risk Assessment

| Risk                       | Likelihood | Impact | Mitigation                           |
| -------------------------- | ---------- | ------ | ------------------------------------ |
| Data migration failure     | Low        | High   | Keep org scoping, rollback procedure |
| Breaking existing features | Medium     | High   | Phased rollout, feature flag         |
| Performance degradation    | Low        | Medium | Proper indexes, query optimization   |
| UX confusion               | Medium     | Medium | Clear project indicator, docs        |

---

## Success Criteria

1. Users can create and name projects
2. Data (products, costs, investments) can be scoped to projects
3. Calculations are saved with project context
4. Users can view calculation history per project
5. Existing data migrated to default project
6. No regression in existing functionality

---

## File Changes Summary

### New Files

```
src/lib/actions/projects.ts
src/lib/validations/project.ts
src/lib/project-context.ts
src/components/projects/project-selector.tsx
src/components/projects/project-form.tsx
src/components/projects/project-card.tsx
src/app/[locale]/(dashboard)/projects/page.tsx
src/app/[locale]/(dashboard)/projects/new/page.tsx
src/app/[locale]/(dashboard)/projects/[id]/edit/page.tsx
prisma/migrations/XXXXXX_add_projects/migration.sql
```

### Modified Files

```
prisma/schema.prisma
src/types/index.ts
src/lib/actions/calculations.ts
src/lib/actions/products.ts
src/lib/actions/fixed-costs.ts
src/lib/actions/variable-costs.ts
src/lib/actions/investments.ts
src/components/calculator/save-calculation-button.tsx
src/components/dashboard/history-list.tsx
src/components/layout/sidebar.tsx (or header.tsx)
src/app/[locale]/(dashboard)/calculator/page.tsx
src/app/[locale]/(dashboard)/dashboard/page.tsx
messages/en.json
messages/vi.json
```

---

## Next Steps

1. Review and approve this plan
2. Begin Phase 1: Database Schema Extension
3. Create feature branch: `feature/project-management`
