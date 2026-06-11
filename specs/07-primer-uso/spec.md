# SPEC-07 Flujo de primer uso (onboarding)

## Propósito

Un admin que accede por primera vez ve el dashboard vacío y la lista de casos vacía sin ninguna guía. El objetivo es detectar ese estado y mostrar pasos claros para que el estudio quede operativo: crear banco → asignar usuario → crear caso.

## Estados vacíos actuales (sin guía)

| Pantalla | Estado actual |
|---|---|
| `/dashboard` | Widgets con "Sin datos" sin contexto |
| `/casos` | Tabla vacía sin CTA |
| `/configuracion/bancos` | Tabla vacía — tiene CTA de crear banco ✅ |

## User stories

- Como admin que acaba de unirse, veo una guía en el dashboard que me indica qué hacer primero.
- Como usuario sin bancos asignados que intenta ver `/casos`, veo un mensaje que me explica por qué no hay casos y qué puede hacer.
- Una vez que el estudio tiene casos, la guía desaparece sola.

## Comportamiento

### Dashboard — banner de onboarding

Si `GET /v1/me` retorna `bancos: []` (el usuario no tiene ningún banco asignado):

**Para ADMIN:**
```
┌─────────────────────────────────────────────────────────────┐
│ Bienvenido a Poly                                           │
│ Para comenzar, crea el primer banco del estudio y asigna   │
│ usuarios a él.                                              │
│                                                             │
│ [→ Ir a Configuración]                                      │
└─────────────────────────────────────────────────────────────┘
```

**Para ABOGADO/TRAMITADOR:**
```
┌─────────────────────────────────────────────────────────────┐
│ Aún no tienes bancos asignados                              │
│ Contacta al administrador del estudio para que te asigne   │
│ acceso a un banco.                                          │
└─────────────────────────────────────────────────────────────┘
```

El banner se muestra sobre los widgets del dashboard, solo cuando `bancos.length === 0` y `!loadingMe`.

### Lista de casos — estado vacío mejorado

Si el usuario no tiene bancos (`bancos: []`), mostrar en lugar de la tabla vacía genérica:

```
Sin bancos asignados
Necesitas acceso a al menos un banco para poder ver y registrar casos.
[→ Ir a Configuración]  ← solo para ADMIN
```

Si tiene bancos pero no hay casos:
```
Sin casos registrados
[+ Nuevo caso]
```

## Componentes a crear

- `features/dashboard/components/OnboardingBanner.tsx` — banner condicional
- Modificar `app/(app)/casos/page.tsx` — estado vacío diferenciado según `bancos.length`
- Modificar `app/(app)/dashboard/page.tsx` — renderizar `OnboardingBanner` condicionalmente

## Condiciones de visibilidad

- `OnboardingBanner` visible si `!loadingMe && me?.bancos.length === 0`
- Una vez que `me.bancos.length > 0`, el banner desaparece automáticamente (TanStack Query lo re-fetcha tras bootstrap)
- No mostrar skeleton para el banner — si todavía carga, simplemente no renderizar nada

## Dependencias

- `useMe` hook disponible ✅
- `me.bancos` disponible en el tipo `MeResponse` ✅
