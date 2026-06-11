"use client";

import { AlertCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePorAbogado } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-8 rounded" />
    </div>
  );
}

export function CargaPorAbogado() {
  const { data, isLoading, isError } = usePorAbogado();

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          <Users className="size-3.5" strokeWidth={2} />
          Carga por abogado
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-3">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-(--ink-600)">
            <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
            Error al cargar carga por abogado.
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--ink-600)">
            Sin abogados con casos activos.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((item) => (
              <div key={item.abogadoId} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--navy-900) truncate">{item.nombre}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-(--ink-600)">
                    {item.porVencer > 0 && (
                      <span className="text-(--amarillo)">
                        {item.porVencer} por vencer
                      </span>
                    )}
                    {item.vencidos > 0 && (
                      <span className="text-(--rojo)">
                        {item.vencidos} vencido{item.vencidos > 1 ? "s" : ""}
                      </span>
                    )}
                    {item.porVencer === 0 && item.vencidos === 0 && (
                      <span className="text-(--verde)">Al día</span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                    item.vencidos > 0
                      ? "bg-(--rojo)/10 text-(--rojo)"
                      : item.porVencer > 0
                      ? "bg-(--amarillo)/15 text-(--amarillo)"
                      : "bg-(--verde)/10 text-(--verde)"
                  )}
                >
                  {item.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
