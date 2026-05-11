import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api')) return

  // ✅ EXCLUIR WEBHOOK
  if (event.path.startsWith('/api/webhooks')) return
  
  const user = await requireUser(event)

  event.context.user = user
})