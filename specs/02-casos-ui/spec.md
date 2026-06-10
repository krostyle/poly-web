# SPEC-02 UI de Casos

## Propósito
Listado, creación y vista de detalle de casos con sus operaciones impugnadas.

## User stories
- Como tramitador, puedo ver la lista de casos de mi banco con estado y semáforo.
- Como tramitador, puedo crear un nuevo caso con datos del cliente y fecha de DJ.
- Como abogado, puedo ver el detalle completo de un caso: operaciones, plazos y documentos.

## Acceptance criteria

### `/casos` — Listado
- Tabla densa (TanStack Table) con columnas: N° OT, Cliente, Estado, Banco, Días restantes (semáforo), Abogado, Fecha DJ
- Columnas numéricas con `tabular-nums`
- Filtro por estado (selector), banco (si hay múltiples) y búsqueda por nombre/RUT
- Click en fila → navega a `/casos/:id`
- Estado vacío: mensaje "No hay casos" con CTA para crear

### `/casos/nuevo` — Formulario de creación
- Campos: Banco (select), RUT cliente, Nombre cliente, Contacto (opcional), Fecha DJ (date picker)
- Validación client-side antes de submit
- Submit → `POST /v1/casos` + redirect a `/casos/:id`
- Loading state y manejo de errores

### `/casos/:id` — Detalle
- Header con N° OT (tipografía Fraunces + color amber), nombre cliente, estado con badge
- Sección Plazos: tabla con tipo, fecha límite, días restantes, semáforo (SemaforoIndicator)
- Sección Operaciones: tabla con medio de pago, monto, fecha, relación
- Sección Documentos: lista (fase posterior)
- Botón "Transicionar estado" → drawer/modal con estados disponibles

## Dependencias
- poly-api SPEC-02, SPEC-03 (para transición de estado en la UI)

## Referencias
- `features/casos/hooks/useCasos.ts` — hook existente (stub)
- `features/plazos/components/SemaforoIndicator.tsx` — componente listo
- `lib/api/tipos.ts` — tipos Go mirrored
