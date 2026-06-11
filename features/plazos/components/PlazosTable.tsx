"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SemaforoIndicator } from "./SemaforoIndicator";
import { usePlazos, useCumplirPlazoGlobal } from "@/features/plazos/hooks/usePlazos";
import { cn } from "@/lib/utils";
import type { TipoPlazo, Semaforo } from "@/lib/api/types";

const TIPO_LABELS: Record<TipoPlazo, string> = {
  ANALISIS_INTERNO: "Análisis interno",
  RESTITUCION: "Restitución",
  ASIGNACION: "Asignación",
  PRECAUTELAR: "Medida precautelar",
  DEMANDA: "Demanda",
  RESTITUCION_RECHAZO: "Rechazo restitución",
};

const SEMAFORO_OPTIONS: { value: Semaforo | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "VENCIDO", label: "Vencido" },
  { value: "ROJO", label: "Urgente" },
  { value: "AMARILLO", label: "Por vencer" },
  { value: "VERDE", label: "Al día" },
];

const ALERT_ROW: Partial<Record<Semaforo, string>> = {
  ROJO: "bg-(--rojo)/5",
  VENCIDO: "bg-(--vencido)/5",
};

function RowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  );
}

export function PlazosTable() {
  const [tipoFilter, setTipoFilter] = useState<TipoPlazo | "">("");
  const [semaforoFilter, setSemaforoFilter] = useState<Semaforo | "">("");

  const { data, isLoading, isError, refetch } = usePlazos({
    tipo: tipoFilter || undefined,
    semaforo: semaforoFilter || undefined,
  });

  const { mutate: cumplir, isPending: cumpliendo } = useCumplirPlazoGlobal();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={semaforoFilter}
          onValueChange={(v) => setSemaforoFilter(v as Semaforo | "")}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Semáforo" />
          </SelectTrigger>
          <SelectContent>
            {SEMAFORO_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={tipoFilter}
          onValueChange={(v) => setTipoFilter(v as TipoPlazo | "")}
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue placeholder="Tipo de plazo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="" className="text-xs">Todos los tipos</SelectItem>
            {(Object.entries(TIPO_LABELS) as [TipoPlazo, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(tipoFilter || semaforoFilter) && (
          <button
            onClick={() => { setTipoFilter(""); setSemaforoFilter(""); }}
            className="text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
          >
            Limpiar filtros
          </button>
        )}

        {data && (
          <span className="ml-auto text-xs text-(--ink-600) tabular-nums">
            {data.length} plazo{data.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
            </tbody>
          </table>
        ) : isError ? (
          <div className="flex items-center gap-2 px-4 py-8 text-sm text-(--ink-600)">
            <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
            No se pudieron cargar los plazos.{" "}
            <button
              onClick={() => refetch()}
              className="underline underline-offset-2 hover:text-(--navy-900) transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !data || data.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-(--ink-600)">
            Sin plazos activos{tipoFilter || semaforoFilter ? " con los filtros seleccionados" : ""}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-(--slate-100)/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Caso
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Banco
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Tipo de plazo
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Fecha límite
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Estado
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      "transition-colors hover:bg-(--slate-100)",
                      ALERT_ROW[p.semaforo]
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/casos/${p.casoId}`}
                        className="block hover:underline underline-offset-2"
                      >
                        <span className="font-medium text-(--navy-900)">
                          {p.clienteNombre}
                        </span>
                        {p.numeroOt && (
                          <span className="ml-2 text-xs font-semibold text-(--amber-500) tabular-nums">
                            {p.numeroOt}
                          </span>
                        )}
                        <span className="block text-xs text-(--ink-600) tabular-nums">
                          {p.clienteRut}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-(--ink-600)">{p.bancoNombre}</td>
                    <td className="px-4 py-3 text-(--navy-900)">
                      {TIPO_LABELS[p.tipo] ?? p.tipo}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-(--ink-600)">
                      {formatDate(p.fechaLimite)}
                    </td>
                    <td className="px-4 py-3">
                      <SemaforoIndicator
                        semaforo={p.semaforo}
                        diasRestantes={p.diasRestantes}
                        showDays
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={cumpliendo}
                        onClick={() => cumplir({ casoId: p.casoId, plazoId: p.id })}
                      >
                        Cumplido
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
