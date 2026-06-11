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

### Filosofía

Poly es software B2B profesional para abogados. El diseño debe sentirse como **Linear, Vercel dashboard o Stripe** — no como un CRUD genérico de Bootstrap ni un template de shadcn sin customizar. Tres principios no negociables:

1. **Minimalismo funcional** — cada elemento que existe tiene una razón. Nada decorativo.
2. **Jerarquía tipográfica clara** — el dato más importante domina visualmente; el resto recede.
3. **Blanco como elemento de diseño** — el espacio vacío no es desperdicio, es respiración.

Antes de hacer commit de cualquier componente UI, preguntate: **¿Esto parece Linear o parece un formulario de WordPress?**

---

### Paleta — reglas de uso

| Token | Hex | Usar para | Nunca para |
| --- | --- | --- | --- |
| `--navy-900` | `#0F1E3D` | Títulos, texto de dato clave, sidebar, `<Button>` primario | Fondos amplios, bordes |
| `--navy-700` | `#1E3A66` | Hover de navy-900, sidebar activo, focus ring | Texto |
| `--amber-500` | `#C8881C` | N° OT (único acento de dato), highlights puntuales | Botones, fondos, textos de párrafo |
| `--ink-600` | `#475067` | Labels, texto secundario, headers de columna, descripciones | Títulos principales |
| `--slate-100` | `#F1F4F8` | Background `<main>`, hover de filas, header de tabla | Cards, diálogos |
| `--paper` | `#FFFFFF` | Cards, diálogos, panel de detalle | Backgrounds de página |
| `--verde/--amarillo/--rojo/--vencido` | — | **Exclusivo** para semáforo de plazos | Cualquier otro uso |

**Colores prohibidos** (no existen en Poly): `bg-blue-*`, `bg-green-*`, `bg-red-*`, `bg-purple-*`, `text-red-*`, `border-red-*` y cualquier color genérico de Tailwind. Usar `text-destructive` solo para mensajes de error de formulario inline, nunca para estados de carga fallida.

---

### Botones

| Intención | Componente | Cuándo |
| --- | --- | --- |
| Acción primaria (crear, guardar, confirmar) | `<Button size="sm">` | Siempre el botón más prominente de la vista |
| Acción secundaria | `<Button variant="outline" size="sm">` | Cancelar, cerrar, acción alternativa |
| Acción destructiva | `<Button variant="destructive" size="sm">` | Eliminar, archivar permanentemente |
| Navegación o link inline | `className="text-sm text-(--ink-600) hover:text-(--navy-900) transition-colors"` | "← Volver", links en texto |

`<Button>` usa `--primary` (= navy-900) automáticamente. Nunca escribir `bg-navy-900`, `bg-primary`, ni colores hardcodeados en botones.

---

### Cuándo usar Dialog vs página

| Acción | Patrón |
| --- | --- |
| Crear entidad (≤ 6 campos) | `<Dialog>` — sin URL propia |
| Editar entidad (≤ 6 campos) | `<Dialog>` — sin URL propia |
| Confirmar/destruir | `<AlertDialog>` — sin URL propia |
| Ver detalle completo | Página `/entidad/[id]` |
| Wizard o formulario complejo (> 6 campos, múltiples secciones) | Página `/entidad/nueva` |

---

### Layout de página — plantilla obligatoria

El encabezado usa `flex-wrap` para que el botón de acción caiga a la siguiente línea en móvil.

```tsx
export default function MiPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado: título a la izq, acción principal a la der; wrap en móvil */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Título</h1>
          {/* subtítulo opcional */}
          <p className="mt-0.5 text-sm text-(--ink-600)">Descripción breve</p>
        </div>
        <AccionPrincipalDialog />
      </div>
      {/* Contenido */}
      <MiTablaOCard />
    </div>
  );
}
```

---

### Tablas — plantilla obligatoria

El `<Table>` va dentro de un `overflow-x-auto` para que sea scrolleable en móvil.

```tsx
{/* Wrapper siempre igual */}
<div className="rounded-xl border-border bg-(--paper) overflow-hidden">
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow className="bg-(--slate-100) hover:bg-(--slate-100)">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
            Columna
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id} className="hover:bg-(--slate-100) transition-colors">
            <TableCell className="text-sm">...</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</div>
```

