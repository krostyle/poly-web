# SPEC-04 UI de Plazos

## Propósito
Visualización dedicada de todos los plazos activos del estudio y controles para marcar plazos como cumplidos.

## Acceptance criteria

### `/plazos` — Vista global de plazos
- Tabla de todos los plazos activos (no cumplidos) del estudio
- Columnas: Caso (N° OT + cliente), Tipo de plazo, Fecha límite, Días restantes, Semáforo
- Filtro por tipo de plazo y por semáforo (ROJO, AMARILLO...)
- Ordenada por `diasRestantes ASC` por defecto

### En detalle del caso (`/casos/:id`)
- Tabla de plazos del caso con columna "Cumplir" (botón/checkbox)
- Marcar como cumplido → `POST /v1/plazos/:id/cumplir` → optimistic update

## Dependencias
- poly-api SPEC-04
- poly-web SPEC-02 (detalle de caso ya tiene tabla de plazos)

## Referencias
- `features/plazos/hooks/usePlazos.ts` — stub existente
- `features/plazos/components/SemaforoIndicator.tsx` — listo
