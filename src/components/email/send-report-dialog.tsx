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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface SendReportDialogProps {
  locale: string
}

export function SendReportDialog({ locale }: SendReportDialogProps) {
  const t = useTranslations('email')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  const isVi = locale === 'vi'

  const addRecipient = () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (trimmedEmail && !recipients.includes(trimmedEmail)) {
      // Basic email validation
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setRecipients([...recipients, trimmedEmail])
        setEmail('')
      } else {
        toast.error(isVi ? 'Email không hợp lệ' : 'Invalid email address')
      }
    }
  }

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRecipient()
    }
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error(isVi ? 'Thêm ít nhất một người nhận' : 'Add at least one recipient')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, locale }),
      })

      if (!res.ok) throw new Error('Failed to send')

      const data = await res.json()
      toast.success(
        isVi
          ? `Đã gửi báo cáo đến ${data.sent} người nhận`
          : `Report sent to ${data.sent} recipient(s)`
      )
      setOpen(false)
      setRecipients([])
    } catch {
      toast.error(isVi ? 'Gửi báo cáo thất bại' : 'Failed to send report')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{isVi ? 'Gửi Email' : 'Send Email'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isVi ? 'Gửi Báo Cáo Qua Email' : 'Send Report via Email'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add recipient */}
          <div className="space-y-2">
            <Label>{isVi ? 'Người nhận' : 'Recipients'}</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={addRecipient}>
                {tCommon('add')}
              </Button>
            </div>
          </div>

          {/* Recipient list */}
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <Badge key={r} variant="secondary" className="gap-1">
                  {r}
                  <button onClick={() => removeRecipient(r)} className="ml-1 hover:text-red-500">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={sending || recipients.length === 0}
            className="w-full"
          >
            {sending
              ? tCommon('loading')
              : isVi
                ? `Gửi đến ${recipients.length} người nhận`
                : `Send to ${recipients.length} recipient(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