**Siempre** incluir los tres estados: carga (skeleton), vacío (icono + texto), error (texto muted + reintentar).

---

### Estado vacío — plantilla obligatoria

Importar icono de `lucide-react`. El ícono varía por entidad.

```tsx
import { FolderOpen } from "lucide-react"; // o FileText, Users, Calendar, etc.

function EmptyState({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="rounded-xl bg-(--slate-100) p-3.5">
        <FolderOpen className="size-6 text-(--ink-600)" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-(--navy-900)">Sin registros</p>
        <p className="mt-0.5 text-xs text-(--ink-600)">
          Los registros aparecerán aquí cuando los crees.
        </p>
      </div>
      {action}
    </div>
  );
}
```

---

### Estado de error — plantilla obligatoria

**Nunca** usar texto rojo (`text-destructive`, `text-red-*`) para errores de carga. Solo para errores de validación de campo.

```tsx
import { AlertCircle } from "lucide-react";

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="rounded-xl bg-(--slate-100) p-3.5">
        <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-(--navy-900)">No se pudieron cargar los datos</p>
        <p className="mt-0.5 text-xs text-(--ink-600)">
          Verifica tu conexión e intenta nuevamente.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
```

---

### Estado de carga (skeleton) — reglas

**Regla absoluta: nunca texto "Cargando…" ni inputs/selects deshabilitados con placeholder de carga.**

- El skeleton debe imitar la **forma exacta** del contenido que cargará
- En tablas: filas de skeleton del mismo alto que las filas de datos
- En cards de detalle: bloques que coinciden con los campos reales
- En ningún caso mostrar un spinner genérico sin contexto
- **Selects que cargan datos**: `<Skeleton className="h-9 w-full rounded-md" />` — mismo alto que el trigger
- **Texto en sidebar o encabezados**: `<Skeleton className="h-5 w-32" />` con el mismo color de fondo

```tsx
// ✅ Correcto — Select cargando
{isLoading ? (
  <Skeleton className="h-9 w-full rounded-md" />
) : (
  <Select ...>...</Select>
)}

// ❌ Nunca esto
{isLoading && <Input disabled placeholder="Cargando datos…" />}
{isLoading && <Select disabled><SelectTrigger><SelectValue placeholder="Cargando…" /></SelectTrigger></Select>}
```

```tsx
// Skeleton de tabla (6 filas)
<div className="divide-y divide-border">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-5 w-16 rounded-full" />   {/* badge estado */}
      <Skeleton className="h-4 w-40" />                {/* nombre */}
      <Skeleton className="h-4 w-24" />                {/* rut */}
      <Skeleton className="h-4 w-20 ml-auto" />        {/* fecha */}
    </div>
  ))}
</div>
```

---

### Cards de detalle

```tsx
<Card className="rounded-xl border-border shadow-none">
  <CardHeader className="pb-0">
    <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
      Sección
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-3">
    <dl>
      <Field label="Etiqueta" value="Valor" />
    </dl>
  </CardContent>
</Card>
```

Patrón `<Field>` para pares label/valor:

```tsx
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-border last:border-0">
      <dt className="text-sm text-(--ink-600)">{label}</dt>
      <dd className="text-sm font-medium text-(--navy-900) text-right max-w-[60%]">{value}</dd>
    </div>
  );
}
```

---

### Formularios en Dialog

```tsx
// Label: muted, pequeño
<label htmlFor="campo" className="block text-sm font-medium text-(--ink-600)">
  Etiqueta <span className="font-normal text-muted-foreground text-xs">(opcional)</span>
</label>

// Error de campo: inline, pequeño, destructive
{fieldError && <p className="text-xs text-destructive mt-1">{fieldError}</p>}

// Footer siempre a la derecha
<div className="flex justify-end gap-2 pt-2">
  <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
  <Button type="submit" size="sm" disabled={isPending || !isValid}>
    {isPending ? "Guardando…" : "Guardar"}
  </Button>
</div>
```

### Select con value=UUID (@base-ui)

