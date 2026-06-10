# SPEC-04 UI Plazos — Tasks

## Estado: 🔲 Pendiente (requiere poly-api SPEC-04 y poly-web SPEC-02)

## Tareas

### lib/api
- [ ] `lib/api/plazos.ts` — listarPlazos, marcarCumplido

### features/plazos
- [ ] `features/plazos/hooks/usePlazos.ts` — completar (actualmente stub)
- [ ] `features/plazos/hooks/useMarcarCumplido.ts` — mutation con optimistic update
- [ ] `features/plazos/components/PlazosTable.tsx` — tabla global
- [ ] `features/plazos/components/PlazoCumplirButton.tsx`

### Rutas
- [ ] `app/(app)/plazos/page.tsx` — vista global

### Verificación
- [ ] Lista global de plazos activos carga
- [ ] Marcar cumplido → desaparece de la lista (optimistic)
- [ ] Filtro por semáforo funciona
