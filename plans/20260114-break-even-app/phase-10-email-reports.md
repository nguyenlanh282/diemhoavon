# Phase 10: Email Reports

## Context Links

- [Main Plan](./plan.md)
- [Previous: Break-Even Calculation](./phase-09-break-even-calculation.md)
- [Research: Break-Even Analysis](../../docs/research-break-even-analysis.md)

---

## Overview

| Field          | Value      |
| -------------- | ---------- |
| Date           | 2026-01-14 |
| Priority       | Medium     |
| Status         | Pending    |
| Estimated Time | 2 days     |

---

## Key Insights

- Use company SMTP server (no third-party service)
- Nodemailer for SMTP transport
- React Email for template rendering
- PDF generation using @react-pdf/renderer
- Queue emails for reliability (optional: BullMQ)

---

## Requirements

1. Send break-even results via email
2. Use company SMTP server
3. Professional HTML email template
4. PDF attachment with full report
5. Support both Vietnamese and English
6. Recipient selection (single or multiple)
7. Email delivery tracking

---

## Architecture

```
src/
  lib/
    email/
      transport.ts          # Nodemailer SMTP config
      send.ts               # Send email function
      templates/
        break-even.tsx      # React Email template
  components/
    email/
      send-report-dialog.tsx    # UI for sending
  app/
    api/
      reports/
        send/
          route.ts          # API endpoint
        pdf/
          route.ts          # PDF generation
```

---

## Related Code Files

| File                                     | Purpose            |
| ---------------------------------------- | ------------------ |
| `src/lib/email/transport.ts`             | SMTP configuration |
| `src/lib/email/templates/break-even.tsx` | Email template     |
| `src/app/api/reports/send/route.ts`      | Send API           |

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install nodemailer @react-email/components
npm install @react-pdf/renderer
npm install -D @types/nodemailer
```

### Step 2: Configure SMTP Transport

Create `src/lib/email/transport.ts`:

```typescript
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function verifyConnection() {
  try {
    await transporter.verify()
    console.log('SMTP connection verified')
    return true
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return false
  }
}
```

### Step 3: Create Email Template

Create `src/lib/email/templates/break-even.tsx`:

```typescript
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface BreakEvenEmailProps {
  recipientName: string
  organizationName: string
  locale: 'vi' | 'en'
  result: {
    breakEvenUnits: number
    breakEvenRevenue: number
    totalFixedCosts: number
    averageOrderValue: number
    contributionMargin: number
    calculatedAt: string
  }
}

const translations = {
  vi: {
    subject: 'Báo cáo Phân tích Điểm Hòa Vốn',
    greeting: 'Xin chào',
    intro: 'Dưới đây là kết quả phân tích điểm hòa vốn của bạn:',
    breakEvenUnits: 'Điểm hòa vốn (Đơn hàng)',
    breakEvenRevenue: 'Điểm hòa vốn (Doanh thu)',
    totalFixedCosts: 'Tổng định phí',
    averageOrderValue: 'Giá trị đơn hàng trung bình',
    contributionMargin: 'Lợi nhuận gộp/đơn',
    calculatedAt: 'Thời gian tính toán',
    footer: 'Đây là email tự động từ hệ thống Tính Điểm Hòa Vốn.',
    viewDetails: 'Xem chi tiết tại dashboard',
    perMonth: '/tháng',
    orders: 'đơn hàng',
  },
  en: {
    subject: 'Break-Even Analysis Report',
    greeting: 'Hello',
    intro: 'Here are your break-even analysis results:',
    breakEvenUnits: 'Break-Even Point (Orders)',
    breakEvenRevenue: 'Break-Even Point (Revenue)',
    totalFixedCosts: 'Total Fixed Costs',
    averageOrderValue: 'Average Order Value',
    contributionMargin: 'Contribution Margin/Order',
    calculatedAt: 'Calculated At',
    footer: 'This is an automated email from Break-Even Calculator.',
    viewDetails: 'View details on dashboard',
    perMonth: '/month',
    orders: 'orders',
  },
}

