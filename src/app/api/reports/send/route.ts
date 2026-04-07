import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { calculateCurrentBreakEven } from '@/lib/actions/calculations'
import { sendBreakEvenReport } from '@/lib/email/send'
import { generateBreakEvenPdf } from '@/lib/pdf/generate'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const sendReportSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  locale: z.enum(['vi', 'en']).default('vi'),
  includePdf: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipients, locale, includePdf } = sendReportSchema.parse(body)

    // Get current calculation
    const { result } = await calculateCurrentBreakEven()

    // Get organization name
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })

    // Generate PDF if requested
    let pdfBuffer: Buffer | undefined
    if (includePdf) {
      pdfBuffer = await generateBreakEvenPdf({
        result,
        organizationName: org?.name || 'Organization',
        locale,
      })
    }

    // Send to each recipient
    const results = await Promise.allSettled(
      recipients.map((email) =>
        sendBreakEvenReport({
          to: email,
          recipientName: email.split('@')[0], // Fallback name
          organizationName: org?.name || 'Organization',
          locale,
          result,
          pdfBuffer,
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
