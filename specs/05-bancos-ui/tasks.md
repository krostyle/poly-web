# SPEC-05 UI Bancos — Tasks (poly-web)

## Estado: 🔲 Pendiente (requiere poly-api SPEC-08)

## Tareas

### lib/api

- [ ] `lib/api/bancos.ts` — funciones:
  - `listarBancos(token)` → `Banco[]`
  - `crearBanco(payload, token)` → `Banco`
  - `actualizarBanco(id, payload, token)` → `Banco`
  - `eliminarBanco(id, token)` → `void`
  - `listarUsuariosBanco(id, token)` → `UsuarioBanco[]`
  - `asignarUsuario(bancoId, usuarioId, token)` → `void`
  - `desasignarUsuario(bancoId, usuarioId, token)` → `void`
- [ ] `lib/api/types.ts` — agregar tipos `Banco`, `UsuarioBanco`, payloads

### features/bancos — hooks

- [ ] `features/bancos/hooks/useBancos.ts`
- [ ] `features/bancos/hooks/useCrearBanco.ts`
- [ ] `features/bancos/hooks/useActualizarBanco.ts`
- [ ] `features/bancos/hooks/useEliminarBanco.ts`
- [ ] `features/bancos/hooks/useUsuariosBanco.ts`
- [ ] `features/bancos/hooks/useAsignarUsuario.ts`
- [ ] `features/bancos/hooks/useDesasignarUsuario.ts`

### features/bancos — components

- [ ] `features/bancos/components/BancosTable.tsx` — tabla con 3 estados
- [ ] `features/bancos/components/NuevoBancoDialog.tsx` — Dialog de 1 campo
- [ ] `features/bancos/components/EditarBancoDialog.tsx` — Dialog de 1 campo
- [ ] `features/bancos/components/UsuariosBancoTable.tsx` — tabla + skeleton
- [ ] `features/bancos/components/AsignarUsuarioDialog.tsx` — selector de usuarios

### Rutas

- [ ] `app/(app)/configuracion/bancos/page.tsx` — lista + guard de rol
- [ ] `app/(app)/configuracion/bancos/[id]/page.tsx` — detalle + gestión usuarios

### Sidebar

- [ ] Agregar link "Configuración" al Sidebar apuntando a `/configuracion/bancos`
- [ ] Solo visible para rol ADMIN

### Verificación

- [ ] ADMIN puede crear un banco → aparece en la tabla
- [ ] ADMIN asigna usuario a banco → usuario ve ese banco en "Nuevo caso"
- [ ] ADMIN quita usuario del banco → selector de casos ya no muestra ese banco
- [ ] Intentar eliminar banco con casos → mensaje de error apropiado
- [ ] Usuario no-ADMIN accede a `/configuracion/bancos` → redirige a `/dashboard`
- [ ] `npx tsc --noEmit` sin errores
