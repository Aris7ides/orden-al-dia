import { readBody } from 'h3'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const user = body.record

  const tenant = await prisma.tenant.create({
    data: {
      name: user.email
    }
  })

  await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'member'
    }
  })

  return { ok: true }
})