import { cn } from "@/lib/utils";
import type { Estado } from "@/lib/api/types";

const ESTADO_LABELS: Record<Estado, string> = {
  LLAMADA: "Llamada",
  REVISION: "Revisión",
  SUSPENSION: "Suspensión",
  PRE_JUDICIALIZACION: "Pre-judic.",
  RESTITUCION: "Restitución",
  JUDICIALIZACION: "Judicializ.",
  CIERRE: "Cierre",
  TERMINADO: "Terminado",
};

// All classes use only Poly design tokens — no generic Tailwind colors.
// "active" states use navy tint; "paused" uses amber tint; terminals use slate.
const ESTADO_CLASSES: Record<Estado, string> = {
  LLAMADA: "bg-(--slate-100) text-(--ink-600)",
  REVISION: "bg-(--navy-900)/10 text-(--navy-900)",
  SUSPENSION: "bg-(--amber-500)/10 text-(--amber-500)",
  PRE_JUDICIALIZACION: "bg-(--navy-900)/15 text-(--navy-900)",
  JUDICIALIZACION: "bg-(--navy-900)/20 text-(--navy-900)",
  RESTITUCION: "bg-(--navy-900)/10 text-(--navy-900)",
  CIERRE: "bg-(--slate-100) text-(--ink-600)",
  TERMINADO: "bg-(--slate-100) text-(--ink-600)",
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
