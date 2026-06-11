# SPEC-06 Filtros Casos — Tasks

## Estado: 🔲 Pendiente

## Tareas

### Backend (poly-api)

- [ ] `internal/domain/ports.go` — agregar `Query string` y `AbogadoIDFilter *string` a `CaseFilters`
- [ ] `internal/adapters/persistence/caso_repo.go` — extender SQL de `ListRich`:
  - `AND ($n = '' OR c.estado::text = $n)`
  - `AND ($n = '' OR cl.rut ILIKE $n OR cl.nombre ILIKE $n)`
  - `AND ($n IS NULL OR c.abogado_id = $n)`
- [ ] `internal/adapters/http/handlers/casos.go` — leer `?q=`, `?estado=`, `?abogado_id=` del query string; si `abogado_id=me`, resolver al usuario del token

### Frontend (poly-web)

- [ ] `lib/api/casos.ts` — agregar `CasoFilters` interface, pasar params al query string de `listarCasos`
- [ ] `features/casos/hooks/useCasos.ts` — aceptar `filters?: CasoFilters`, incluirlos en `queryKey`
- [ ] `features/casos/components/CasosFilters.tsx` — componente con input de búsqueda (debounce 300ms), Select banco, Select estado, toggle "Mis casos"
- [ ] `app/(app)/casos/page.tsx` — integrar `CasosFilters`, pasar estado de filtros a `useCasos`

### Verificación

- [ ] Buscar "pérez" → solo casos de clientes que contengan "pérez" en nombre o RUT
- [ ] Filtrar por estado JUDICIALIZACION → solo esos casos
- [ ] Toggle "Mis casos" → solo casos asignados al usuario
- [ ] Limpiar filtros → vuelve a mostrar todos
- [ ] `npx tsc --noEmit` sin errores
