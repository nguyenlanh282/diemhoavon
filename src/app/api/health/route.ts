import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
    },
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    healthcheck.checks.database = 'healthy'
  } catch {
    healthcheck.checks.database = 'unhealthy'
    healthcheck.status = 'unhealthy'

    return NextResponse.json(healthcheck, { status: 503 })
  }

  return NextResponse.json(healthcheck, { status: 200 })
}
