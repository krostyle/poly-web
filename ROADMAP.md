# Poly — Roadmap MVP

## Estado actual

### Fase activa: 5 — Documentos

---

## Fases completadas

### Fase 0 — Scaffolding ✅

- [x] Git + estructura de repos
- [x] poly-api: Clean Architecture, dominio completo, HTTP server
- [x] poly-web: Next.js 16, Clerk, TanStack Query, design system
- [x] Migraciones SQL, sqlc config, Makefile
- [x] Tests de dominio (estado, plazos): 8 passing

### Fase 1 — Auth + Multi-tenancy ✅

- [x] poly-api: middleware Clerk JWT + guard tenant scope
- [x] poly-api: endpoints de bootstrapping (estudio, banco, usuario)
- [x] poly-web: flujo sign-in → dashboard con datos reales de Clerk
- [x] Sync de rol Clerk → DB en cada bootstrap (upsert incluye `rol`)

### Fase 2 — CRUD de casos, operaciones y clientes ✅

- [x] poly-api: CRUD completo con validaciones de dominio
- [x] poly-web: formulario de creación + listado de casos
- [x] poly-web: detalle de caso con operaciones
- [x] poly-web: gestión de bancos y asignaciones usuario↔banco (SPEC-08)
- [x] poly-web: diseño responsivo (sidebar drawer en móvil, tablas scrollables)

### Fase 3 — Máquina de estados ✅

- [x] poly-api: endpoint de transición + validación (denuncia válida para JUDICIALIZACION, motivo para TERMINADO)
- [x] poly-web: controles de transición en la vista del caso (TransicionarEstadoDialog)
- [x] poly-web: historial de cambios de estado (timeline en CasoDetalleView)
- [x] Catálogo de bancos chilenos precargado en DB (migration 002)
- [x] RUT formateado con puntos/guión en UI; almacenado sin puntos en DB
- [x] DatePicker en formulario de caso (componente de diseño, nunca input nativo)

### Fase 4 — Motor de plazos + semáforo ✅

- [x] poly-api: PlazoRepository y FeriadoProvider (feriados chilenos 2025-2026)
- [x] poly-api: creación automática de plazos al crear caso (ANALISIS_INTERNO, RESTITUCION, ASIGNACION)
- [x] poly-api: creación de plazos en transiciones (SUSPENSION→PRECAUTELAR, JUDICIALIZACION→DEMANDA, RESTITUCION→RESTITUCION_RECHAZO+DEMANDA)
- [x] poly-api: GET /{id}/plazos con semáforo calculado + POST cumplir
- [x] poly-web: SemaforoIndicator (VERDE/AMARILLO/ROJO/VENCIDO)
- [x] poly-web: PlazosCard en detalle de caso con acción "Marcar cumplido"

---

## Fases pendientes

### Fase 5 — Documentos 🔲

**Objetivo:** Subir y ver documentos (DJ, denuncia, demanda, etc.) via Vercel Blob.

- [ ] poly-api: endpoint de upload + metadata en DB
- [ ] poly-web: componente de upload + lista de documentos por caso
- **Spec:** `poly-api/specs/05-documentos/`

### Fase 6 — Dashboard 🔲

**Objetivo:** Vista de control con casos por vencer, nuevos y estancados.

- [ ] poly-api: endpoints de dashboard (por vencer, nuevos, estancados, por abogado)
- [ ] poly-web: dashboard con tablas y semáforos
- **Spec:** `poly-api/specs/06-dashboard/` · `poly-web/specs/03-dashboard-ui/`

### Fase 7 — Auditoría 🔲

**Objetivo:** Registro inmutable de toda mutación de casos.

- [ ] poly-api: AuditLogger adapter (Postgres append-only)
- [ ] poly-web: vista de historial de un caso
- **Spec:** `poly-api/specs/07-auditoria/`

---

## Post-MVP

Generación automática de documentos · Clasificación asistida de indicios · Reportería CMF · Métricas por abogado · Notificaciones email/WhatsApp
