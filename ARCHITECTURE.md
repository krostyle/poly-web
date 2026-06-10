# poly-web — Arquitectura frontend

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
