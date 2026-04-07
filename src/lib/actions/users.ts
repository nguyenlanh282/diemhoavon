'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { Role } from '@/generated/prisma'

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
})

const userUpdateSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  password: z.string().min(6).optional(),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')
  if (session.user.role !== 'ADMIN') throw new Error('Admin access required')
  return session
}

export async function getUsers() {
  const session = await requireAdmin()

  return prisma.user.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          calculations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserById(id: string) {
  const session = await requireAdmin()

  return prisma.user.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  })
}

export async function createUser(input: UserCreateInput) {
  const session = await requireAdmin()
  const validated = userCreateSchema.parse(input)

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  })
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const hashedPassword = await hash(validated.password, 12)

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      name: validated.name,
      password: hashedPassword,
      role: validated.role as Role,
      organizationId: session.user.organizationId,
    },
  })

  revalidatePath('/users')
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function updateUser(id: string, input: UserUpdateInput) {
  const session = await requireAdmin()
  const validated = userUpdateSchema.parse(input)

  // Verify user belongs to same organization
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })
  if (!existingUser) throw new Error('User not found')

  // Prevent demoting the last admin
  if (existingUser.role === 'ADMIN' && validated.role !== 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
        role: 'ADMIN',
      },
    })
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last admin')
    }
  }

  const updateData: Record<string, unknown> = {
    name: validated.name,
    role: validated.role as Role,
  }

  if (validated.password) {
    updateData.password = await hash(validated.password, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  revalidatePath('/users')
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function deleteUser(id: string) {
  const session = await requireAdmin()

  // Verify user belongs to same organization
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })
  if (!existingUser) throw new Error('User not found')

  // Prevent deleting self
  if (existingUser.id === session.user.id) {
    throw new Error('Cannot delete yourself')
  }

  // Prevent deleting the last admin
  if (existingUser.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
        role: 'ADMIN',
      },
    })
    if (adminCount <= 1) {
      throw new Error('Cannot delete the last admin')
    }
  }

  await prisma.user.delete({
    where: { id },
  })

  revalidatePath('/users')
}

export async function getUserStats() {
  const session = await requireAdmin()

  const [total, byRole] = await Promise.all([
    prisma.user.count({
      where: { organizationId: session.user.organizationId },
    }),
    prisma.user.groupBy({
      by: ['role'],
      where: { organizationId: session.user.organizationId },
      _count: true,
    }),
  ])

  return {
    total,
    admins: byRole.find((r) => r.role === 'ADMIN')?._count || 0,
    managers: byRole.find((r) => r.role === 'MANAGER')?._count || 0,
    users: byRole.find((r) => r.role === 'USER')?._count || 0,
  }
}
