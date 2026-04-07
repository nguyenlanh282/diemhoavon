'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser, updateUser } from '@/lib/actions/users'
import { toast } from 'sonner'

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
})

const updateSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
})

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'MANAGER' | 'USER'
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  locale: string
}

export function UserFormDialog({ open, onOpenChange, user, locale }: UserFormDialogProps) {
  const isVi = locale === 'vi'
  const isEdit = !!user
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'USER' as const,
    },
  })

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '')
      setValue('role', user.role)
      setValue('password', '')
    } else {
      reset()
    }
  }, [user, setValue, reset])

  const onSubmit = async (data: z.infer<typeof createSchema> | z.infer<typeof updateSchema>) => {
    setLoading(true)
    try {
      if (isEdit && user) {
        const updateData = {
          name: data.name,
          role: data.role,
          password: data.password || undefined,
        }
        await updateUser(user.id, updateData)
        toast.success(isVi ? 'Đã cập nhật người dùng' : 'User updated successfully')
      } else {
        await createUser(data as z.infer<typeof createSchema>)
        toast.success(isVi ? 'Đã tạo người dùng mới' : 'User created successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const role = watch('role')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? isVi
                ? 'Chỉnh sửa người dùng'
                : 'Edit User'
              : isVi
                ? 'Thêm người dùng mới'
                : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="user@example.com"
              />
              {'email' in errors && errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{isVi ? 'Tên' : 'Name'}</Label>
            <Input id="name" {...register('name')} placeholder={isVi ? 'Nhập tên' : 'Enter name'} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isVi ? 'Mật khẩu' : 'Password'}
              {isEdit && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({isVi ? 'để trống nếu không đổi' : 'leave blank to keep current'})
                </span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={isEdit ? '******' : isVi ? 'Nhập mật khẩu' : 'Enter password'}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{isVi ? 'Vai trò' : 'Role'}</Label>
            <Select value={role} onValueChange={(v) => setValue('role', v as typeof role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">{isVi ? 'Người dùng' : 'User'}</SelectItem>
                <SelectItem value="MANAGER">{isVi ? 'Quản lý' : 'Manager'}</SelectItem>
                <SelectItem value="ADMIN">{isVi ? 'Quản trị' : 'Admin'}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {role === 'ADMIN' &&
                (isVi
                  ? 'Quản trị có quyền quản lý người dùng và tất cả dữ liệu'
                  : 'Admins can manage users and all data')}
              {role === 'MANAGER' &&
                (isVi
                  ? 'Quản lý có quyền xem và chỉnh sửa dữ liệu'
                  : 'Managers can view and edit data')}
              {role === 'USER' &&
                (isVi ? 'Người dùng có quyền xem dữ liệu' : 'Users can view data')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isVi ? 'Hủy' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isVi
                  ? 'Đang lưu...'
                  : 'Saving...'
                : isEdit
                  ? isVi
                    ? 'Cập nhật'
                    : 'Update'
                  : isVi
                    ? 'Thêm người dùng'
                    : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
