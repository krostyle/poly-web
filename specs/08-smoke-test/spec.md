# SPEC-08 Smoke test — Flujo completo de producción

## Propósito

Verificar manualmente que el flujo crítico de extremo a extremo funciona correctamente contra el backend desplegado en Railway y el frontend en Vercel, antes de considerar la v1.0 lista para usuarios reales.

## Prerrequisitos

- [ ] `BLOB_READ_WRITE_TOKEN` configurado en Railway (SPEC-09)
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend de Railway en Vercel
- [ ] Al menos un usuario admin y uno abogado invitados y con acceso a la organización en Clerk

## Flujo a verificar (orden estricto)

### 1. Auth y bootstrap

- [ ] Admin inicia sesión → redirige a `/dashboard`
- [ ] `/v1/me` retorna `{ estudio, usuario, bancos: [] }` en primera visita
- [ ] Sidebar muestra sección "Configuración" para admin

### 2. Crear banco y asignar usuario

- [ ] Admin crea banco "Banco de Chile" desde `/configuracion/bancos`
- [ ] Banco aparece en la tabla
- [ ] Admin navega al detalle del banco → asigna al abogado
- [ ] Abogado inicia sesión → `/v1/me` retorna `bancos: [{ id, nombre: "Banco de Chile" }]`

### 3. Crear caso

- [ ] Abogado crea un caso en "Banco de Chile" con RUT y fecha DJ válidos
- [ ] Caso aparece en `/casos` con estado `RECEPCION_DENUNCIA`
- [ ] Detalle del caso muestra datos correctos + plazos calculados

### 4. Ciclo de vida del caso

- [ ] Admin asigna número OT al caso
- [ ] Abogado transiciona el caso a `ANALISIS_INTERNO`
- [ ] Plazo `ANALISIS_INTERNO` aparece en `/plazos` con semáforo correcto
- [ ] Abogado marca el plazo como cumplido → desaparece de la lista global
- [ ] Historial de auditoría en el detalle del caso muestra: CASO_CREADO, ABOGADO_ASIGNADO, ESTADO_CAMBIADO

### 5. Documentos

- [ ] Abogado sube un PDF desde el detalle del caso
- [ ] Documento aparece en la lista con nombre correcto
- [ ] Link "ExternalLink" abre el PDF en nueva pestaña (URL de Vercel Blob válida)

### 6. Dashboard

- [ ] Widgets del dashboard muestran datos reales (no vacíos)
- [ ] "Plazos por vencer" muestra el plazo del caso creado
- [ ] "Casos nuevos" muestra el caso

### 7. Permisos

- [ ] ABOGADO no ve `/configuracion/bancos` en el Sidebar
- [ ] ABOGADO intenta navegar a `/configuracion/bancos` → redirige a `/dashboard`
- [ ] ABOGADO intenta `POST /v1/bancos` → 403

## Qué registrar

Para cada paso fallido, anotar:
- URL / endpoint
- Error exacto (mensaje, status code, stack trace en Railway logs)
- Si es frontend o backend

## Dependencias

- SPEC-09 (Vercel Blob) completado
- SPEC-07 (primer uso) completado (para que el flujo inicial tenga guía)
