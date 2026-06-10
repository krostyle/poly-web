import { CasosTable } from "@/features/casos/components/CasosTable";
import { NuevoCasoDialog } from "@/features/casos/components/NuevoCasoDialog";

export default function CasosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
          Casos
        </h1>
        <NuevoCasoDialog />
      </div>
      <CasosTable />
    </div>
  );
}
