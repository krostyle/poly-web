# SPEC-01 Auth UI — Tasks

## Estado: 🔲 Pendiente (requiere poly-api SPEC-01)

## Tareas

### Bootstrap
- [ ] `lib/api/auth.ts` — función `bootstrap()` → `POST /v1/bootstrap`
- [ ] Llamar `bootstrap()` en `app/(app)/layout.tsx` al cargar (Server Component)
- [ ] Manejo de error no bloqueante (toast en Client Component)

### Sidebar
- [ ] Importar `useOrganization()` de `@clerk/nextjs` para mostrar nombre del estudio
- [ ] Marcar ruta activa con `usePathname()` (highlight visual)
- [ ] `Sidebar.tsx` como Client Component (`"use client"`)

### Pantalla sin organización
- [ ] Detectar ausencia de org activa en el layout protegido
- [ ] Mostrar mensaje "Selecciona o crea un estudio en Clerk" con link

### Verificación
- [ ] Usuario sin sesión → redirige a /sign-in
- [ ] Login con org activa → dashboard
- [ ] `POST /v1/bootstrap` se llama al primer acceso
- [ ] Sidebar muestra nombre del estudio
