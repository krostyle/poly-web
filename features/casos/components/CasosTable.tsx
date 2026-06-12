"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoBadge } from "./EstadoBadge";
import { useCasos } from "@/features/casos/hooks/useCasos";
import { useMe } from "@/features/auth/hooks/useMe";
import type { CasoFilters } from "@/lib/api/casos";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMontoCLP(monto: number): string {
  if (monto === 0) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(monto);
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 text-(--ink-600)" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function CasosTable({ filters }: { filters?: CasoFilters }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCasos(filters);
  const { data: me } = useMe();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const casos = data?.casos ?? [];
  const noBancos = !isLoading && me !== undefined && me.bancos.length === 0;
  const isAdmin = me?.usuario.rol === "ADMIN";

  return (
    <div className="rounded-xl border-border bg-(--paper) overflow-hidden">
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-xl bg-(--slate-100) p-3.5">
            <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-(--navy-900)">
              No se pudieron cargar los casos
            </p>
            <p className="mt-0.5 text-xs text-(--ink-600)">
              Verifica tu conexión e intenta nuevamente.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : casos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-xl bg-(--slate-100) p-3.5">
            <FolderOpen className="size-6 text-(--ink-600)" strokeWidth={1.5} />
          </div>
          {noBancos ? (
            <div>
              <p className="text-sm font-medium text-(--navy-900)">Sin bancos asignados</p>
              <p className="mt-0.5 text-xs text-(--ink-600)">
                Necesitas acceso a al menos un banco para ver y registrar casos.
              </p>
              {isAdmin && (
                <Link
                  href="/configuracion/bancos"
                  className="mt-3 inline-flex text-xs font-medium text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
                >
                  Ir a Configuración →
                </Link>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-(--navy-900)">
                {filters && (filters.q || filters.bancoId || filters.estado || filters.soloMios)
                  ? "Sin resultados para los filtros aplicados"
                  : "Sin casos registrados"}
              </p>
              {!(filters?.q || filters?.bancoId || filters?.estado || filters?.soloMios) && (
                <p className="mt-0.5 text-xs text-(--ink-600)">
                  Los casos aparecerán aquí una vez que los crees.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-(--slate-100) hover:bg-(--slate-100)">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Estado
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Cliente
              </TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                RUT
              </TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Banco
              </TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums">
                Fecha DJ
              </TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wide text-(--ink-600) text-right">
                Monto
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                N° OT
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casos.map((caso) => {
              const isNavigating = navigatingId === caso.id;
              return (
                <TableRow
                  key={caso.id}
                  className={`transition-colors cursor-pointer ${
                    isNavigating
                      ? "bg-(--slate-100) opacity-60 pointer-events-none"
                      : "hover:bg-(--slate-100)"
                  }`}
                  onClick={() => {
                    if (navigatingId) return;
                    setNavigatingId(caso.id);
                    router.push(`/casos/${caso.id}`);
                  }}
                >
                  <TableCell>
                    {isNavigating ? (
                      <Loader2 className="size-4 animate-spin text-(--ink-600)" />
                    ) : (
                      <EstadoBadge estado={caso.estado} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-(--navy-900)">
                    {caso.clienteNombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell tabular-nums text-sm text-(--ink-600)">
                    {caso.clienteRut}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-(--ink-600)">
                    {caso.bancoNombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell tabular-nums text-sm text-(--ink-600)">
                    {caso.fechaDj ? formatDate(caso.fechaDj) : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell tabular-nums text-sm font-medium text-(--navy-900) text-right">
                    {formatMontoCLP(caso.totalCLP)}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {caso.numeroOt ? (
                      <span className="font-display font-medium text-(--amber-500)">
                        {caso.numeroOt}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
