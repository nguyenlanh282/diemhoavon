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
import { saveCalculation } from '@/lib/actions/calculations'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function SaveCalculationButton() {
  const t = useTranslations('calculation')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCalculation(name || undefined)
      toast.success(tCommon('success'))
      setOpen(false)
      setName('')
    } catch {
      toast.error(tCommon('error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('saveResult')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('saveResult')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name (optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., January 2026 Projection"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
