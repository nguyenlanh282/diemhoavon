import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { calculateCurrentBreakEven } from '@/lib/actions/calculations'
import { generateBreakEvenPdf } from '@/lib/pdf/generate'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const pdfReportSchema = z.object({
  locale: z.enum(['vi', 'en']).default('vi'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locale = pdfReportSchema.parse({
      locale: searchParams.get('locale') || 'vi',
    }).locale

    // Get current calculation
    const { result } = await calculateCurrentBreakEven()

    // Get organization name
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })

    // Generate PDF
    const pdfBuffer = await generateBreakEvenPdf({
      result,
      organizationName: org?.name || 'Organization',
      locale,
    })

    // Return PDF as download
    const filename = `break-even-report-${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
