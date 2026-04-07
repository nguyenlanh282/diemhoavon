'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2, Star, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { deleteProject, setDefaultProject, setCurrentProjectId } from '@/lib/actions/projects'
import { ProjectForm } from './project-form'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    isDefault: boolean
    _count?: {
      products: number
      calculations: number
    }
  }
  isSelected?: boolean
}

export function ProjectCard({ project, isSelected }: ProjectCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSelect = () => {
    startTransition(async () => {
      await setCurrentProjectId(project.id)
      router.push('/calculator')
    })
  }

  const handleSetDefault = () => {
    startTransition(async () => {
      try {
        await setDefaultProject(project.id)
        toast.success('Đã đặt làm dự án mặc định')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id)
        toast.success('Đã xóa dự án')
        setShowDeleteDialog(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <>
      <Card className={isSelected ? 'border-primary' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="text-muted-foreground h-5 w-5" />
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Mặc định
                </Badge>
              )}
              {isSelected && <Badge className="text-xs">Đang chọn</Badge>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                {!project.isDefault && (
                  <DropdownMenuItem onClick={handleSetDefault}>
                    <Star className="mr-2 h-4 w-4" />
                    Đặt làm mặc định
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!project.isDefault && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {project.description && (
            <CardDescription className="mt-1">{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex gap-4 text-sm">
              <span>{project._count?.products || 0} sản phẩm</span>
              <span>{project._count?.calculations || 0} tính toán</span>
            </div>
            <Button size="sm" onClick={handleSelect} disabled={isPending}>
              {isSelected ? 'Đã chọn' : 'Chọn'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dự án</DialogTitle>
          </DialogHeader>
          <ProjectForm project={project} onSuccess={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa dự án?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dự án &quot;{project.name}&quot;? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
