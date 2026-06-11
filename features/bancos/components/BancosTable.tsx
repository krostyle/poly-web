"use client";

import { useRouter } from "next/navigation";
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
import { useBancos } from "@/features/bancos/hooks/useBancos";

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
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function BancosTable() {
  const router = useRouter();
  const { data: bancos, isLoading, isError, refetch } = useBancos();

  return (
    <div className="rounded-xl border border-border bg-(--paper) overflow-hidden">
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-xl bg-(--slate-100) p-3.5">
            <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-(--navy-900)">No se pudieron cargar los bancos</p>
            <p className="mt-0.5 text-xs text-(--ink-600)">Verifica tu conexión e intenta nuevamente.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : !bancos || bancos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-xl bg-(--slate-100) p-3.5">
            <FolderOpen className="size-6 text-(--ink-600)" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-(--navy-900)">Sin bancos registrados</p>
            <p className="mt-0.5 text-xs text-(--ink-600)">
              Crea el primero para poder comenzar a registrar casos.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-(--slate-100) hover:bg-(--slate-100)">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Banco
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                Registrado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bancos.map((banco) => (
              <TableRow
                key={banco.id}
                className="hover:bg-(--slate-100) transition-colors cursor-pointer"
                onClick={() => router.push(`/configuracion/bancos/${banco.id}`)}
              >
                <TableCell className="text-sm font-medium text-(--navy-900)">
                  {banco.nombre}
                </TableCell>
                <TableCell className="tabular-nums text-sm text-(--ink-600)">
                  {formatDate(banco.createdAt)}
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
