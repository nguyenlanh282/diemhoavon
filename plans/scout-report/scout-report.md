# Codebase Scout Report

Date: 2026-01-15 | Project: Break-Even Calculator (Điểm Hòa Vốn)

## Tech Stack

- Next.js 16 App Router + React 19 + TypeScript 5
- Database: PostgreSQL 16 + Prisma 7.2
- Auth: NextAuth 5 (Credentials + Google OAuth)
- Email: Nodemailer + React Email
- i18n: next-intl (VN/EN)
- UI: shadcn/ui + Tailwind CSS 4

## Structure

src/
app/[locale]/
(auth)/ - login, register
(dashboard)/ - calculator, costs, products, investments, projects, dashboard
api/ - auth, reports/send, health
components/ - calculator, costs, email, products, ui (20+ shadcn)
lib/
actions/ - Server actions for CRUD
calculations/ - break-even.ts, forecast.ts
email/ - transport.ts, send.ts, templates/break-even.tsx
auth/ - NextAuth config
db/ - Prisma client
prisma/schema.prisma - Database models
messages/ - vi.json, en.json

## Database Models (schema.prisma)

- Organization - Multi-tenancy
- Project - Multi-project contexts
- User - Role-based (ADMIN/MANAGER/USER), linked to org
- FixedCost - 13 categories, frequency (monthly/quarterly/yearly)
- VariableCost - percentage or fixed per order
- Investment - Amortized monthly
- Product - sellingPrice, costPrice, salesMixRatio
- CalculationHistory - Saved calculations with snapshots

## Break-Even Calculation (lib/calculations/break-even.ts)

Formula: Weighted average method for multi-product

1. Total Fixed = Sum(fixed costs) + Investment Amortization
2. Weighted AOV = Σ(price × mix)
3. Weighted CM = Σ((price - cost) × mix)
4. Variable Cost = (AOV × percentage) + fixed per order
5. Effective CM = Weighted CM - Variable Costs
6. BE Units = Fixed / Effective CM
7. BE Revenue = BE Units × Weighted AOV

Functions:

- calculateBreakEven(input) - Pure logic
- calculateCurrentBreakEven(projectId) - Fetch + calculate
- saveCalculation(name, projectId) - Save to history

## Email Functionality ✅ IMPLEMENTED

Files:

- lib/email/transport.ts - Nodemailer SMTP config
- lib/email/send.ts - sendBreakEvenReport() function
- lib/email/templates/break-even.tsx - React Email template (VN/EN)
- app/api/reports/send/route.ts - POST endpoint
- components/email/send-report-dialog.tsx - UI dialog

Flow: User adds recipients → API calculates → sends via SMTP
Status: Working, PDF attachment param ready but not generated

ENV vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

## User Management ❌ NOT IMPLEMENTED

Database:

- User model exists with role field
- Role enum: ADMIN, MANAGER, USER

Missing:

- No user list page
- No user CRUD actions
- No role assignment UI
- No permission enforcement
- No invite user flow

Needs:

- app/[locale]/(dashboard)/users/page.tsx
- lib/actions/users.ts
- components/users/user-table.tsx, user-form.tsx
- Role-based access control middleware

## API Routes

POST /api/auth/register - User registration
POST /api/reports/send - Email report
GET /api/health - Health check
/api/auth/[...nextauth] - NextAuth handlers

## Server Actions (lib/actions/)

calculations.ts - calculateCurrentBreakEven, saveCalculation, getHistory
fixed-costs.ts - CRUD for fixed costs
variable-costs.ts - CRUD for variable costs
investments.ts - CRUD + getMonthlyInvestmentCost
products.ts - CRUD + getProductsSummary
projects.ts - CRUD + getCurrentProject, setDefaultProject

## i18n (next-intl)

Languages: Vietnamese (vi), English (en)
Files: messages/vi.json (9KB), messages/en.json (8KB)
Keys: auth, navigation, calculation, costs, products, email, common

## Key Pages

/calculator - Break-even results + send email + save calculation
/costs/fixed, /costs/variable - Cost management
/products - Product list with sales mix
/investments - Investment tracking
/projects - Project selector
/dashboard - Metrics + history

## MISSING FEATURES

1. PDF Generation ❌
   - Need library (@react-pdf/renderer or puppeteer)
   - Template for PDF report
   - Wire up pdfBuffer in sendBreakEvenReport()
   - Download button on calculator page

2. CRM User Management ❌
   - Admin page for user list
   - Create/edit/delete users
   - Role assignment
   - User invite via email
   - Permission enforcement

3. Download HTML/PDF ❌
   - Client-side HTML download
   - Server PDF generation endpoint
   - Export to Excel

4. Email Tracking ❌
   - Log sent emails
   - Delivery status
   - Resend failed

## Files for Implementation

Break-Even Related:

- lib/calculations/break-even.ts ✅
- lib/actions/calculations.ts ✅
- app/[locale]/(dashboard)/calculator/page.tsx ✅
- components/calculator/break-even-results.tsx ✅
- components/calculator/sales-forecast.tsx ✅

Email Related:

- lib/email/transport.ts ✅
- lib/email/send.ts ✅
- lib/email/templates/break-even.tsx ✅
- app/api/reports/send/route.ts ✅
- components/email/send-report-dialog.tsx ✅

User Management (ALL MISSING):

- app/[locale]/(dashboard)/users/page.tsx ❌
- lib/actions/users.ts ❌
- components/users/user-table.tsx ❌
- components/users/user-form.tsx ❌
- lib/validations/user.ts ❌

PDF (ALL MISSING):

- lib/pdf/templates/break-even-report.tsx ❌
- lib/pdf/generate.ts ❌
- app/api/reports/pdf/route.ts ❌

## Recommendations

For PDF Download + Email:

1. Install: npm install @react-pdf/renderer
2. Create lib/pdf/templates/break-even-report.tsx
3. Create lib/pdf/generate.ts with generatePDF(result)
4. Update email send to include PDF buffer
5. Add download button calling /api/reports/pdf

For CRM User Management:

1. Create lib/actions/users.ts with getUsers, createUser, updateUser, deleteUser
2. Create app/[locale]/(dashboard)/users/page.tsx with table
3. Create components/users/user-form.tsx with role select
4. Add middleware permission checks
5. Add invite user flow with email

## Unresolved Questions

1. PDF library choice? (@react-pdf vs puppeteer)
2. User invite: temp password or magic link?
3. Permission model: role-based only or resource-level?
4. Email delivery tracking in DB?
5. Excel export priority?

---

End of Report
Files analyzed: 100+ | Duration: 5min | Confidence: 95%
