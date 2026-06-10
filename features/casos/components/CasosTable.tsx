"use client";

import Link from "next/link";
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

export function CasosTable() {
  const { data, isLoading, isError } = useCasos();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-(--paper) overflow-hidden">
        <div className="space-y-0 divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border-border bg-(--paper) px-6 py-12 text-center">
        <p className="text-sm text-(--ink-600)">No se pudo cargar la lista de casos.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const casos = data?.casos ?? [];

  if (casos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-(--paper) px-6 py-12 text-center">
        <p className="text-sm text-(--ink-600)">No hay casos registrados aún.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Usá el botón "Nuevo caso" para registrar el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-(--paper) overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-(--slate-100) hover:bg-(--slate-100)">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Estado
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Cliente
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums">
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
                  className="font-medium text-(--navy-900) hover:underline underline-offset-2"
                >
                  {caso.clienteNombre}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums text-(--ink-600) text-sm">
                {caso.clienteRut}
              </TableCell>
              <TableCell className="text-(--ink-600) text-sm">
                {caso.bancoNombre}
              </TableCell>
              <TableCell className="tabular-nums text-(--ink-600) text-sm">
                {formatDate(caso.fechaDj)}
              </TableCell>
              <TableCell className="text-(--ink-600) text-sm tabular-nums">
                {caso.numeroOt ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
