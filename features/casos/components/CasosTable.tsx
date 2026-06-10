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
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Error al cargar los casos. Intente nuevamente.
      </p>
    );
  }

  const casos = data?.casos ?? [];

  if (casos.length === 0) {
    return (
      <p className="text-sm text-(--ink-600)">
        No hay casos registrados aún.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estado</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>RUT</TableHead>
          <TableHead>Banco</TableHead>
          <TableHead className="tabular-nums">Fecha DJ</TableHead>
          <TableHead>N° OT</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {casos.map((caso) => (
          <TableRow key={caso.id} className="cursor-pointer">
            <TableCell>
              <EstadoBadge estado={caso.estado} />
            </TableCell>
            <TableCell>
              <Link
                href={`/casos/${caso.id}`}
                className="font-medium text-(--navy-900) hover:underline"
              >
                {caso.clienteNombre}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums text-(--ink-600)">
              {caso.clienteRut}
            </TableCell>
            <TableCell className="text-(--ink-600)">{caso.bancoNombre}</TableCell>
            <TableCell className="tabular-nums text-(--ink-600)">
              {formatDate(caso.fechaDj)}
            </TableCell>
            <TableCell className="text-(--ink-600)">
              {caso.numeroOt ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
