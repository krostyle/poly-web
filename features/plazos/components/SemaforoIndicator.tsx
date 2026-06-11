import { cn } from "@/lib/utils";
import type { Semaforo } from "@/lib/api/types";

const SEMAFORO_CONFIG: Record<Semaforo, { label: string; className: string }> = {
  VERDE: {
    label: "Al día",
    className: "bg-(--verde)/10 text-(--verde)",
  },
  AMARILLO: {
    label: "Por vencer",
    className: "bg-(--amarillo)/15 text-(--amarillo)",
  },
  ROJO: {
    label: "Urgente",
    className: "bg-(--rojo)/10 text-(--rojo)",
  },
  VENCIDO: {
    label: "Vencido",
    className: "bg-(--vencido)/10 text-(--vencido)",
  },
};

interface SemaforoIndicatorProps {
  semaforo: Semaforo;
  diasRestantes?: number;
  showDays?: boolean;
  className?: string;
}

export function SemaforoIndicator({
  semaforo,
  diasRestantes,
  showDays = false,
  className,
}: SemaforoIndicatorProps) {
  const config = SEMAFORO_CONFIG[semaforo];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current shrink-0" />
      {config.label}
      {showDays && diasRestantes !== undefined && (
        <span className="tabular-nums font-normal opacity-75">
          {diasRestantes <= 0 ? `(${Math.abs(diasRestantes)}d)` : `(${diasRestantes}d)`}
        </span>
      )}
    </span>
  );
}
