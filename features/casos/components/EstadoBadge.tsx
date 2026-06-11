import { cn } from "@/lib/utils";
import type { Estado } from "@/lib/api/types";

export const ESTADO_LABELS: Record<Estado, string> = {
  INGRESO:          "Ingreso",
  REVISION:         "Revisión",
  PREJUDICIAL:      "Medida Precautoria",
  PAGO_NORMATIVO:   "Pago Normativo",
  JUDICIAL:         "Demanda",
  AUDIENCIA:        "Audiencia",
  SENTENCIA:        "Sentencia",
  APELACION:        "Apelación",
  SENTENCIA_SEGUNDA:"Sentencia 2ª Inst.",
  CUMPLIMIENTO:     "Cumplimiento",
  TERMINADO:        "Terminado",
  CIERRE:           "Cierre",
};

// Colors grouped by phase:
// Entry / review  → slate
// Prejudicial     → amber (cautionary)
// Judicial        → navy scale (active litigation)
// End states      → rojo (terminado) / slate (cierre)
const ESTADO_CLASSES: Record<Estado, string> = {
  INGRESO:          "bg-(--slate-100) text-(--ink-600)",
  REVISION:         "bg-(--navy-900)/10 text-(--navy-900)",
  PREJUDICIAL:      "bg-(--amber-500)/15 text-(--amber-500)",
  PAGO_NORMATIVO:   "bg-(--verde)/15 text-(--verde)",
  JUDICIAL:         "bg-(--navy-900)/15 text-(--navy-900)",
  AUDIENCIA:        "bg-(--navy-900)/20 text-(--navy-900)",
  SENTENCIA:        "bg-(--navy-900)/25 text-(--navy-900)",
  APELACION:        "bg-(--amber-500)/20 text-(--amber-500)",
  SENTENCIA_SEGUNDA:"bg-(--navy-900)/25 text-(--navy-900)",
  CUMPLIMIENTO:     "bg-(--verde)/20 text-(--verde)",
  TERMINADO:        "bg-(--rojo)/10 text-(--rojo)",
  CIERRE:           "bg-(--slate-100) text-(--ink-600)",
};

interface EstadoBadgeProps {
  estado: Estado;
  className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ESTADO_CLASSES[estado] ?? "bg-(--slate-100) text-(--ink-600)",
        className
      )}
    >
      {ESTADO_LABELS[estado] ?? estado}
    </span>
  );
}
