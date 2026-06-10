import { cn } from "@/lib/utils";
import type { Estado } from "@/lib/api/types";

const ESTADO_LABELS: Record<Estado, string> = {
  LLAMADA: "Llamada",
  REVISION: "Revisión",
  SUSPENSION: "Suspensión",
  PRE_JUDICIALIZACION: "Pre-judicialización",
  RESTITUCION: "Restitución",
  JUDICIALIZACION: "Judicialización",
  CIERRE: "Cierre",
  TERMINADO: "Terminado",
};

const ESTADO_CLASSES: Record<Estado, string> = {
  LLAMADA: "bg-gray-100 text-gray-700",
  REVISION: "bg-blue-100 text-blue-700",
  SUSPENSION: "bg-yellow-100 text-yellow-700",
  PRE_JUDICIALIZACION: "bg-purple-100 text-purple-700",
  JUDICIALIZACION: "bg-purple-100 text-purple-700",
  RESTITUCION: "bg-green-100 text-green-700",
  CIERRE: "bg-slate-100 text-slate-600",
  TERMINADO: "bg-slate-100 text-slate-600",
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
        ESTADO_CLASSES[estado],
        className
      )}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}
