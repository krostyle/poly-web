"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoBadge } from "./EstadoBadge";
import { useCaso } from "@/features/casos/hooks/useCaso";

interface CasoDetalleViewProps {
  id: string;
}

const MEDIO_PAGO_LABELS: Record<string, string> = {
  TARJETA_CREDITO: "Tarjeta crédito",
  TARJETA_DEBITO: "Tarjeta débito",
  TRANSFERENCIA: "Transferencia",
  CAJERO: "Cajero",
};

const RELACION_LABELS: Record<string, string> = {
  CUENTA_PROPIA: "Cuenta propia",
  FAMILIAR: "Familiar",
  TERCERO: "Tercero",
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMontoCLP(monto: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(monto);
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-border last:border-0">
      <dt className="text-sm text-(--ink-600)">{label}</dt>
      <dd className="text-sm font-medium text-(--navy-900) text-right">{value}</dd>
    </div>
  );
}

export function CasoDetalleView({ id }: CasoDetalleViewProps) {
  const { data, isLoading, isError } = useCaso(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border-border bg-(--paper) px-6 py-12 text-center">
        <p className="text-sm text-(--ink-600)">No se pudo cargar el caso.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { caso, cliente, operaciones } = data;
  const totalCLP = operaciones.reduce((sum, op) => sum + op.montoCLP, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
            {cliente.nombre}
          </h1>
          <p className="mt-0.5 text-sm text-(--ink-600) tabular-nums">{cliente.rut}</p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          {caso.numeroOt && (
            <span className="font-display text-sm font-medium text-(--amber-500) tabular-nums">
              {caso.numeroOt}
            </span>
          )}
          <EstadoBadge estado={caso.estado} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border-border shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-(--ink-600)">
              Caso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <dl>
              <Field label="Fecha DJ" value={<span className="tabular-nums">{formatDate(caso.fechaDj)}</span>} />
              <Field label="Fecha denuncia" value={<span className="tabular-nums">{formatDate(caso.fechaDenuncia)}</span>} />
              <Field label="Denuncia válida" value={caso.denunciaValida ? "Sí" : "No"} />
              {caso.motivoTermino && (
                <Field label="Motivo término" value={caso.motivoTermino} />
              )}
              <Field label="Creado" value={<span className="tabular-nums">{formatDate(caso.createdAt)}</span>} />
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-(--ink-600)">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <dl>
              <Field label="Nombre" value={cliente.nombre} />
              <Field label="RUT" value={<span className="tabular-nums">{cliente.rut}</span>} />
              <Field label="Contacto" value={cliente.contacto ?? "—"} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-(--ink-600)">
            Operaciones impugnadas
          </CardTitle>
          {operaciones.length > 0 && (
            <span className="text-sm font-medium tabular-nums text-(--navy-900)">
              Total: {formatMontoCLP(totalCLP)}
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-3">
          {operaciones.length === 0 ? (
            <p className="text-sm text-(--ink-600) py-2">Sin operaciones registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Medio de pago</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Relación</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums text-right">Monto CLP</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums text-right">Monto UF</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) tabular-nums">Fecha op.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operaciones.map((op) => (
                  <TableRow key={op.id} className="hover:bg-(--slate-100) transition-colors">
                    <TableCell className="text-sm">{MEDIO_PAGO_LABELS[op.medioPago] ?? op.medioPago}</TableCell>
                    <TableCell className="text-sm">{RELACION_LABELS[op.relacion] ?? op.relacion}</TableCell>
                    <TableCell className="tabular-nums text-right text-sm font-medium">
                      {formatMontoCLP(op.montoCLP)}
                    </TableCell>
                    <TableCell className="tabular-nums text-right text-sm text-(--ink-600)">
                      {op.montoUF != null ? `${op.montoUF.toFixed(2)} UF` : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-(--ink-600)">{formatDate(op.fechaOp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
