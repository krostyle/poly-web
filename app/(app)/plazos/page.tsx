import { PlazosTable } from "@/features/plazos/components/PlazosTable";

export default function PlazosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Plazos</h1>
        <p className="mt-0.5 text-sm text-(--ink-600)">
          Todos los plazos legales activos del estudio, ordenados por fecha límite.
        </p>
      </div>
      <PlazosTable />
    </div>
  );
}
