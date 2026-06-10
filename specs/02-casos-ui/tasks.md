# SPEC-02 UI Casos — Tasks

## Estado: 🔲 Pendiente (requiere poly-api SPEC-02)

## Tareas

### lib/api
- [ ] `lib/api/plazos.ts` — `listarPlazos(casoId, token)`
- [ ] `lib/api/casos.ts` — completar con `actualizarCaso`, paginación

### features/casos
- [ ] `features/casos/hooks/useCasos.ts` — completar con filtros
- [ ] `features/casos/hooks/useCaso.ts` — detalle de un caso
- [ ] `features/casos/hooks/useCrearCaso.ts` — mutation
- [ ] `features/casos/components/CasosTable.tsx` — TanStack Table
- [ ] `features/casos/components/CasoDetalle.tsx`
- [ ] `features/casos/components/CrearCasoForm.tsx`
- [ ] `features/casos/components/TransicionarEstadoModal.tsx`

### Rutas
- [ ] `app/(app)/casos/page.tsx` — listado
- [ ] `app/(app)/casos/nuevo/page.tsx` — formulario
- [ ] `app/(app)/casos/[id]/page.tsx` — detalle

### Sidebar
- [ ] Agregar link "Casos" al Sidebar (ya tiene el href, falta la ruta)

### Verificación
- [ ] Lista de casos carga desde poly-api
- [ ] Crear caso → aparece en la lista
- [ ] Detalle muestra plazos con semáforo
- [ ] N° OT en Fraunces + amber
