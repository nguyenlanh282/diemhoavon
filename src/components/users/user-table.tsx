'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { deleteUser } from '@/lib/actions/users'
import { toast } from 'sonner'
import { UserFormDialog } from './user-form-dialog'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'MANAGER' | 'USER'
  emailVerified: Date | null
  createdAt: Date
  _count?: {
    calculations: number
  }
}

interface UserTableProps {
  users: User[]
  locale: string
  currentUserId?: string
  onRefresh?: () => void
}

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  USER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const roleLabels = {
  vi: { ADMIN: 'Quản trị', MANAGER: 'Quản lý', USER: 'Người dùng' },
  en: { ADMIN: 'Admin', MANAGER: 'Manager', USER: 'User' },
}

export function UserTable({ users, locale, currentUserId, onRefresh }: UserTableProps) {
  const t = useTranslations('common')
  const isVi = locale === 'vi'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setDeleting(true)
    try {
      await deleteUser(selectedUser.id)
      toast.success(isVi ? 'Đã xóa người dùng' : 'User deleted successfully')
      setDeleteDialogOpen(false)
      onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isVi ? 'Tên' : 'Name'}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{isVi ? 'Vai trò' : 'Role'}</TableHead>
            <TableHead className="text-center">{isVi ? 'Tính toán' : 'Calculations'}</TableHead>
            <TableHead>{isVi ? 'Ngày tạo' : 'Created'}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name || '-'}
                {user.id === currentUserId && (
                  <Badge variant="outline" className="ml-2">
                    {isVi ? 'Bạn' : 'You'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={roleColors[user.role]}>
                  {roleLabels[isVi ? 'vi' : 'en'][user.role]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{user._count?.calculations || 0}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    {user.id !== currentUserId && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isVi ? 'Xác nhận xóa người dùng' : 'Delete User'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isVi
                ? `Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.name || selectedUser?.email}"? Hành động này không thể hoàn tác.`
                : `Are you sure you want to delete "${selectedUser?.name || selectedUser?.email}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? t('loading') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <UserFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) onRefresh?.()
        }}
        user={selectedUser}
        locale={locale}
      />
    </>
  )
}
