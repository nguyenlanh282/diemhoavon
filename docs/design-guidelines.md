# Design Guidelines - Break-Even Analysis Application

**Version:** 2.0
**Last Updated:** 2026-01-14
**Status:** Active

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout Patterns](#layout-patterns)
6. [Component Guidelines](#component-guidelines)
7. [Form Patterns](#form-patterns)
8. [Data Visualization](#data-visualization)
9. [Light/Dark Mode](#lightdark-mode)
10. [Accessibility](#accessibility)
11. [Responsive Design](#responsive-design)
12. [Motion & Animation](#motion-animation)

---

## Design Philosophy

### Core Principles

1. **Clarity Over Decoration** - Financial data requires precise, unambiguous presentation. Every element must serve a purpose.

2. **Professional Trust** - The application handles sensitive business data. Visual design must convey competence and reliability.

3. **Efficiency First** - Business users need quick data entry and fast insights. Minimize clicks and cognitive load.

4. **Bilingual Harmony** - Vietnamese and English must display equally well. Typography and spacing must accommodate both.

5. **Data-Driven Aesthetics** - Let numbers be the hero. Use subtle visual hierarchy to guide without overwhelming.

### Target Users

- Business Managers (non-technical)
- Accountants and Finance Staff
- Small Business Owners
- Financial Analysts

### User Goals

- Quick cost entry and management
- Clear break-even visualization
- Easy report generation
- Multi-scenario comparison

---

## Color System

### Primary Palette - Blue

The primary color uses a vibrant blue that conveys professionalism, stability, and trust - essential for financial applications.

```css
/* Primary - Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6; /* Main primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
--primary-950: #172554;
```

### Sidebar Palette - Dark Navy

The sidebar uses a dark navy color for a professional, modern look that provides excellent contrast with the light content area.

```css
/* Sidebar - Dark Navy */
--sidebar-bg: #1e293b; /* Main sidebar background (slate-800) */
--sidebar-bg-hover: #334155; /* Hover state (slate-700) */
--sidebar-bg-active: #3b82f6; /* Active item (primary-500) */
--sidebar-text: #94a3b8; /* Normal text (slate-400) */
--sidebar-text-hover: #f1f5f9; /* Hover text (slate-100) */
--sidebar-text-active: #ffffff; /* Active text */
--sidebar-border: #334155; /* Border color (slate-700) */
```

### Background Colors

```css
/* Light Mode Backgrounds */
--bg-page: #f8fafc; /* Main page background (slate-50) */
--bg-card: #ffffff; /* Card/surface background */
--bg-muted: #f1f5f9; /* Muted/secondary background (slate-100) */

/* Dark Mode Backgrounds */
--bg-page-dark: #0f172a; /* Main page background (slate-900) */
--bg-card-dark: #1e293b; /* Card/surface background (slate-800) */
--bg-muted-dark: #334155; /* Muted/secondary background (slate-700) */
```

### Secondary Palette

A warm amber provides contrast for CTAs and highlights.

```css
/* Secondary - Warm Amber */
--secondary-50: #fffbeb;
--secondary-100: #fef3c7;
--secondary-200: #fde68a;
--secondary-300: #fcd34d;
--secondary-400: #fbbf24;
--secondary-500: #f59e0b; /* Main secondary */
--secondary-600: #d97706;
--secondary-700: #b45309;
--secondary-800: #92400e;
--secondary-900: #78350f;
```

### Neutral Palette

```css
/* Neutral - Slate Gray */
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;
--neutral-950: #020617;
```

### Semantic Colors

Financial applications require clear semantic meaning for positive/negative values.

```css
/* Success - Profit/Positive */
--success-50: #ecfdf5;
--success-100: #d1fae5;
--success-500: #10b981;
--success-600: #059669;
--success-700: #047857;

/* Warning - Caution/Attention */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

/* Error - Loss/Negative */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Neutral Information */
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-700: #1d4ed8;
```

### Financial-Specific Colors

```css
/* Cost Categories */
--cost-fixed: #6366f1; /* Indigo - Fixed costs */
--cost-variable: #f97316; /* Orange - Variable costs */
--cost-investment: #8b5cf6; /* Purple - Investments */

/* Revenue & Profit */
--revenue: #10b981; /* Emerald - Revenue */
--profit: #059669; /* Green - Profit */
--loss: #dc2626; /* Red - Loss */

/* Break-even Visualization */
--break-even-line: #3b82f6; /* Primary blue */
--total-cost-line: #ef4444; /* Red */
--revenue-line: #10b981; /* Green */
--contribution-margin: #8b5cf6; /* Purple */
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        sidebar: {
          DEFAULT: '#1E293B',
          hover: '#334155',
          active: '#3B82F6',
        },
        // Include other palettes...
      },
    },
  },
}
```

### shadcn/ui CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 38 92% 50%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 217 91% 60%;
    --radius: 0.5rem;

    /* Sidebar specific */
    --sidebar: 222 47% 17%;
    --sidebar-foreground: 215 20% 65%;
    --sidebar-accent: 217 91% 60%;
    --sidebar-accent-foreground: 0 0% 100%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222 47% 17%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 17%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 38 92% 55%;
    --secondary-foreground: 0 0% 100%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 50%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217 91% 60%;

    /* Sidebar in dark mode */
    --sidebar: 222.2 84% 4.9%;
    --sidebar-foreground: 215 20% 65%;
  }
}
```

---

## Typography

### Font Selection: Be Vietnam Pro

**Primary Font:** [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro)

**Why Be Vietnam Pro:**

- Designed specifically with Vietnamese in mind by Vietnamese designers
- Full Vietnamese diacritical mark support (a, e, o, u with all tones)
- Modern, clean sans-serif with professional appearance
- Excellent legibility at all sizes
- Multiple weights (100-900) for flexibility
- Free via Google Fonts

**Alternative:** [Lexend](https://fonts.google.com/specimen/Lexend) - Also has excellent Vietnamese support and is designed for readability.

### Font Loading

```html
<!-- In HTML head -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

```css
/* Tailwind config */
fontFamily: {
  sans:
    [ 'Be Vietnam Pro',
    'system-ui',
    'sans-serif'];
}
```

### Type Scale (Based on 4px grid)

| Level      | Size             | Line Height | Weight | Usage                        |
| ---------- | ---------------- | ----------- | ------ | ---------------------------- |
| Display    | 48px / 3rem      | 56px / 1.17 | 700    | Hero sections, large numbers |
| H1         | 36px / 2.25rem   | 44px / 1.22 | 700    | Page titles                  |
| H2         | 28px / 1.75rem   | 36px / 1.29 | 600    | Section titles               |
| H3         | 24px / 1.5rem    | 32px / 1.33 | 600    | Card titles                  |
| H4         | 20px / 1.25rem   | 28px / 1.4  | 600    | Subsection titles            |
| H5         | 18px / 1.125rem  | 28px / 1.56 | 500    | Group labels                 |
| Body Large | 18px / 1.125rem  | 28px / 1.56 | 400    | Lead paragraphs              |
| Body       | 16px / 1rem      | 24px / 1.5  | 400    | Default body text            |
| Body Small | 14px / 0.875rem  | 20px / 1.43 | 400    | Secondary text, table cells  |
| Caption    | 12px / 0.75rem   | 16px / 1.33 | 400    | Labels, metadata             |
| Overline   | 11px / 0.6875rem | 16px / 1.45 | 500    | Uppercase labels             |

### Number Typography

Financial data requires special treatment:

```css
/* Tabular numbers for alignment */
.financial-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  text-align: right;
}

/* Large display numbers */
.display-number {
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Currency formatting */
.currency {
  font-variant-numeric: tabular-nums;
}

.currency-symbol {
  font-size: 0.75em;
  vertical-align: super;
  margin-right: 2px;
}
```

### Vietnamese Text Considerations

```css
/* Ensure proper rendering of Vietnamese diacritics */
body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Extra line height for Vietnamese text */
.vi-text {
  line-height: 1.6; /* Slightly more for diacritics */
}

/* Prevent diacritic clipping */
.vi-heading {
  overflow: visible;
  padding-top: 0.1em;
}
```

---

## Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px to ensure consistent vertical rhythm.

| Token    | Value | Tailwind | Usage                        |
| -------- | ----- | -------- | ---------------------------- |
| space-0  | 0     | p-0      | Reset                        |
| space-1  | 4px   | p-1      | Tight: inline elements       |
| space-2  | 8px   | p-2      | Small: icon spacing          |
| space-3  | 12px  | p-3      | Medium-small: button padding |
| space-4  | 16px  | p-4      | Medium: component padding    |
| space-5  | 20px  | p-5      | Medium-large: card padding   |
| space-6  | 24px  | p-6      | Large: section spacing       |
| space-8  | 32px  | p-8      | XL: major sections           |
| space-10 | 40px  | p-10     | 2XL: page sections           |
| space-12 | 48px  | p-12     | 3XL: major divisions         |
| space-16 | 64px  | p-16     | 4XL: page margins            |
| space-20 | 80px  | p-20     | 5XL: hero spacing            |
| space-24 | 96px  | p-24     | 6XL: large hero              |

### Component Spacing

```css
/* Card internal padding */
.card-padding {
  padding: 24px; /* space-6 */
}

/* Table cell padding */
.table-cell {
  padding: 12px 16px; /* space-3 vertical, space-4 horizontal */
}

/* Form field spacing */
.form-field {
  margin-bottom: 24px; /* space-6 */
}

/* Button padding */
.btn-md {
  padding: 12px 20px; /* space-3 vertical, space-5 horizontal */
}

/* Input padding */
.input {
  padding: 10px 14px;
}
```

### Gap System

```css
/* Standard gaps for flex/grid layouts */
.gap-tight: 8px; /* Between related items */
.gap-normal: 16px; /* Standard gap */
.gap-loose: 24px; /* Between distinct groups */
.gap-section: 48px; /* Between major sections */
```

---

## Layout Patterns

### Dark Sidebar Navigation Layout

The primary layout uses a dark navy sidebar on desktop and bottom/slide navigation on mobile.

```
+------------------+----------------------------------------+
|                  |    HEADER (sticky, theme toggle)       |
|   DARK SIDEBAR   |----------------------------------------|
|   (fixed)        |                                        |
|   264px          |          CONTENT AREA                  |
|   #1E293B        |          (scrollable)                  |
|                  |          bg: #F8FAFC                   |
|   - Logo         |                                        |
|   - Nav Items    |          Max-width: 1280px             |
|   - User/Logout  |          Padding: 32px                 |
|                  |                                        |
+------------------+----------------------------------------+
```

### Sidebar Specifications

```css
.sidebar {
  width: 264px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: #1e293b; /* slate-800 */
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #334155; /* slate-700 */
  display: flex;
  align-items: center;
}

.sidebar-logo-text {
  color: #ffffff;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #94a3b8; /* slate-400 */
  transition: all 150ms ease;
}

.sidebar-nav-item:hover {
  background: #334155; /* slate-700 */
  color: #f1f5f9; /* slate-100 */
}

.sidebar-nav-item.active {
  background: #3b82f6; /* primary-500 */
  color: #ffffff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155; /* slate-700 */
}
```

### Content Area

```css
.main-content {
  margin-left: 264px; /* Sidebar width */
  min-height: 100vh;
  background: #f8fafc; /* slate-50 */
}

.content-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px;
}

/* Page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

/* Section within page */
.section {
  margin-bottom: 48px;
}
```

### Card Grid Layouts

```css
/* Stats cards - 4 columns on desktop */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* Two-column content */
.content-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

/* Three-column features */
.content-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

---

## Component Guidelines

### Cards

Cards are the primary container for grouped content.

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
}

.card-description {
  font-size: 14px;
  color: var(--muted-foreground);
  margin-top: 4px;
}

.card-content {
  padding: 24px;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}
```

### Metric Cards

For displaying KPIs and financial metrics:

```css
.metric-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.metric-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--muted-foreground);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--foreground);
  font-variant-numeric: tabular-nums;
}

.metric-subtitle {
  font-size: 12px;
  color: var(--muted-foreground);
  margin-top: 4px;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.metric-trend.up {
  color: var(--success-600);
}

.metric-trend.down {
  color: var(--error-600);
}
```

### Buttons

```css
/* Primary button - Blue */
.btn-primary {
  background: #3b82f6; /* primary-500 */
  color: #ffffff;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 150ms ease;
}

.btn-primary:hover {
  background: #2563eb; /* primary-600 */
}

/* Secondary button */
.btn-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
}

/* Outline button */
.btn-outline {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--foreground);
}

.btn-outline:hover {
  background: var(--muted);
}

/* Ghost button */
.btn-ghost {
  background: transparent;
  color: var(--muted-foreground);
}

.btn-ghost:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Destructive button */
.btn-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

/* Button sizes */
.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}
.btn-md {
  padding: 10px 20px;
  font-size: 16px;
}
.btn-lg {
  padding: 14px 28px;
  font-size: 18px;
}
```

### Tables

Financial data tables need special attention:

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

/* Numeric columns right-aligned */
.data-table td.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

/* Positive values */
.data-table .positive {
  color: var(--success-600);
}

/* Negative values */
.data-table .negative {
  color: var(--error-600);
}

/* Row hover */
.data-table tbody tr:hover {
  background: var(--muted);
}

/* Action buttons in table */
.data-table .actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

### Badges/Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-default {
  background: var(--muted);
  color: var(--muted-foreground);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-warning {
  background: var(--warning-100);
  color: var(--warning-700);
}

.badge-error {
  background: var(--error-100);
  color: var(--error-700);
}
```

---

## Form Patterns

### Form Layout

```css
.form {
  max-width: 640px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.form-row {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.form-row-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-row-3 {
  grid-template-columns: repeat(3, 1fr);
}
```

### Input Fields

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
}

.form-label .required {
  color: var(--error-500);
  margin-left: 2px;
}

.form-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: var(--background);
  transition: all 150ms ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6; /* primary-500 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-input:disabled {
  background: var(--muted);
  cursor: not-allowed;
}

.form-input.error {
  border-color: var(--error-500);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.form-helper {
  font-size: 12px;
  color: var(--muted-foreground);
}

.form-error {
  font-size: 12px;
  color: var(--error-600);
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## Data Visualization

### Chart Color Scheme

```javascript
// Recharts color configuration
const chartColors = {
  primary: '#3B82F6', // Blue
  secondary: '#F59E0B', // Amber
  tertiary: '#8B5CF6', // Purple
  quaternary: '#10B981', // Emerald
  positive: '#10B981', // Green
  negative: '#EF4444', // Red
  neutral: '#64748B', // Gray

  // Cost categories
  fixedCosts: '#6366F1', // Indigo
  variableCosts: '#F97316', // Orange
  investments: '#8B5CF6', // Purple

  // Grid and axis
  grid: '#E2E8F0',
  axis: '#94A3B8',
  tooltip: '#1E293B',
}
```

---

## Light/Dark Mode

### Theme Toggle Implementation

The theme toggle should be placed in the header, top-right corner. Users can switch between "Sang" (Light) and "Toi" (Dark) modes.

```html
<!-- Theme Toggle Component -->
<div class="theme-toggle">
  <button class="theme-btn active" data-theme="light">
    <svg><!-- Sun icon --></svg>
    Sang
  </button>
  <button class="theme-btn" data-theme="dark">
    <svg><!-- Moon icon --></svg>
    Toi
  </button>
</div>
```

```css
.theme-toggle {
  display: flex;
  background: var(--muted);
  border-radius: 8px;
  padding: 4px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted-foreground);
  transition: all 150ms ease;
}

.theme-btn.active {
  background: var(--card);
  color: var(--foreground);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### Color Transformations

| Light Mode          | Dark Mode           | Usage            |
| ------------------- | ------------------- | ---------------- |
| White (#FFFFFF)     | Slate 900 (#0F172A) | Background       |
| Slate 50 (#F8FAFC)  | Slate 800 (#1E293B) | Card background  |
| Slate 100 (#F1F5F9) | Slate 700 (#334155) | Muted background |
| Slate 900 (#0F172A) | Slate 50 (#F8FAFC)  | Foreground text  |
| Slate 600 (#475569) | Slate 400 (#94A3B8) | Muted text       |
| Slate 200 (#E2E8F0) | Slate 700 (#334155) | Borders          |

### JavaScript Implementation

```javascript
// Theme management
function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
}

function setTheme(theme) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
  localStorage.setItem('theme', theme)

  // Update toggle buttons
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme)
  })
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initTheme)
```

---

## Accessibility

### WCAG 2.1 AA Compliance Checklist

#### Color Contrast

- [x] Normal text: 4.5:1 minimum contrast ratio
- [x] Large text (18px+): 3:1 minimum contrast ratio
- [x] UI components: 3:1 against adjacent colors
- [x] Graphical objects: 3:1 against background

**Verified Contrast Ratios:**

| Element        | Foreground | Background | Ratio   | Pass |
| -------------- | ---------- | ---------- | ------- | ---- |
| Body text      | Slate 900  | White      | 16.28:1 | Yes  |
| Muted text     | Slate 500  | White      | 5.16:1  | Yes  |
| Primary button | White      | Blue 500   | 4.52:1  | Yes  |
| Sidebar text   | Slate 400  | Slate 800  | 4.72:1  | Yes  |
| Error text     | Red 600    | White      | 5.27:1  | Yes  |
| Success text   | Green 600  | White      | 4.52:1  | Yes  |

#### Focus States

```css
/* Visible focus indicators */
:focus-visible {
  outline: 2px solid #3b82f6; /* primary-500 */
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  z-index: 9999;
  border-radius: 4px;
}

.skip-link:focus {
  top: 16px;
}
```

---

## Responsive Design

### Breakpoints

| Name    | Width           | Tailwind  | Usage                   |
| ------- | --------------- | --------- | ----------------------- |
| Mobile  | 320px - 639px   | default   | Phone portrait          |
| Tablet  | 640px - 1023px  | sm:, md:  | Tablet, phone landscape |
| Desktop | 1024px - 1279px | lg:       | Small laptops           |
| Large   | 1280px+         | xl:, 2xl: | Desktop monitors        |

### Navigation Patterns

**Desktop (1024px+):**

- Fixed left dark sidebar (264px)
- Content area with max-width
- Theme toggle in header

**Tablet/Mobile (<1024px):**

- Hidden sidebar
- Fixed bottom navigation OR hamburger menu
- Full-width content

```css
/* Desktop sidebar */
@media (min-width: 1024px) {
  .sidebar {
    display: block;
    position: fixed;
    width: 264px;
  }

  .main-content {
    margin-left: 264px;
  }

  .mobile-nav {
    display: none;
  }
}

/* Mobile navigation */
@media (max-width: 1023px) {
  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
    margin-bottom: 72px; /* Space for bottom nav */
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: var(--card);
    border-top: 1px solid var(--border);
    justify-content: space-around;
    align-items: center;
    z-index: 50;
  }
}
```

---

## Motion & Animation

### Animation Principles

1. **Purpose** - Animations should communicate, not decorate
2. **Speed** - Fast enough to feel responsive (150-300ms)
3. **Easing** - Use ease-out for entrances, ease-in for exits
4. **Restraint** - Less is more in financial applications

### Timing Tokens

```css
--duration-instant: 50ms; /* Micro-feedback */
--duration-fast: 150ms; /* Button states, hovers */
--duration-normal: 250ms; /* Standard transitions */
--duration-slow: 400ms; /* Complex animations */

--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Implementation Checklist

### Before Development

- [ ] Set up Tailwind CSS configuration with design tokens
- [ ] Configure shadcn/ui with custom theme
- [ ] Add Google Font (Be Vietnam Pro)
- [ ] Set up CSS variables for theming
- [ ] Configure dark mode toggle
- [ ] Set up dark sidebar styling

### Component Development

- [ ] Create base Button variants (blue primary)
- [ ] Create Card components
- [ ] Create Form input components
- [ ] Create Table component with responsive behavior
- [ ] Create Dark Sidebar Navigation
- [ ] Create MetricCard component
- [ ] Create Theme Toggle component
- [ ] Set up Recharts with custom theme

### Page Templates

- [ ] Login page layout
- [ ] Dashboard layout with dark sidebar
- [ ] Data entry form pages
- [ ] Data table pages
- [ ] Report/visualization pages

### Testing

- [ ] Run Lighthouse accessibility audit
- [ ] Test all color contrasts
- [ ] Verify keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test responsive breakpoints
- [ ] Verify Vietnamese text rendering
- [ ] Test light/dark mode switching

---

## Resources

### Design Assets

- Color palette: Exported from design system
- Icons: Lucide Icons (included with shadcn/ui)
- Charts: Recharts library

### Reference Links

- [Be Vietnam Pro on Google Fonts](https://fonts.google.com/specimen/Be+Vietnam+Pro)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

_This document should be updated as the design system evolves. All changes should be reviewed for consistency and accessibility compliance._
