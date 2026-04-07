'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const CURRENT_PROJECT_COOKIE = 'currentProjectId'

export async function getCurrentProjectId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CURRENT_PROJECT_COOKIE)?.value || null
}

export async function setCurrentProjectId(projectId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  // Verify project exists and belongs to user's organization
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

export async function clearCurrentProjectId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CURRENT_PROJECT_COOKIE)
  revalidatePath('/')
}
