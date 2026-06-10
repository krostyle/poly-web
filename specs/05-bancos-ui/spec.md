# SPEC-05 UI Gestión de Bancos

## Propósito

Dar al administrador del estudio una interfaz para crear bancos y gestionar qué usuarios tienen acceso a cada banco. Es el prerequisito funcional para que cualquier usuario pueda crear casos.

## Contexto

Un banco en Poly representa el contrato entre el estudio y una entidad bancaria (ej. "Banco de Chile"). Sin al menos un banco creado y asignado al usuario, el selector de bancos en "Nuevo caso" queda vacío y el flujo está bloqueado.

## User stories

- Como admin, puedo ver la lista de bancos de mi estudio en una página de configuración.
- Como admin, puedo crear un nuevo banco desde un Dialog.
- Como admin, puedo renombrar un banco.
- Como admin, puedo ver qué usuarios están asignados a cada banco y agregar/quitar usuarios.
- Como admin, puedo eliminar un banco sin casos (el sistema me avisa si tiene casos).

## Rutas

```
/configuracion/bancos          → lista de bancos + acciones
/configuracion/bancos/[id]     → detalle del banco: datos + usuarios asignados
```

Ambas rutas son accesibles solo para usuarios con `rol = ADMIN`. Si el usuario no es ADMIN, redirigir a `/dashboard`.

## Componentes a crear

### Páginas

- `app/(app)/configuracion/bancos/page.tsx` — lista de bancos del estudio
- `app/(app)/configuracion/bancos/[id]/page.tsx` — detalle banco + gestión de usuarios

### Features

- `features/bancos/hooks/useBancos.ts` — lista bancos (GET /v1/bancos)
- `features/bancos/hooks/useCrearBanco.ts` — mutation (POST /v1/bancos)
- `features/bancos/hooks/useActualizarBanco.ts` — mutation (PATCH /v1/bancos/:id)
- `features/bancos/hooks/useEliminarBanco.ts` — mutation (DELETE /v1/bancos/:id)
- `features/bancos/hooks/useUsuariosBanco.ts` — usuarios asignados (GET /v1/bancos/:id/usuarios)
- `features/bancos/hooks/useAsignarUsuario.ts` — mutation (POST /v1/bancos/:id/usuarios)
- `features/bancos/hooks/useDesasignarUsuario.ts` — mutation (DELETE /v1/bancos/:id/usuarios/:uid)
- `features/bancos/components/BancosTable.tsx` — tabla con skeleton/vacío/error
- `features/bancos/components/NuevoBancoDialog.tsx` — Dialog (≤ 1 campo: nombre)
- `features/bancos/components/EditarBancoDialog.tsx` — Dialog para renombrar
- `features/bancos/components/UsuariosBancoTable.tsx` — tabla de usuarios asignados
- `features/bancos/components/AsignarUsuarioDialog.tsx` — selector de usuarios del estudio
- `lib/api/bancos.ts` — funciones tipadas para todos los endpoints

## UX

### Lista de bancos (`/configuracion/bancos`)

```
┌─────────────────────────────────────────────┐
│ Bancos                    [+ Nuevo banco]   │  ← header de página
│ Los bancos con los que trabaja el estudio.  │
├─────────────────────────────────────────────┤
│ BANCO          USUARIOS  CREADO             │  ← tabla
│ Banco de Chile    3      01/01/2025      →  │  ← fila, flecha → a /bancos/:id
│ Santander         1      15/02/2025      →  │
└─────────────────────────────────────────────┘
```

- Estado vacío: "Sin bancos registrados. Crea el primero para poder comenzar a registrar casos."
- Estado de error: ícono AlertCircle + reintentar (refetch)
- Skeleton: 4 filas

### Detalle de banco (`/configuracion/bancos/:id`)

```
← Bancos

[Nombre del banco]                  [Editar nombre] [Eliminar]
Creado el 01/01/2025

─────────────────────────────────────────────
Usuarios con acceso                 [+ Asignar usuario]
─────────────────────────────────────────────
│ NOMBRE          ROL       ACCIONES         │
│ Ana García      Abogado   [Quitar acceso]  │
│ Pedro Soto      Tramitad. [Quitar acceso]  │
─────────────────────────────────────────────
```

- "Eliminar" banco: solo visible si el usuario es ADMIN; si el banco tiene casos, mostrar toast "Este banco tiene casos asociados y no puede eliminarse".
- "Quitar acceso": confirmación inline pequeña antes de ejecutar.

## Tipos

```typescript
// lib/api/types.ts — agregar
interface Banco {
  id: string;
  nombre: string;
  createdAt: string;
}

interface UsuarioBanco {
  id: string;
  nombre: string;
  email: string;
  rol: "ABOGADO" | "TRAMITADOR" | "ADMIN";
}

interface CrearBancoPayload { nombre: string }
interface ActualizarBancoPayload { nombre: string }
interface AsignarUsuarioPayload { usuarioId: string }
```

## Guard de rol

El layout o la página debe verificar que el usuario sea ADMIN. Si no, redirigir a `/dashboard`. Obtener el rol desde el objeto `usuario` del hook `useMe` (o `useAuth` si ya está en contexto).

## Conexión con casos

Una vez creado un banco y asignado a un usuario, el hook `useBancos` en `features/casos` (que llama a `/v1/me`) ya lo incluirá automáticamente en el selector de "Nuevo caso". No se necesita ningún cambio en `CrearCasoForm`.

## Dependencias

- poly-api SPEC-08 completado
- `useMe` o similar disponible para obtener el rol del usuario actual
- Link "Configuración" en el Sidebar apuntando a `/configuracion/bancos`

## Referencias

- `features/casos/hooks/useBancos.ts` — usa `/v1/me`, no `/v1/bancos`; son hooks distintos
- `CLAUDE.md` — aplicar todos los patrones de diseño (skeleton, vacío, error, Dialog)
