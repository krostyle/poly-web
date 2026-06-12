"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { SemaforoIndicator } from "./SemaforoIndicator";
import { usePlazosCaso, useCumplirPlazo } from "@/features/plazos/hooks/usePlazosCaso";
import type { Semaforo } from "@/lib/api/types";

const TIPO_LABELS: Record<string, string> = {
  ANALISIS_INTERNO:    "Análisis interno",
  RESTITUCION:         "Restitución",
  ASIGNACION:          "Asignación",
  PRECAUTELAR:         "Medida precautelar",
  RESOLUCION_JPL:      "Resolución JPL",
  DEMANDA:             "Demanda banco",
  RESTITUCION_RECHAZO: "Rechazo restitución",
  RESPUESTA_DENUNCIA:  "Respuesta denuncia",
};

interface PlazosCardProps {
  casoId: string;
}

export function PlazosCard({ casoId }: PlazosCardProps) {
  const { data: plazos, isLoading, isError, refetch } = usePlazosCaso(casoId);
  const { mutate: cumplir, isPending: cumpliendo } = useCumplirPlazo(casoId);

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Plazos legales
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-xl bg-(--slate-100) p-3">
              <AlertCircle className="size-5 text-(--ink-600)" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-(--ink-600)">No se pudieron cargar los plazos.</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !plazos || plazos.length === 0 ? (
          <p className="py-4 text-center text-sm text-(--ink-600)">Sin plazos registrados.</p>
        ) : (
          <div className="divide-y divide-border">
            {plazos.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 text-sm"
              >
                <span
                  className={
                    p.cumplido
                      ? "flex-1 text-(--ink-600) line-through"
                      : "flex-1 font-medium text-(--navy-900)"
                  }
                >
                  {TIPO_LABELS[p.tipo] ?? p.tipo}
                </span>

                {p.cumplido ? (
                  <span className="inline-flex items-center gap-1 text-xs text-(--ink-600)">
                    <CheckCircle2 className="size-3.5 text-(--verde)" />
                    Cumplido
                    {p.fechaCumplido && (
                      <span className="tabular-nums">{formatDate(p.fechaCumplido)}</span>
                    )}
                  </span>
                ) : (
                  <>
                    <SemaforoIndicator
                      semaforo={(p.semaforo ?? "VERDE") as Semaforo}
                      diasRestantes={p.diasRestantes}
                      showDays
                    />
                    <span className="tabular-nums text-xs text-(--ink-600)">
                      Límite: {formatDate(p.fechaLimite)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={cumpliendo}
                      onClick={() => cumplir(p.id)}
                    >
                      Marcar cumplido
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
