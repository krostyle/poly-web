# SPEC-06 UI Filtros y búsqueda en Casos

## Propósito

La lista de casos (`/casos`) actualmente muestra los últimos 50 sin forma de buscar ni filtrar. A medida que crecen los casos, el equipo necesita encontrar casos específicos por cliente, banco, abogado o estado.

## User stories

- Como usuario, puedo buscar casos por nombre o RUT del cliente.
- Como usuario, puedo filtrar por banco (solo los bancos a los que tengo acceso).
- Como usuario, puedo filtrar por estado del caso.
- Como abogado, puedo ver solo mis propios casos marcando un toggle "Mis casos".
- Como usuario, el resultado se actualiza mientras escribo (debounce 300ms).

## Cambios en el backend

El endpoint `GET /v1/casos` ya recibe `CaseFilters` pero solo usa `banco_ids` del scope guard. Hay que extender el handler para aceptar query params:

```
GET /v1/casos?q=&banco_id=&estado=&abogado_id=&limit=50&offset=0
```

- `q` — búsqueda por nombre o RUT del cliente (ILIKE `%q%`)
- `banco_id` — filtro adicional sobre los bancos ya permitidos por el scope
- `estado` — filtro por estado exacto
- `abogado_id` — si se pasa `"me"` el backend lo resuelve al usuario del token

El backend debe retornar `{ casos: [...], total: number }` con el total sin paginar para que el cliente pueda mostrar paginación si es necesario.

## Componentes a crear / modificar

### Backend (poly-api)
- `internal/adapters/http/handlers/casos.go` — leer `q`, `banco_id`, `estado`, `abogado_id` del query string
- `internal/adapters/persistence/caso_repo.go` — extender `ListRich` para los nuevos filtros
- `internal/domain/ports.go` — agregar `Query`, `AbogadoID` a `CaseFilters`

### Frontend (poly-web)
- `features/casos/hooks/useCasos.ts` — aceptar `filters` param, pasar al query key
- `features/casos/components/CasosFilters.tsx` — barra de búsqueda + selects de banco/estado
- `app/(app)/casos/page.tsx` — integrar `CasosFilters` sobre la tabla

## UX

```
┌─────────────────────────────────────────────────────┐
│ [🔍 Buscar por cliente o RUT...] [Banco ▾] [Estado ▾] [Mis casos □] │
├─────────────────────────────────────────────────────┤
│ tabla de casos                                      │
└─────────────────────────────────────────────────────┘
```

- Búsqueda con debounce 300ms
- Selects sin "Todos" también sirven como "sin filtro" (valor vacío)
- Toggle "Mis casos" visible solo si el usuario es ABOGADO o ADMIN
- Estado vacío filtrado: "Sin resultados para '[búsqueda]'."
- Skeleton se muestra mientras carga tras cambiar filtros

## Tipos

```typescript
// lib/api/casos.ts
interface CasoFilters {
  q?: string;
  bancoId?: string;
  estado?: Estado;
  soloMios?: boolean;
}
```

## Dependencias

- `GET /v1/casos` extendido con query params (cambio en poly-api)
- `useMe` para obtener el ID del usuario autenticado (para "Mis casos")
