import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { getProjects, getCurrentProjectId } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectForm } from '@/components/projects/project-form'

export default async function ProjectsPage() {
  const [projects, currentProjectId] = await Promise.all([getProjects(), getCurrentProjectId()])

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dự án</h1>
          <p className="text-muted-foreground">Quản lý các dự án kinh doanh của bạn</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo dự án mới</DialogTitle>
            </DialogHeader>
            <ProjectForm />
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<ProjectsSkeleton />}>
        {projects.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Chưa có dự án nào</CardTitle>
              <CardDescription>
                Tạo dự án đầu tiên để bắt đầu quản lý chi phí và tính điểm hòa vốn.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo dự án đầu tiên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo dự án mới</DialogTitle>
                  </DialogHeader>
                  <ProjectForm />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={project.id === currentProjectId}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="bg-muted h-5 w-32 rounded" />
            <div className="bg-muted mt-2 h-4 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="bg-muted h-4 w-24 rounded" />
              <div className="bg-muted h-8 w-16 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
