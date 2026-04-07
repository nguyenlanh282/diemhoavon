# Tech Stack Research: Enterprise Break-Even Analysis Application

**Research Date:** 2026-01-14
**Target:** Multi-user financial app with RBAC, i18n (VN/EN), auth, SMTP, data history

---

## Executive Summary

**Recommendation: Option 1 (Next.js + PostgreSQL + Prisma + NextAuth)**

Best balance of enterprise readiness, stability, ecosystem maturity. Proven at scale with clear migration paths. Higher initial complexity but lower long-term risk.

**Alternative:** Option 2 viable if rapid development prioritized over full control, acceptable vendor dependency on Supabase managed services.

**Not recommended:** Option 3 - Remix ecosystem less mature for enterprise needs; Drizzle younger, less enterprise adoption.

---

## Stack Comparison Matrix

### 1. Next.js + PostgreSQL + Prisma + NextAuth

**Strengths:**

- **Enterprise proven:** Used by Fortune 500s, mature ecosystem (Next.js v15+, Prisma v5+)
- **Full control:** Self-hosted PostgreSQL, no vendor lock-in
- **Type safety:** Prisma generates types from schema, excellent DX with autocomplete
- **RBAC:** NextAuth flexible for custom role systems, middleware for route protection
- **Data history:** Prisma migrations + audit triggers straightforward
- **i18n:** next-intl battle-tested for Vietnamese/English
- **Performance:** RSC (React Server Components) reduces client JS, streaming SSR

**Weaknesses:**

- Higher setup complexity (DB hosting, connection pooling, migrations)
- More infrastructure to manage (PostgreSQL, Redis for sessions)
- NextAuth v5 migration overhead if using v4

**Maintenance Cost:** Medium-High (infrastructure, security patches, DB backups)

---

### 2. Next.js + Supabase + Better-Auth

**Strengths:**

- **Fastest MVP:** Supabase handles DB, auth, realtime, storage (BaaS approach)
- **Built-in RBAC:** Supabase RLS (Row-Level Security) for permissions
- **Real-time:** WebSocket support for collaborative features (if needed)
- **Better-Auth:** Modern, type-safe, simpler than NextAuth (framework-agnostic)
- **Lower DevOps:** Managed PostgreSQL, automatic backups, scaling

**Weaknesses:**

- **Vendor dependency:** Supabase managed service (mitigated: 100% open-source stack, self-hostable)
- **Pricing at scale:** Pro $25/project, Team $599/month; compute/storage add-ons
- **Less control:** Limited PostgreSQL extensions, connection pooling constraints
- **Better-Auth maturity:** Newer library (2024+), smaller ecosystem vs NextAuth
- **Migration effort:** Moving off Supabase requires auth/DB reconfiguration

**Maintenance Cost:** Low (managed) → High (if self-hosting later)

---

### 3. Remix + PostgreSQL + Drizzle

**Strengths:**

- **Web standards:** Forms, mutations, progressive enhancement (less client JS)
- **Drizzle performance:** Lighter runtime, faster queries than Prisma (benchmarks: 2-3x in serverless)
- **SQL-first:** Drizzle closer to raw SQL, more control for complex financial queries
- **Nested routing:** Data loading per route segment (optimization potential)

**Weaknesses:**

- **Smaller ecosystem:** Fewer Remix enterprise examples vs Next.js
- **Drizzle tooling:** Migration tools less mature than Prisma, no visual studio
- **Auth:** No Remix-native auth like NextAuth; must build or adapt libraries
- **i18n:** remix-i18next available but less battle-tested than next-intl
- **RSC gap:** Remix v2 lacks React Server Components (upcoming in Remix v3/React Router v7)

**Maintenance Cost:** Medium (more custom code, fewer managed solutions)

---

## Requirement Fit Analysis