`@base-ui/react` no puede resolver el texto del item seleccionado cuando el popup está cerrado (items fuera del DOM). Si `value` es un UUID y el label es diferente, **siempre pasar el texto como children de `SelectValue`**:

```tsx
// ✅ Correcto — value es UUID, texto viene de los datos
<SelectValue placeholder="Seleccionar banco">
  {selectedId ? items.find((i) => i.id === selectedId)?.nombre : undefined}
</SelectValue>

// ❌ Nunca esto cuando value ≠ texto mostrado (mostrará el UUID crudo)
<SelectValue placeholder="Seleccionar banco" />
```

---

### Responsive — reglas obligatorias

Poly se usa desde celular. Cada componente debe funcionar en `320px` mínimo.

**Layout shell:**

- El sidebar es un drawer deslizable en móvil (`fixed`, slide-in desde la izquierda)
- En `md:` y arriba, el sidebar es `relative` (dentro del flex) y siempre visible
- El toggle del hamburger está en el `Header`, visible solo en `md:hidden`
- La estructura del shell es: `AppShell` (cliente) envuelve `Sidebar` + `Header` + `<main p-4 md:p-6>`

**Reglas por componente:**

| Elemento | Móvil | Desktop |
| --- | --- | --- |
| Encabezado de página | `flex flex-wrap gap-3` → botón cae abajo | `flex justify-between` |
| Tablas | `overflow-x-auto` envuelve `<Table>` | sin scroll |
| Cards de detalle | `grid-cols-1` | `grid-cols-2` via `md:grid-cols-2` |
| Diálogos | shadcn ya es responsive en mobile | igual |
| Padding de `<main>` | `p-4` | `md:p-6` |

**Anti-patrones responsivos:**

- ❌ `flex justify-between` sin `flex-wrap` en encabezados — se desborda
- ❌ `<Table>` sin `overflow-x-auto` — rompe el layout en móvil
- ❌ `w-60 shrink-0` fijo en sidebar — lo remueve del flujo en móvil

---

### Anti-patrones — NUNCA hacer esto

- ❌ `text-red-600` o `text-destructive` para errores de carga (usa texto `text-(--ink-600)` + ícono)
- ❌ `className="bg-blue-500"` o cualquier color Tailwind genérico
- ❌ Sombras en cards (`shadow-sm`, `shadow-md`) — siempre `shadow-none`
- ❌ Página dedicada para un formulario de ≤ 6 campos — usar Dialog
- ❌ Estado vacío sin ícono — siempre icono + heading + subtext
- ❌ Mostrar JSON o IDs crudos al usuario
- ❌ Spinner genérico (`<div className="animate-spin">`) — usar skeletons
- ❌ Texto en mayúsculas para títulos de sección de página (solo para headers de columna y labels de card)
- ❌ `CardDescription` de shadcn — usar `text-sm text-(--ink-600)` dentro del contenido
- ❌ Más de 2 niveles de anidación de cards (card dentro de card dentro de card)
- ❌ `onClick={() => window.location.reload()}` para reintentar — usar `refetch()` de TanStack Query

---

### Checklist antes de hacer commit de UI

- [ ] Estado vacío: ¿tiene ícono Lucide + heading + subtext?
- [ ] Estado de error: ¿no usa texto rojo? ¿tiene botón "Reintentar" que llama a `refetch()`?
- [ ] Estado de carga: ¿el skeleton imita la forma del contenido?
- [ ] Números y fechas: ¿tienen `tabular-nums`?
- [ ] Botones: ¿usan variante correcta? ¿no tienen colores hardcodeados?
- [ ] Acciones cortas: ¿van en Dialog, no en página?
- [ ] Colores: ¿solo tokens del design system? ¿cero colores genéricos de Tailwind?
- [ ] Tablas: ¿tienen `overflow-x-auto`?
- [ ] Encabezados de página: ¿usan `flex-wrap`?
- [ ] ¿Funciona en 375px (iPhone SE)?
- [ ] ¿Pasaría por Linear o Stripe sin verse fuera de lugar?

## Comandos

```bash
npm run dev       # Next.js en :3000
npm run build     # build de producción
npx tsc --noEmit  # chequeo de tipos sin compilar
```
