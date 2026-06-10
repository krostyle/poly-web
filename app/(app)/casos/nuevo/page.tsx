import Link from "next/link";
import { CrearCasoForm } from "@/features/casos/components/CrearCasoForm";

export default function NuevoCasoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/casos"
          className="text-sm text-(--ink-600) hover:text-(--navy-900) transition-colors"
        >
          ← Volver a casos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-(--navy-900)">
          Nuevo caso
        </h1>
      </div>
      <CrearCasoForm />
    </div>
  );
}
