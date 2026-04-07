'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { projectSchema, type ProjectInput } from '@/lib/validations/project'
import { createProject, updateProject } from '@/lib/actions/projects'

interface ProjectFormProps {
  project?: {
    id: string
    name: string
    description: string | null
  }
  onSuccess?: () => void
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  })

  const onSubmit = (data: ProjectInput) => {
    startTransition(async () => {
      try {
        if (project) {
          await updateProject(project.id, data)
          toast.success('Đã cập nhật dự án')
        } else {
          await createProject(data)
          toast.success('Đã tạo dự án mới')
        }
        form.reset()
        router.refresh()
        onSuccess?.()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên dự án</FormLabel>
              <FormControl>
                <Input placeholder="VD: Cửa hàng ABC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea placeholder="Mô tả ngắn về dự án..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : project ? 'Cập nhật' : 'Tạo dự án'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
