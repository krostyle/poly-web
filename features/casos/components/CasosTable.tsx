"use client";

import Link from "next/link";
import { FolderOpen, AlertCircle } from "lucide-react";
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

export function CasosTable() {
  const { data, isLoading, isError, refetch } = useCasos();

  const casos = data?.casos ?? [];

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
          <div>
            <p className="text-sm font-medium text-(--navy-900)">Sin casos registrados</p>
            <p className="mt-0.5 text-xs text-(--ink-600)">
              Los casos aparecerán aquí una vez que los crees.
            </p>
          </div>
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                RUT
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Banco
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums">
                Fecha DJ
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                N° OT
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casos.map((caso) => (
              <TableRow
                key={caso.id}
                className="hover:bg-(--slate-100) transition-colors"
              >
                <TableCell>
                  <EstadoBadge estado={caso.estado} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/casos/${caso.id}`}
                    className="text-sm font-medium text-(--navy-900) hover:underline underline-offset-2"
                  >
                    {caso.clienteNombre}
                  </Link>
                </TableCell>
                <TableCell className="tabular-nums text-sm text-(--ink-600)">
                  {caso.clienteRut}
                </TableCell>
                <TableCell className="text-sm text-(--ink-600)">
                  {caso.bancoNombre}
                </TableCell>
                <TableCell className="tabular-nums text-sm text-(--ink-600)">
                  {formatDate(caso.fechaDj)}
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
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
