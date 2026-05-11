import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const id = event.context.params?.id
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400 })
  }

  const tag = await prisma.tag.updateMany({
    where: {
      id,
      tenantId
    },
    data: {
      name: body.name,
      color: body.color,
      defaultRate: body.defaultRate
    }
  })

  return tag
})