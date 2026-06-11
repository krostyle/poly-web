"use client";

import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SemaforoIndicator } from "@/features/plazos/components/SemaforoIndicator";
import { usePorVencer } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import type { Semaforo } from "@/lib/api/types";

const TIPO_PLAZO_LABELS: Record<string, string> = {
  ANALISIS_INTERNO: "Análisis",
  RESTITUCION: "Restitución",
  ASIGNACION: "Asignación",
  PRECAUTELAR: "Precautelar",
  DEMANDA: "Demanda",
  RESTITUCION_RECHAZO: "Restit. rechazo",
};

const ALERT_BG: Partial<Record<Semaforo, string>> = {
  ROJO: "bg-(--rojo)/5",
  VENCIDO: "bg-(--vencido)/5",
};

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="size-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  );
}

export function CasosPorVencer() {
  const { data, isLoading, isError } = usePorVencer();

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          <Clock className="size-3.5" strokeWidth={2} />
          Plazos por vencer
          {data && data.length > 0 && (
            <span className="ml-auto font-normal normal-case tabular-nums text-(--rojo)">
              {data.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-3">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-(--ink-600)">
            <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
            Error al cargar plazos.
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--ink-600)">
            Sin plazos próximos a vencer.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((item) => (
              <Link
                key={item.casoId}
                href={`/casos/${item.casoId}`}
                className={cn(
                  "flex items-center gap-3 py-3 transition-colors hover:bg-(--slate-100) rounded-lg px-1 -mx-1",
                  ALERT_BG[item.plazoCritico.semaforo]
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--navy-900) truncate">
                    {item.clienteNombre}
                    {item.numeroOt && (
                      <span className="ml-2 text-xs font-semibold text-(--amber-500) tabular-nums">
                        {item.numeroOt}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-(--ink-600) truncate">
                    {item.bancoNombre} · {TIPO_PLAZO_LABELS[item.plazoCritico.tipo] ?? item.plazoCritico.tipo}
                    {" · "}{item.plazoCritico.fechaLimite}
                  </p>
                </div>
                <SemaforoIndicator
                  semaforo={item.plazoCritico.semaforo}
                  diasRestantes={item.plazoCritico.diasRestantes}
                  showDays
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
