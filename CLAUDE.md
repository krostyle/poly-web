# poly-web — Harness

## Stack
Next.js 16.2 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Clerk v7 · TanStack Query v5 · TanStack Table v8

## Lee antes de codear
1. `ARCHITECTURE.md` — estructura de features y cómo se conecta a poly-api
2. `specs/{feature}/spec.md` — requisitos de la feature activa
3. `specs/{feature}/tasks.md` — qué falta hacer
4. `node_modules/next/dist/docs/` — APIs que cambiaron en Next.js 16 (leer antes de asumir)

## Convenciones de Next.js 16
- `params` en pages y layouts es `Promise<{...}>` — siempre `await params`
- Componentes Server por defecto; `"use client"` solo cuando hay interacción
- Fuentes: `Inter` para UI (`--font-inter`), `Fraunces` para títulos y N° OT (`--font-fraunces`)
- CSS variables Tailwind v4: `bg-(--navy-900)` no `bg-[var(--navy-900)]`

## Convenciones de Clerk v7
- `ClerkProvider` ya está en el root layout — no agregarlo en otros lugares
- `UserButton` no acepta `afterSignOutUrl` — configurar via env `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL`
- En Server Components: `import { auth } from "@clerk/nextjs/server"`
- En Client Components: `import { useAuth } from "@clerk/nextjs"`

## Estructura de features
- Lógica de datos en `features/{feature}/hooks/` (TanStack Query)
- Tipos en `features/{feature}/types.ts` (o re-export desde `lib/api/types.ts`)
- Componentes en `features/{feature}/components/`
- API calls solo a través de `lib/api/` — nunca `fetch()` directo a poly-api en componentes

## Reglas
- No mezclar lógica de negocio en componentes — va en hooks o en `lib/api/`
- El semáforo de plazos es el único elemento con energía visual fuerte — no agregar colores llamativos en otras partes
- `tabular-nums` en todas las columnas de montos, fechas y días

## Comandos
```
npm run dev    # Next.js en :3000
npm run build  # build de producción
npx tsc --noEmit  # chequeo de tipos sin compilar
```
