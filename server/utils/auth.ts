import { getHeader, createError } from 'h3'
import jwt from 'jsonwebtoken'
import { prisma } from '~~/server/utils/prisma'

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!

export async function requireUser(event: any) {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')

  let payload: any

  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const userId = payload.sub

  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId }
  })

  if (!tenantUser) {
    throw createError({ statusCode: 403, statusMessage: 'No tenant assigned' })
  }

  return {
    userId,
    tenantId: tenantUser.tenantId,
    role: tenantUser.role
  }
}