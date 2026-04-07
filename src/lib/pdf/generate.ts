import { renderToBuffer } from '@react-pdf/renderer'
import { BreakEvenPdf } from './templates/break-even-report'
import type { BreakEvenResult } from '@/lib/calculations/break-even'

interface GeneratePdfParams {
  result: BreakEvenResult
  organizationName: string
  locale: 'vi' | 'en'
}

export async function generateBreakEvenPdf({
  result,
  organizationName,
  locale,
}: GeneratePdfParams): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(BreakEvenPdf({ result, organizationName, locale }))
  return Buffer.from(pdfBuffer)
}
