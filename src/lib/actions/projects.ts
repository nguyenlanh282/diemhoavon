'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { projectSchema, type ProjectInput } from '@/lib/validations/project'

const CURRENT_PROJECT_COOKIE = 'currentProjectId'

export async function getProjects() {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const projects = await prisma.project.findMany({
    where: {
      organizationId: session.user.organizationId,
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          products: { where: { isActive: true, deletedAt: null } },
          calculations: true,
        },
      },
    },
  })

  return projects
}

export async function getProjectById(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })

  return project
}

export async function createProject(input: ProjectInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = projectSchema.parse(input)

  // Check if name already exists
  const existing = await prisma.project.findFirst({
    where: {
      organizationId: session.user.organizationId,
      name: validated.name,
      deletedAt: null,
    },
  })

  if (existing) {
    throw new Error('Tên dự án đã tồn tại')
  }

  const project = await prisma.project.create({
    data: {
      organizationId: session.user.organizationId,
      name: validated.name,
      description: validated.description,
    },
  })

  revalidatePath('/projects')
  return project
}

export async function updateProject(id: string, input: ProjectInput) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const validated = projectSchema.parse(input)

  // Check if project exists
  const existing = await prisma.project.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })

  if (!existing) {
    throw new Error('Dự án không tồn tại')
  }

  // Check if name conflicts with another project
  const nameConflict = await prisma.project.findFirst({
    where: {
      organizationId: session.user.organizationId,
      name: validated.name,
      deletedAt: null,
      id: { not: id },
    },
  })

  if (nameConflict) {
    throw new Error('Tên dự án đã tồn tại')
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
    },
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return project
}

export async function deleteProject(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Check if project exists and is not default
  const existing = await prisma.project.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })

  if (!existing) {
    throw new Error('Dự án không tồn tại')
  }

  if (existing.isDefault) {
    throw new Error('Không thể xóa dự án mặc định')
  }

  // Soft delete
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })

  // Clear cookie if deleted project was selected
  const cookieStore = await cookies()
  const currentProjectId = cookieStore.get(CURRENT_PROJECT_COOKIE)?.value
  if (currentProjectId === id) {
    cookieStore.delete(CURRENT_PROJECT_COOKIE)
  }

  revalidatePath('/projects')
}

export async function setDefaultProject(id: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Verify project exists
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })

  if (!project) {
    throw new Error('Dự án không tồn tại')
  }

  // Unset current default
  await prisma.project.updateMany({
    where: {
      organizationId: session.user.organizationId,
      isDefault: true,
    },
    data: { isDefault: false },
  })

  // Set new default
  await prisma.project.update({
    where: { id },
    data: { isDefault: true },
  })

  revalidatePath('/projects')
}

export async function getCurrentProjectId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CURRENT_PROJECT_COOKIE)?.value || null
}

export async function setCurrentProjectId(projectId: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Verify project exists
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  })

  if (!project) {
    throw new Error('Dự án không tồn tại')
  }

  const cookieStore = await cookies()
  cookieStore.set(CURRENT_PROJECT_COOKIE, projectId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  revalidatePath('/')
}

export async function getCurrentProject() {
  const session = await auth()
  if (!session?.user?.organizationId) return null

  const projectId = await getCurrentProjectId()

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
    })
    if (project) return project
  }

  // Fall back to default project
  const defaultProject = await prisma.project.findFirst({
    where: {
      organizationId: session.user.organizationId,
      isDefault: true,
      deletedAt: null,
    },
  })

  return defaultProject
}

export async function getOrCreateDefaultProject() {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Try to get default project
  let defaultProject = await prisma.project.findFirst({
    where: {
      organizationId: session.user.organizationId,
      isDefault: true,
      deletedAt: null,
    },
  })

  // Create if not exists
  if (!defaultProject) {
    defaultProject = await prisma.project.create({
      data: {
        organizationId: session.user.organizationId,
        name: 'Dự án mặc định',
        isDefault: true,
      },
    })
  }

  return defaultProject
}
