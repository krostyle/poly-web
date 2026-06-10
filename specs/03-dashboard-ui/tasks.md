# SPEC-03 Dashboard UI — Tasks

## Estado: 🔲 Pendiente (requiere poly-api SPEC-06)

## Tareas

### lib/api
- [ ] `lib/api/dashboard.ts` — funciones para /v1/dashboard/*

### features/dashboard
- [ ] `features/dashboard/hooks/useDashboard.ts` — 4 queries con refetchInterval
- [ ] `features/dashboard/components/CasosPorVencer.tsx`
- [ ] `features/dashboard/components/CasosNuevos.tsx`
- [ ] `features/dashboard/components/CasosEstancados.tsx`
- [ ] `features/dashboard/components/CargaPorAbogado.tsx`

### Rutas
- [ ] Completar `app/(app)/dashboard/page.tsx` con los 4 widgets reales

### Verificación
- [ ] Dashboard muestra datos reales de poly-api
- [ ] Casos ROJO/VENCIDO visualmente prominentes
- [ ] Refetch cada 5 min
- [ ] Click en fila → /casos/:id
