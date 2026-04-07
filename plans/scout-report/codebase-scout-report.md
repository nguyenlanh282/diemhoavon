# Codebase Scout Report - Break-Even Calculator App

**Date:** 2026-01-15
**Scout:** Claude Code Agent
**Project:** Điểm Hòa Vốn (Break-Even Calculator)

---

## Executive Summary

Next.js 16 full-stack app for break-even analysis with multi-project support, i18n (VN/EN), auth, email reports. Core features implemented: fixed/variable costs, investments, products, calculator, email sending. Missing: PDF generation, CRM user management page.

**Tech Stack:**

- Frontend: Next.js 16 (App Router), React 19, TypeScript 5
- Backend: Next.js API Routes, Server Actions
- Database: PostgreSQL 16 + Prisma ORM
- Auth: NextAuth 5 (Credentials + Google OAuth)
- i18n: next-intl (Vietnamese/English)
- Email: Nodemailer + React Email templates
- UI: shadcn/ui + Tailwind CSS 4

---

## 1. Project Structure & Architecture

### Directory Tree
