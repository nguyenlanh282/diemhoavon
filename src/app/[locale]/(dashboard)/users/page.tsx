'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Shield, UserCog } from 'lucide-react'
import { UserTable } from '@/components/users/user-table'
import { UserFormDialog } from '@/components/users/user-form-dialog'
import { getUsers, getUserStats } from '@/lib/actions/users'
import { useSession } from 'next-auth/react'

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

interface Stats {
  total: number
  admins: number
  managers: number
  users: number
}

export default function UsersPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'vi'
  const isVi = locale === 'vi'
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, managers: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([getUsers(), getUserStats()])
      setUsers(usersData as User[])
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reload data when dialog closes
  const handleDialogChange = (open: boolean) => {
    setAddDialogOpen(open)
    if (!open) {
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-muted-foreground text-center">
          {isVi ? 'Đang tải...' : 'Loading...'}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isVi ? 'Quản lý người dùng' : 'User Management'}</h1>
          <p className="text-muted-foreground">
            {isVi
              ? 'Quản lý tài khoản và phân quyền người dùng'
              : 'Manage user accounts and permissions'}
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {isVi ? 'Thêm người dùng' : 'Add User'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {isVi ? 'Tổng người dùng' : 'Total Users'}
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {isVi ? 'Quản trị' : 'Admins'}
            </CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {isVi ? 'Quản lý' : 'Managers'}
            </CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.managers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {isVi ? 'Người dùng' : 'Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.users}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isVi ? 'Danh sách người dùng' : 'User List'}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable users={users} locale={locale} currentUserId={session?.user?.id} onRefresh={loadData} />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <UserFormDialog open={addDialogOpen} onOpenChange={handleDialogChange} locale={locale} />
    </div>
  )
}
