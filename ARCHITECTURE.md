# poly-web — Arquitectura

## Sistema completo

```
┌─────────────────────────────────────────────────────┐
│  poly-web (Next.js 16 · Vercel)                     │
│  Browser → App Router → Clerk (auth) → lib/api      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/JSON  Authorization: Bearer <Clerk JWT>
                       ▼
┌─────────────────────────────────────────────────────┐
│  poly-api (Go · Railway)                            │
│  chi router → middleware (Clerk JWT) → use cases    │
│            → sqlc / Postgres (Neon)                 │
└─────────────────────────────────────────────────────┘
```

### Contrato entre repos

- Auth: poly-web pide JWT a Clerk → lo envía como `Authorization: Bearer`. poly-api verifica con Clerk SDK y extrae `org_id` (= `estudio_id`) + `user_id`.
- Base URL: `NEXT_PUBLIC_API_URL` en poly-web apunta a poly-api.
- Formato: JSON, fechas ISO 8601 (`2025-06-08`), IDs UUID v4.
- Errores: `{ "error": "mensaje" }` con HTTP code apropiado.

### Flujo de una request

```
1. Usuario en poly-web hace acción
2. useAuth().getToken() → JWT de Clerk
3. lib/api/client.ts → fetch a poly-api con Bearer token
4. middleware auth.go → verifica JWT, extrae estudio_id + banco_ids
5. Handler → use case (scope inyectado)
6. Use case → port → sqlc adapter → Neon
7. Resultado → JSON response
```

---

## Frontend

## Estructura de directorios

```
app/
  layout.tsx          Root layout: ClerkProvider + Providers (QueryClient) + fuentes
  page.tsx            Redirect → /dashboard (auth) o /sign-in (no auth)
  (auth)/             Rutas públicas de Clerk
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (app)/              Rutas protegidas (layout con auth guard + sidebar)
    layout.tsx        Auth guard + Sidebar + Header
    dashboard/page.tsx
    casos/            (por crear)
    casos/[id]/       (por crear)

features/             Código organizado por dominio
  casos/
    components/       Componentes de UI de casos
    hooks/            useCasos, useCaso, useCrearCaso (TanStack Query)
    types.ts          Re-export desde lib/api/types.ts
  plazos/
    components/       SemaforoIndicator (ya creado)
    hooks/            usePlazos
  dashboard/
    components/       Widgets del dashboard

components/
  ui/                 Generado por shadcn/ui (no editar directamente)
  layout/
    Sidebar.tsx       Navegación lateral (--navy-900)
    Header.tsx        UserButton de Clerk

lib/
  api/
    client.ts         fetch wrapper (BASE_URL + Bearer token)
    tipos.ts          Tipos TypeScript que espejo el dominio Go
    casos.ts          Funciones tipadas para endpoints de casos
    (más por agregar: plazos.ts, dashboard.ts, etc.)
  utils.ts            cn() de shadcn

middleware.ts          clerkMiddleware — protege todas las rutas (app)
```

## Flujo de datos

```
Server Component (page.tsx)
  → auth() de Clerk → userId → redirige si no auth
  → pasa datos iniciales a Client Component

Client Component
  → useAuth().getToken() → Bearer token
  → hook TanStack Query (features/*/hooks/)
    → lib/api/*.ts
      → fetch a poly-api
```

## Design system
Tokens en `app/globals.css` `:root`:
- `--navy-900`, `--navy-700` → sidebar, encabezados
- `--slate-100` → fondo de aplicación
- `--paper` → tarjetas, tablas
- `--amber-500` → acento: N° OT, foco
- `--ink-600` → texto secundario
- Semáforo: `--verde`, `--amarillo`, `--rojo`, `--vencido`

El semáforo es el **único** elemento con alta energía visual. El resto es quieto.
