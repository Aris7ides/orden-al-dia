import { getHeader, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '~~/server/utils/prisma'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export async function requireUser(event: any) {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')

  // Validamos el token directamente con Supabase (no necesita JWT_SECRET manual)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const userId = user.id

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