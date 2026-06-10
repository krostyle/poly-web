import type { Semaforo } from "@/lib/api/types";

const styles: Record<Semaforo, { bg: string; text: string; label: string }> = {
  VERDE:    { bg: "bg-[#1F8A5B]/10", text: "text-[#1F8A5B]", label: "En plazo" },
  AMARILLO: { bg: "bg-[#D9A017]/10", text: "text-[#D9A017]", label: "Por vencer" },
  ROJO:     { bg: "bg-[#C0392B]/10", text: "text-[#C0392B]", label: "Crítico" },
  VENCIDO:  { bg: "bg-[#7A1F1A]/10", text: "text-[#7A1F1A]", label: "Vencido" },
};

interface Props {
  semaforo: Semaforo;
  diasRestantes: number;
}

export function SemaforoIndicator({ semaforo, diasRestantes }: Props) {
  const s = styles[semaforo];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium tabular-nums ${s.bg} ${s.text}`}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: "currentColor" }}
        aria-hidden
      />
      {diasRestantes > 0 ? `${diasRestantes}d` : "Vencido"}
      <span className="sr-only">{s.label}</span>
    </span>
  );
}
