# SPEC-03 Dashboard UI

## Propósito
Vista de control principal: prioriza lo urgente. Un abogado/tramitador entra y en 5 segundos sabe qué necesita atención hoy.

## Secciones (en orden de prioridad visual)

### 1. Casos por vencer (primera en pantalla, más importante)
- Tabla con: caso, N° OT, tipo de plazo crítico, fecha límite, días restantes (semáforo grande)
- Ordenada por `diasRestantes ASC` (más urgente primero)
- ROJO y VENCIDO con fondo sutil de alerta

### 2. Casos nuevos
- Casos en estado LLAMADA sin abogado asignado
- Badge "Sin asignar" en rojo si llevan más de 24 h

### 3. Casos estancados
- Casos activos sin movimiento > 5 días
- Columna "Último movimiento" (fecha)

### 4. Carga por abogado (solo TRAMITADOR/ADMIN)
- Mini-tabla: Abogado, Total, Por vencer, Vencidos
- Permite ver quién está sobrecargado

## Acceptance criteria
- Al cargar el dashboard se muestran las 4 secciones (o las que el rol permita)
- Si no hay datos en una sección → mensaje vacío discreto (no ocultar la sección)
- Semáforo en la sección "por vencer" es el elemento más prominente de toda la UI
- Refetch automático cada 5 minutos (TanStack Query `refetchInterval`)
- Cada fila es clickeable → navega al caso

## Dependencias
- poly-api SPEC-06 (endpoints de dashboard)
- poly-web SPEC-02 (componentes de casos ya existentes)

## Referencias
- `features/dashboard/components/placeholder.tsx` — stub existente
- `features/plazos/components/SemaforoIndicator.tsx` — componente listo
