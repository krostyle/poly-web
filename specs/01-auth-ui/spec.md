# SPEC-01 Auth UI

## Propósito
Flujo completo de autenticación con Clerk: login, registro, selección de organización (estudio), y acceso al dashboard protegido.

## User stories
- Como abogado, puedo iniciar sesión con mi cuenta de Clerk y llegar al dashboard.
- Como usuario nuevo, puedo registrarme y crear o unirme a un estudio (Clerk Organization).
- Como usuario no autenticado, cualquier ruta `(app)/` me redirige a `/sign-in`.
- Como usuario autenticado, `/` me redirige directamente a `/dashboard`.

## Acceptance criteria

### Páginas de auth (Clerk UI)
- `/sign-in` muestra el componente `<SignIn />` de Clerk centrado en pantalla
- `/sign-up` muestra el componente `<SignUp />` de Clerk
- Fondo con `--slate-100`, componentes Clerk sobre `--paper`
- Tras login exitoso → redirect a `/dashboard`

### Protección de rutas
- Cualquier ruta bajo `(app)/` sin sesión activa → redirect a `/sign-in` (ya implementado en middleware.ts)
- Si el usuario no tiene una Clerk Organization activa → mostrar pantalla de "seleccionar o crear estudio"

### Bootstrap al primer login
- Al entrar al dashboard por primera vez, el frontend llama a `POST /v1/bootstrap` de poly-api
- Esto registra el estudio y usuario en la DB (idempotente)
- Si `POST /v1/bootstrap` falla → mostrar error no bloqueante (toast)

### Sidebar y Header
- Sidebar muestra el nombre del estudio (desde `useOrganization()` de Clerk)
- Header muestra `<UserButton />` de Clerk
- La navegación del Sidebar refleja las rutas activas

## Dependencias
- SPEC-01 de poly-api debe estar completo (endpoint `/v1/bootstrap`)

## Referencias
- `app/(auth)/sign-in/` y `sign-up/` — ya creados
- `app/(app)/layout.tsx` — auth guard ya implementado
- `components/layout/Sidebar.tsx` y `Header.tsx` — stubs existentes
- `middleware.ts` — ya configurado
