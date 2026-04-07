# Tech Stack - Điểm Hòa Vốn Calculator

**Version:** 1.0
**Date:** 2026-01-14
**Status:** Approved

---

## Core Stack

| Layer             | Technology           | Version |
| ----------------- | -------------------- | ------- |
| **Framework**     | Next.js (App Router) | 15.x    |
| **Language**      | TypeScript           | 5.x     |
| **Database**      | PostgreSQL           | 16.x    |
| **ORM**           | Prisma               | 5.x     |
| **Auth**          | NextAuth.js          | 5.x     |
| **i18n**          | next-intl            | 3.x     |
| **UI Components** | shadcn/ui            | latest  |
| **Styling**       | Tailwind CSS         | 3.x     |
| **Forms**         | React Hook Form      | 7.x     |
| **Validation**    | Zod                  | 3.x     |
| **Email**         | Nodemailer           | 6.x     |

---

## Development Tools

| Tool           | Purpose         |
| -------------- | --------------- |
| **Vitest**     | Unit testing    |
| **Playwright** | E2E testing     |
| **ESLint**     | Code linting    |
| **Prettier**   | Code formatting |
| **Husky**      | Git hooks       |

---

## Infrastructure

| Component            | Technology                            |
| -------------------- | ------------------------------------- |
| **Deployment**       | Docker / Vercel                       |
| **Database Hosting** | Self-hosted / Neon / Supabase DB-only |
| **CDN**              | Cloudflare                            |
| **Email**            | Company SMTP server                   |

---

## Key Features Mapping

| Feature                    | Implementation                          |
| -------------------------- | --------------------------------------- |
| **Authentication**         | NextAuth 5 (Credentials + Google OAuth) |
| **RBAC**                   | NextAuth middleware + custom roles      |
| **Multi-language**         | next-intl (VN/EN)                       |
| **Data History**           | Prisma + audit triggers                 |
| **Email Reports**          | Nodemailer + React Email templates      |
| **Financial Calculations** | Server Actions + Decimal.js             |

---

## Architecture Decisions

1. **App Router over Pages Router** - Better RSC support, server actions
2. **Prisma over Drizzle** - More mature, better tooling
3. **NextAuth over Better-Auth** - Larger ecosystem, proven enterprise
4. **shadcn/ui over MUI** - Lightweight, full customization
5. **Nodemailer over third-party** - Uses existing SMTP server

---

## Cost Estimate (Annual, 50 users)

- **Hosting**: $50-200/month (VPS/managed DB)
- **CDN**: $20/month
- **Email**: Existing SMTP (no cost)
- **Total**: ~$1,000-3,000/year
