# Break-Even Analysis Web Application - Implementation Plan

**Date:** 2026-01-14
**Status:** Planning
**Tech Stack:** Next.js 15, PostgreSQL 16, Prisma 5, NextAuth 5, next-intl, shadcn/ui

---

## Overview

Enterprise web application for calculating break-even points with multi-product support, Vietnamese/English localization, role-based access, and automated email reports.

**Key Features:**

- Fixed/variable cost management with category support
- Initial investment tracking with monthly deduction
- Multi-product break-even calculation using weighted average method
- User authentication (credentials + Google OAuth)
- Role-based permissions (Admin, Manager, User)
- Calculation history with audit trail
- Email reports via company SMTP

---

## Phases

| Phase | Name                   | Status   | Progress | File                                                                       |
| ----- | ---------------------- | -------- | -------- | -------------------------------------------------------------------------- |
| 01    | Project Setup          | Complete | 100%     | [phase-01-project-setup.md](./phase-01-project-setup.md)                   |
| 02    | Database Schema        | Complete | 100%     | [phase-02-database-schema.md](./phase-02-database-schema.md)               |
| 03    | Authentication         | Pending  | 0%       | [phase-03-authentication.md](./phase-03-authentication.md)                 |
| 04    | i18n Setup             | Pending  | 0%       | [phase-04-i18n-setup.md](./phase-04-i18n-setup.md)                         |
| 05    | Fixed Costs Module     | Pending  | 0%       | [phase-05-fixed-costs-module.md](./phase-05-fixed-costs-module.md)         |
| 06    | Variable Costs Module  | Pending  | 0%       | [phase-06-variable-costs-module.md](./phase-06-variable-costs-module.md)   |
| 07    | Investment Module      | Pending  | 0%       | [phase-07-investment-module.md](./phase-07-investment-module.md)           |
| 08    | Products Module        | Pending  | 0%       | [phase-08-products-module.md](./phase-08-products-module.md)               |
| 09    | Break-Even Calculation | Pending  | 0%       | [phase-09-break-even-calculation.md](./phase-09-break-even-calculation.md) |
| 10    | Email Reports          | Pending  | 0%       | [phase-10-email-reports.md](./phase-10-email-reports.md)                   |
| 11    | Dashboard UI           | Pending  | 0%       | [phase-11-dashboard-ui.md](./phase-11-dashboard-ui.md)                     |
| 12    | Testing                | Pending  | 0%       | [phase-12-testing.md](./phase-12-testing.md)                               |

---

## Timeline Estimate

- **Phase 01-04:** 2 weeks (foundation)
- **Phase 05-08:** 3 weeks (data modules)
- **Phase 09-11:** 2 weeks (core features)
- **Phase 12:** 1 week (testing)
- **Total:** 8 weeks

---

## Project Structure

```
src/
  app/
    [locale]/
      (auth)/login, register
      (dashboard)/dashboard, costs, products, reports
    api/
  components/
  lib/
    db/, auth/, i18n/, email/
  types/
prisma/
  schema.prisma
messages/
  en.json, vi.json
```

---

## References

- [Research: Break-Even Analysis](../../docs/research-break-even-analysis.md)
- [Research: Authentication](../../docs/research-authentication.md)
- [Tech Stack Decision](../../docs/tech-stack.md)
