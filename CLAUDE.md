# poly-web — Harness

## Sistema

Poly gestiona casos de fraude bancario (Ley 20.009, Chile) para estudios jurídicos.
Dos repos: `poly-web` (este) sirve la UI; `poly-api` (Go) es el único lugar donde vive la lógica de negocio.

Reglas cross-repo innegociables:

- Nunca implementar lógica de dominio en el frontend (plazos, estados, validaciones Ley 20.009 → solo en poly-api)
- Todo acceso a datos pasa por `lib/api/` → poly-api con Bearer JWT de Clerk
- El semáforo de colores que muestra poly-web es calculado por poly-api; el frontend solo renderiza

## Stack

Next.js 16.2 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Clerk v7 · TanStack Query v5 · TanStack Table v8

## Lee antes de codear

1. `ARCHITECTURE.md` — estructura de features y cómo se conecta a poly-api
2. `ROADMAP.md` — fase actual y siguiente
3. `specs/{feature}/spec.md` — requisitos de la feature activa
4. `specs/{feature}/tasks.md` — qué falta hacer

## Convenciones de Next.js 16

- `params` en pages y layouts es `Promise<{...}>` — siempre `await params`
- Componentes Server por defecto; `"use client"` solo cuando hay interacción
- Fuentes: `Inter` para UI (`--font-inter`), `Fraunces` para títulos y N° OT (`--font-fraunces`)
- CSS variables Tailwind v4: `bg-(--navy-900)` no `bg-[var(--navy-900)]`

## Convenciones de Clerk v7

- `ClerkProvider` ya está en el root layout — no agregarlo en otros lugares
- `UserButton` no acepta `afterSignOutUrl` — configurar via env `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL`
- En Server Components: `import { auth } from "@clerk/nextjs/server"`
- En Client Components: `import { useAuth } from "@clerk/nextjs"`

## Estructura de features

- Lógica de datos en `features/{feature}/hooks/` (TanStack Query)
- Tipos en `features/{feature}/types.ts` (o re-export desde `lib/api/types.ts`)
- Componentes en `features/{feature}/components/`
- API calls solo a través de `lib/api/` — nunca `fetch()` directo a poly-api en componentes

## Reglas

- No mezclar lógica de negocio en componentes — va en hooks o en `lib/api/`
- El semáforo de plazos es el único elemento con energía visual fuerte — no agregar colores llamativos en otras partes
- `tabular-nums` en todas las columnas de montos, fechas y días

---

## UI / Design System

### Tokens de color — cuándo usar cada uno

| Token | Hex | Usar para |
| --- | --- | --- |
| `--navy-900` | `#0F1E3D` | Títulos (`font-display`), texto principal de datos, íconos activos. Es el `--primary` de shadcn. |
| `--navy-700` | `#1E3A66` | Hover de navy-900, sidebar activo, focus ring. |
| `--amber-500` | `#C8881C` | **Solo** para N° OT, acento puntual de un dato clave. Nunca en botones ni fondos amplios. |
| `--ink-600` | `#475067` | Labels de formulario, texto secundario, encabezados de columna. |
| `--slate-100` | `#F1F4F8` | Background de la app (`<main>`), hover de filas de tabla, header de tabla. |
| `--paper` | `#FFFFFF` | Cards, diálogos, inputs. |
| Semáforo (`--verde/--amarillo/--rojo/--vencido`) | — | **Solo** en componentes de plazos. En ningún otro lugar. |

**Nunca usar**: `bg-blue-*`, `bg-green-*`, `bg-purple-*`, `text-blue-*`, etc. Esos colores no existen en la paleta de Poly.

---

### Botones

| Acción | Variante | Ejemplo |
| --- | --- | --- |
| Acción primaria (crear, guardar, confirmar) | `<Button>` | "Nuevo caso", "Guardar" |
| Acción secundaria (cancelar, volver) | `<Button variant="outline">` | "Cancelar" |
| Acción destructiva (eliminar, archivar) | `<Button variant="destructive">` | "Eliminar caso" |
| Acción fantasma / navegación inline | `className="text-sm text-(--ink-600) hover:text-(--navy-900) transition-colors"` | "← Volver" |

`<Button>` usa `--primary` (= navy-900) automáticamente. **Nunca sobreescribir** con `bg-primary`, `bg-navy-900`, `className="bg-blue-600"` ni similar.

---

### Patrones de UX — cuándo usar Dialog vs página

| Caso | Patrón | Ruta |
| --- | --- | --- |
| Crear entidad sencilla (≤ 6 campos) | `<Dialog>` disparado desde botón en la lista | sin URL propia |
| Editar entidad sencilla | `<Dialog>` disparado desde la fila/botón | sin URL propia |
| Ver detalle de entidad | Página dedicada | `/entidad/[id]` |
| Confirmar acción destructiva | `<AlertDialog>` | sin URL propia |
| Formulario largo (> 6 campos, múltiples secciones) | Página dedicada | `/entidad/nueva` |

**Regla general**: si la acción se resuelve en un formulario corto, va en Dialog. Si requiere navegación y tiene URL propia, va en página.

---

### Layout de páginas

```tsx
// Encabezado estándar de sección
<div className="flex items-center justify-between">
  <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Título</h1>
  <PrimaryActionDialog />   {/* o <Button> si no es Dialog */}
</div>

// Contenido principal
<div className="space-y-6">...</div>
```

---

### Cards

- Siempre `rounded-xl border-border shadow-none` — sin sombra por defecto
- Header de card: `CardTitle` con `text-sm font-semibold uppercase tracking-wide text-(--ink-600)`
- Nunca usar `CardDescription` — el texto de apoyo va como `text-sm text-(--ink-600)` dentro del contenido

---

### Tablas

- Envolver en `<div className="rounded-xl border-border bg-(--paper) overflow-hidden">`
- Header de columna: `text-xs font-semibold uppercase tracking-wide text-(--ink-600)`
- Header row: `className="bg-(--slate-100) hover:bg-(--slate-100)"` (para que el hover no cambie el header)
- Filas de datos: `hover:bg-(--slate-100) transition-colors`
- Skeleton de carga: filas de skeleton dentro del mismo contenedor

---

### Formularios dentro de Dialog

```tsx
// Label estándar
<label htmlFor="campo" className="block text-sm font-medium text-(--ink-600)">
  Etiqueta
</label>

// Botones al pie — siempre justify-end con gap-2
<div className="flex justify-end gap-2 pt-1">
  <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
  <Button type="submit">Guardar</Button>
</div>
```

---

### Listas de campos en detalle (`<Field>`)

Para mostrar pares label/valor en una card de detalle, usar este patrón:

```tsx
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-border last:border-0">
      <dt className="text-sm text-(--ink-600)">{label}</dt>
      <dd className="text-sm font-medium text-(--navy-900) text-right">{value}</dd>
    </div>
  );
}
```

## Comandos

```bash
npm run dev       # Next.js en :3000
npm run build     # build de producción
npx tsc --noEmit  # chequeo de tipos sin compilar
```
