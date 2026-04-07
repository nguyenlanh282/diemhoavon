'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadPdfButtonProps {
  locale: string
}

export function DownloadPdfButton({ locale }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false)
  const isVi = locale === 'vi'

  const handleDownload = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/pdf?locale=${locale}`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `break-even-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(isVi ? 'PDF đã được tải xuống' : 'PDF downloaded successfully')
    } catch {
      toast.error(isVi ? 'Không thể tạo PDF' : 'Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? (isVi ? 'Đang tạo...' : 'Generating...') : isVi ? 'Tải PDF' : 'Download PDF'}
    </Button>
  )
}
