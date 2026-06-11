import { CasosPorVencer } from "@/features/dashboard/components/CasosPorVencer";
import { CasosNuevos } from "@/features/dashboard/components/CasosNuevos";
import { CasosEstancados } from "@/features/dashboard/components/CasosEstancados";
import { CargaPorAbogado } from "@/features/dashboard/components/CargaPorAbogado";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <CasosPorVencer />
        <CasosNuevos />
        <CasosEstancados />
        <CargaPorAbogado />
      </div>
    </div>
  );
}