export function BreakEvenEmail({
  recipientName,
  organizationName,
  locale,
  result,
}: BreakEvenEmailProps) {
  const t = translations[locale]

  const formatCurrency = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.h1}>{t.subject}</Heading>
            <Text style={styles.orgName}>{organizationName}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Greeting */}
          <Section>
            <Text style={styles.text}>
              {t.greeting} {recipientName},
            </Text>
            <Text style={styles.text}>{t.intro}</Text>
          </Section>

          {/* Key Results */}
          <Section style={styles.results}>
            <Row>
              <Column style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t.breakEvenUnits}</Text>
                <Text style={styles.resultValue}>
                  {Math.ceil(result.breakEvenUnits).toLocaleString()} {t.orders}
                </Text>
              </Column>
              <Column style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t.breakEvenRevenue}</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(result.breakEvenRevenue)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Details Table */}
          <Section style={styles.detailsSection}>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>{t.totalFixedCosts}</td>
                  <td style={styles.tableValue}>
                    {formatCurrency(result.totalFixedCosts)}{t.perMonth}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.averageOrderValue}</td>
                  <td style={styles.tableValue}>
                    {formatCurrency(result.averageOrderValue)}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.contributionMargin}</td>
                  <td style={styles.tableValue}>
                    {formatCurrency(result.contributionMargin)}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.calculatedAt}</td>
                  <td style={styles.tableValue}>{result.calculatedAt}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px',
    maxWidth: '600px',
  },
  header: {
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  h1: {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  orgName: {
    color: '#666666',
    fontSize: '14px',
    margin: '10px 0 0',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '20px 0',
  },
  text: {
    color: '#333333',
    fontSize: '14px',
    lineHeight: '24px',
  },
  results: {
    padding: '20px 0',
  },
  resultCard: {
    backgroundColor: '#f0f7ff',
    padding: '20px',
    textAlign: 'center' as const,
    borderRadius: '8px',
    margin: '0 5px',
  },
  resultLabel: {
    color: '#666666',
    fontSize: '12px',
    margin: '0 0 8px',
  },
  resultValue: {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  detailsSection: {
    padding: '10px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableLabel: {
    padding: '10px 0',
    color: '#666666',
    fontSize: '14px',
    borderBottom: '1px solid #e6e6e6',
  },
  tableValue: {
    padding: '10px 0',
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'right' as const,
    borderBottom: '1px solid #e6e6e6',
  },
  footer: {
    color: '#999999',
    fontSize: '12px',
    textAlign: 'center' as const,
  },
}

export function getEmailSubject(locale: 'vi' | 'en') {
  return translations[locale].subject
}
```

### Step 4: Create Send Email Function

Create `src/lib/email/send.ts`:

```typescript
import { transporter } from './transport'
import { render } from '@react-email/components'
import { BreakEvenEmail, getEmailSubject } from './templates/break-even'
import type { BreakEvenResult } from '@/lib/calculations/break-even'

interface SendBreakEvenReportParams {
  to: string
  recipientName: string
  organizationName: string
  locale: 'vi' | 'en'
  result: BreakEvenResult
  pdfBuffer?: Buffer
}

export async function sendBreakEvenReport({
  to,
  recipientName,
  organizationName,
  locale,
  result,
  pdfBuffer,
}: SendBreakEvenReportParams) {
  const emailProps = {
    recipientName,
    organizationName,
    locale,
    result: {
      breakEvenUnits: result.breakEvenUnits,
      breakEvenRevenue: result.breakEvenRevenue,
      totalFixedCosts: result.totalFixedCosts,
      averageOrderValue: result.averageOrderValue,
      contributionMargin: result.weightedContributionMargin,
      calculatedAt: new Date().toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US'),
    },
  }

  const html = await render(BreakEvenEmail(emailProps))
  const subject = getEmailSubject(locale)

  const attachments = pdfBuffer
    ? [
        {
          filename: `break-even-report-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    : []

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    attachments,
  })

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  }
}
```

### Step 5: Create Send Report API

Create `src/app/api/reports/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { calculateCurrentBreakEven } from '@/lib/actions/calculations'
import { sendBreakEvenReport } from '@/lib/email/send'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const sendReportSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  includePdf: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipients, includePdf } = sendReportSchema.parse(body)

    // Get current calculation
    const { result } = await calculateCurrentBreakEven()

    // Get organization name
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })

    // Send to each recipient
    const results = await Promise.allSettled(
      recipients.map((email) =>
        sendBreakEvenReport({
          to: email,
          recipientName: email.split('@')[0], // Fallback name
          organizationName: org?.name || 'Organization',
          locale: 'vi', // Could be passed from request
          result,
          pdfBuffer: undefined, // TODO: Generate PDF
        })
      )
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Send report error:', error)
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }
}
```

### Step 6: Create Send Report Dialog

Create `src/components/email/send-report-dialog.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function SendReportDialog() {
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [includePdf, setIncludePdf] = useState(true)
  const [sending, setSending] = useState(false)

  const addRecipient = () => {
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email])
      setEmail('')
    }
  }

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove))
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('Add at least one recipient')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, includePdf }),
      })

      if (!res.ok) throw new Error('Failed to send')

      const data = await res.json()
      toast.success(`Report sent to ${data.sent} recipient(s)`)
      setOpen(false)
      setRecipients([])
    } catch (error) {
      toast.error('Failed to send report')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send Report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Report via Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add recipient */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              />
              <Button type="button" onClick={addRecipient}>
                Add
              </Button>
            </div>
          </div>

          {/* Recipient list */}
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <Badge key={r} variant="secondary" className="gap-1">
                  {r}
                  <button
                    onClick={() => removeRecipient(r)}
                    className="ml-1 hover:text-red-500"
                  >
                    x
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="includePdf"
              checked={includePdf}
              onCheckedChange={(c) => setIncludePdf(c as boolean)}
            />
            <Label htmlFor="includePdf">Include PDF attachment</Label>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={sending || recipients.length === 0}
            className="w-full"
          >
            {sending ? 'Sending...' : `Send to ${recipients.length} recipient(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Todo List

- [ ] Install Nodemailer and React Email
- [ ] Configure SMTP transport
- [ ] Create email template (VN/EN)
- [ ] Create send email function
- [ ] Create send report API endpoint
- [ ] Build send report dialog component
- [ ] Add PDF generation (optional)
- [ ] Test email delivery
- [ ] Add error handling and retries

---

## Success Criteria

1. Emails sent successfully via SMTP
2. Template renders correctly in email clients
3. Both Vietnamese and English supported
4. Recipients can be added dynamically
5. PDF attachment works (when implemented)
6. Error handling for failed sends

---

## Risk Assessment

| Risk                  | Likelihood | Impact | Mitigation                     |
| --------------------- | ---------- | ------ | ------------------------------ |
| SMTP connection fails | Medium     | High   | Verify on startup, retry logic |
| Email marked as spam  | Medium     | Medium | Proper DKIM/SPF setup          |
| Large attachment size | Low        | Medium | Limit PDF content              |

---

## Security Considerations

- SMTP credentials in environment only
- Validate recipient email addresses
- Rate limit email sending
- Log all email attempts for audit
- Sanitize any user input in templates

---

## Next Steps

After completion, proceed to [Phase 11: Dashboard UI](./phase-11-dashboard-ui.md)
