import { readBody, createError, getHeader } from 'h3'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Seguridad básica: validar que venga de Supabase
  const signature = getHeader(event, 'x-supabase-signature')
  if (!signature) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { type, record } = body

  // Solo reaccionamos a nuevo usuario
  if (type !== 'INSERT') return { received: true }

  const userId = record.id
  const email = record.email

  // Crear tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: email.split('@')[0]
    }
  })

  // Crear relación usuario-tenant
  await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      userId,
      role: 'owner'
    }
  })

  return { success: true }
})