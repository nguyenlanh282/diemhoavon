import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { Role } from '@/generated/prisma'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create organization and user in a transaction
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: data.organizationName },
      })

      await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: Role.ADMIN, // First user is admin
          organizationId: org.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