| Requirement              | Option 1                 | Option 2               | Option 3              |
| ------------------------ | ------------------------ | ---------------------- | --------------------- |
| **Multi-user RBAC**      | ✅ NextAuth + middleware | ✅ Supabase RLS        | ⚠️ Custom build       |
| **i18n (VN/EN)**         | ✅ next-intl mature      | ✅ next-intl works     | ⚠️ remix-i18next      |
| **Data history/audit**   | ✅ Prisma + triggers     | ✅ Supabase triggers   | ✅ Drizzle + triggers |
| **Auth (creds+OAuth)**   | ✅ NextAuth proven       | ✅ Better-Auth simpler | ⚠️ Manual integration |
| **SMTP email**           | ✅ Nodemailer/Resend     | ✅ Supabase Edge Fn    | ✅ Any library        |
| **Financial calc**       | ✅ Server components     | ✅ Server actions      | ✅ Loaders/actions    |
| **Type safety**          | ✅✅ Prisma codegen      | ✅ Supabase codegen    | ✅✅ Drizzle native   |
| **Enterprise readiness** | ✅✅ Proven              | ⚠️ Vendor risk         | ⚠️ Ecosystem gaps     |

---

## Cost Breakdown (Annual, 50 users)

**Option 1:**

- Hosting: $50-200/month (VPS/managed PostgreSQL)
- CDN: $20/month (Vercel/Cloudflare)
- Email: $10-30/month (SendGrid/Resend)
- **Total: ~$1,000-3,000/year**

**Option 2:**

- Supabase Pro: $25/month → Team $599/month (50+ users)
- Hosting: $20/month (Vercel frontend)
- **Total: ~$7,500/year** (managed convenience)

**Option 3:**

- Same as Option 1: ~$1,000-3,000/year
- +20% dev time for auth/tooling gaps

---

## Decision Framework

**Choose Option 1 if:**

- Enterprise compliance critical (SOC2, GDPR with full control)
- Long-term cost sensitivity (self-hosted savings)
- Team has DevOps capability
- Need audit trail ownership

**Choose Option 2 if:**

- Speed to market > cost (6-month MVP)
- Small team (<3 devs) without DevOps
- Comfortable with managed services
- Real-time features beneficial

**Avoid Option 3 unless:**

- Team already Remix experts
- Performance (edge cases) critical
- Willing to build auth/tooling

---

## Implementation Risks

**Option 1:**

- NextAuth v5 breaking changes (upgrade path exists)
- PostgreSQL connection pooling (use PgBouncer/Supavisor)
- Vietnamese font rendering (CSS @font-face edge cases)

**Option 2:**

- Supabase outage impact (SLA: 99.9% uptime)
- Better-Auth production maturity (monitor GitHub issues)
- Row-Level Security complexity (test thoroughly)

**Option 3:**

- Auth library selection paralysis (consider Lucia, Oslo)
- Drizzle migration rollback tooling (manual scripts needed)
- Remix hiring pool smaller than Next.js

---

## Recommended Stack (Option 1 Details)

```
Frontend: Next.js 15 (App Router, RSC, Server Actions)
Database: PostgreSQL 16 (self-hosted or managed: Neon, Supabase DB-only)
ORM: Prisma 5 (schema-first, migrations, type generation)
Auth: NextAuth 5 (credentials + Google OAuth)
i18n: next-intl (server components support)
Email: Resend (SMTP, templates, React Email)
Forms: React Hook Form + Zod (validation)
UI: shadcn/ui + Tailwind (accessible components)
Testing: Vitest + Playwright (unit + E2E)
Deployment: Docker → VPS or Vercel (frontend) + managed DB
```

**Setup time:** 2-3 weeks (auth + RBAC + i18n scaffold)
**Production readiness:** 8-12 weeks (assuming clear requirements)

---

## Unresolved Questions

1. Data residency requirements (Vietnam-hosted DB needed?)
2. Expected concurrent users (impacts connection pooling strategy)
3. Financial calculation complexity (custom formulas? external APIs?)
4. Audit retention period (affects storage/archival strategy)
5. SSO requirements beyond Google (SAML, Azure AD?)

---

**Next Steps:**

1. Validate Option 1 with team DevOps capacity assessment
2. Prototype auth + RBAC flow (2-day spike)
3. Benchmark financial calculations with realistic dataset
4. Review Vietnamese localization edge cases (currency, date formats)
