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
