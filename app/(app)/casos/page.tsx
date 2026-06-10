import Link from "next/link";
import { CasosTable } from "@/features/casos/components/CasosTable";

export default function CasosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
          Casos
        </h1>
        <Link
          href="/casos/nuevo"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Nuevo caso
        </Link>
      </div>
      <CasosTable />
    </div>
  );
}
