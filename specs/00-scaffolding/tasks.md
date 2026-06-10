# SPEC-00 Scaffolding — Tasks (poly-web)

> Trabajo inicial de infraestructura. No tiene spec.md ni plan.md.

## Estado: ✅ Completado

## Tareas realizadas

- [x] `npx create-next-app@latest` (Next.js 16, TypeScript, Tailwind v4, App Router)
- [x] Dependencias: `@clerk/nextjs` v7, `@tanstack/react-query` v5, `@tanstack/react-table` v8, `next-themes`
- [x] `npx shadcn@latest init` (Tailwind v4 compatible)
- [x] Componentes shadcn: button, table, badge, card, dialog, input, select, separator, skeleton
- [x] `app/globals.css` — tokens del design system (navy, amber, semáforo, slate-100)
- [x] Fuentes: `Inter` (`--font-inter`) + `Fraunces` (`--font-fraunces`) via `next/font/google`
- [x] `app/layout.tsx` — ClerkProvider + Providers (QueryClient) + fuentes
- [x] `app/providers.tsx` — QueryClient con TanStack Query
- [x] `middleware.ts` — clerkMiddleware protege rutas `(app)/`
- [x] `app/page.tsx` — redirect a /dashboard o /sign-in según auth
- [x] `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- [x] `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- [x] `app/(app)/layout.tsx` — auth guard + Sidebar + Header
- [x] `app/(app)/dashboard/page.tsx` — stub
- [x] `components/layout/Sidebar.tsx` — nav lateral con --navy-900
- [x] `components/layout/Header.tsx` — UserButton de Clerk
- [x] `features/casos/hooks/useCasos.ts`
- [x] `features/casos/types.ts`
- [x] `features/plazos/components/SemaforoIndicator.tsx`
- [x] `features/plazos/hooks/usePlazos.ts`
- [x] `features/dashboard/components/placeholder.tsx`
- [x] `lib/api/client.ts` — fetch wrapper con Bearer token
- [x] `lib/api/casos.ts` — funciones tipadas
- [x] `lib/api/types.ts` — mirrors de dominio Go
- [x] `.env.local.example`
- [x] `CLAUDE.md`, `ARCHITECTURE.md`
- [x] `npx tsc --noEmit` → clean
