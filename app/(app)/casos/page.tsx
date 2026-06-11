"use client";

import { useState, useCallback } from "react";
import { CasosTable } from "@/features/casos/components/CasosTable";
import { CasosFilters } from "@/features/casos/components/CasosFilters";
import { NuevoCasoDialog } from "@/features/casos/components/NuevoCasoDialog";
import type { CasoFilters } from "@/lib/api/casos";

export default function CasosPage() {
  const [filters, setFilters] = useState<CasoFilters>({});
  const handleFiltersChange = useCallback((f: CasoFilters) => setFilters(f), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Casos</h1>
        <NuevoCasoDialog />
      </div>
      <CasosFilters onChange={handleFiltersChange} />
      <CasosTable filters={filters} />
    </div>
  );
}
