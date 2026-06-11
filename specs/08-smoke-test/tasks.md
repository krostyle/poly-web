# SPEC-08 Smoke test — Tasks

## Estado: 🔲 Pendiente (requiere SPEC-09 y SPEC-07)

## Checklist de ejecución

### Preparación

- [ ] Confirmar que Railway tiene `BLOB_READ_WRITE_TOKEN` configurado
- [ ] Confirmar que Vercel tiene `NEXT_PUBLIC_API_URL` apuntando a Railway
- [ ] Crear usuario admin y usuario abogado de prueba en Clerk

### Auth y bootstrap

- [ ] Admin login → dashboard sin errores
- [ ] `/v1/me` en Network tab → `bancos: []` primera visita
- [ ] Sidebar muestra "Configuración" para admin

### Banco y asignación

- [ ] Crear banco desde UI
- [ ] Asignar abogado al banco
- [ ] Abogado login → `/v1/me` muestra banco

### Caso y estados

- [ ] Crear caso como abogado
- [ ] Transicionar estados paso a paso hasta JUDICIALIZACION
- [ ] Verificar plazos en `/plazos` en cada transición

### Documentos

- [ ] Subir PDF < 20MB → aparece con link funcional
- [ ] Intentar subir > 20MB → error en UI (no crash)

### Dashboard

- [ ] Todos los widgets cargan datos reales
- [ ] Sin errores en consola del browser

### Permisos

- [ ] ABOGADO no ve Configuración en sidebar
- [ ] ABOGADO no puede acceder a rutas de configuración

### Bugs encontrados

Documentar aquí cualquier bug encontrado durante el smoke test para crear issues de seguimiento.
