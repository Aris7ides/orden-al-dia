import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { tenantId } = await requireUser(event)
  const body = await readBody(event)

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  const tag = await prisma.tag.create({
    data: {
      tenantId,
      name: body.name,
      color: body.color,
      defaultRate: body.defaultRate
    }
  })

  return tag
})