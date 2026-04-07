'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Check, ChevronsUpDown, Plus, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setCurrentProjectId } from '@/lib/actions/projects'

interface Project {
  id: string
  name: string
  isDefault: boolean
  _count?: {
    products: number
    calculations: number
  }
}

interface ProjectSelectorProps {
  projects: Project[]
  currentProjectId: string | null
}

export function ProjectSelector({ projects, currentProjectId }: ProjectSelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects.find((p) => p.isDefault)

  const handleSelectProject = (projectId: string) => {
    startTransition(async () => {
      await setCurrentProjectId(projectId)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
          disabled={isPending}
        >
          <div className="flex items-center gap-2 truncate">
            <FolderKanban className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentProject?.name || 'Chọn dự án'}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleSelectProject(project.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{project.name}</span>
              {project.isDefault && (
                <span className="text-muted-foreground text-xs">(Mặc định)</span>
              )}
            </div>
            {currentProject?.id === project.id && <Check className="h-4 w-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/projects')}>
          <Plus className="mr-2 h-4 w-4" />
          Quản lý dự án
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
