# CLAUDE.md — Orden Al Día

Agenda y control mensual de horas e ingresos. PWA **mobile-first** en español.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Nuxt 4** (Vue 3 + TypeScript) |
| UI | **@nuxt/ui v4** (Tailwind CSS v4) |
| Calendario | **FullCalendar v6** |
| Auth | **Supabase Auth** (client-side) |
| Base de datos | **PostgreSQL** via **Prisma v7** + `@prisma/adapter-pg` |
| Validación | **Zod v4** |
| PWA | **@vite-pwa/nuxt** — standalone, orientación portrait, tema oscuro |

Variables de entorno necesarias: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`.

---

## Mobile-First

Esta aplicación está diseñada **primero para móvil**:

- PWA instalable (standalone, portrait) para usarse como app nativa.
- El layout principal (`app/layouts/default.vue`) tiene un header fijo y un sidebar flotante pensados para pantallas pequeñas.
- FullCalendar en la home ofrece vistas list/day/week/month adaptadas a móvil.
- Paleta de colores contenida: primary=purple, secondary=blue, neutral=zinc.
- Toda la navegación cabe en un sidebar compacto con iconos Lucide.

---

## Arquitectura

### Multi-tenant desde el inicio
Cada recurso (`Tag`, `Event`) está scoped a un `tenantId`. La identidad del usuario viene de Supabase; la pertenencia al tenant se gestiona en `TenantUser`.

### Auth flow
1. `app/utils/supabase.client.ts` — cliente Supabase singleton (browser).
2. `app/middleware/auth.ts` — guard global: si no hay sesión activa redirige a `/login`.
3. `app/composables/useAuth.ts` — expone `user` (useState global) + `loadUser()`.
4. El servidor **aún no valida el JWT** en los endpoints API.

### Prisma
- Output personalizado: `prisma/generated/client` (alias Nuxt `~~`).
- Singleton con patrón `globalThis` en `server/utils/prisma.ts` (seguro en hot-reload).
- `build`: `prisma generate && nuxt build` / `postinstall`: `prisma generate && nuxt prepare`.

---

## Base de datos (schema.prisma)

```
Tenant          id, name, createdAt
TenantUser      id, tenantId, userId (Supabase UUID), role, createdAt  @@unique([tenantId, userId])
Tag             id, tenantId, name, color?, createdAt
Event           id, tenantId, tagId?, title, description?, startTime, endTime,
                hourlyRate?, totalAmount?, createdBy?, createdAt
```

`totalAmount` se calcula en el servidor: `hourlyRate × duración en horas`.

---

## Rutas

| Ruta | Estado | Notas |
|------|--------|-------|
| `/` | ✅ Funcional | FullCalendar con vistas month/week/day/list |
| `/login` | ⚠️ Parcial | UI completa; submit y Google OAuth son stubs |
| `/eventos` | 🔲 Stub | Vacío |
| `/etiquetas` | 🔲 Stub | Vacío |
| `/resumen` | 🔲 Stub | Vacío |
| `/configuracion` | 🔲 Stub | Vacío |

Layouts: `default` (shell con nav) para las rutas principales; `blank` para `/login` y errores.

---

## API Endpoints

| Método | Ruta | Estado |
|--------|------|--------|
| `POST` | `/api/events` | ✅ Funcional — valida, calcula duración, guarda en DB |
| `GET` | `/api/users` | ❌ Roto — referencia `prisma.user` que no existe en el schema |
| `*` | `/api/tags/*` | 🔲 Directorio vacío, sin implementar |

---

## Convenciones del proyecto

- Código y UI en **español**.
- Imports del cliente Prisma generado via alias `~~/prisma/generated/client`.
- Validación con Zod en los endpoints del servidor antes de tocar la DB.
- Los user IDs de Supabase se almacenan como `String` UUID en la DB (no FK nativa).
- No hay tests todavía.

---

## Estado actual (inicio del proyecto)

- Autenticación aún no funcional end-to-end (formulario de login no conectado).
- Solo el endpoint `POST /api/events` y la home con FullCalendar tienen lógica real.
- El resto de páginas y la mayoría de endpoints están por implementar.
- La vinculación frontend ↔ tenant no está cableada.
