"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
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
import { TransicionarEstadoDialog } from "./TransicionarEstadoDialog";
import { PlazosCard } from "@/features/plazos/components/PlazosCard";
import { DocumentosCard } from "@/features/documentos/components/DocumentosCard";
import { useCaso } from "@/features/casos/hooks/useCaso";
import { useHistorialCaso } from "@/features/casos/hooks/useHistorialCaso";
import type { HistorialEntry, Estado } from "@/lib/api/types";

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
      <dd className="text-sm font-medium text-(--navy-900) text-right max-w-[60%]">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditEntryDescription({ entry }: { entry: HistorialEntry }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = entry.detalle as Record<string, any>;

  switch (entry.accion) {
    case "CASO_CREADO":
      return (
        <span className="text-(--navy-900)">
          Caso creado{" "}
          {d.estado && (
            <>
              en estado <EstadoBadge estado={d.estado as Estado} />
            </>
          )}
        </span>
      );

    case "ESTADO_CAMBIADO":
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <EstadoBadge estado={d.anterior as Estado} />
          <ArrowRight className="size-3.5 shrink-0 text-(--ink-600)" />
          <EstadoBadge estado={d.nuevo as Estado} />
        </span>
      );

    case "ABOGADO_ASIGNADO":
      return (
        <span className="text-(--navy-900)">
          Abogado asignado
          {d.numero_ot && (
            <span className="ml-1.5 font-semibold text-(--amber-500)">{String(d.numero_ot)}</span>
          )}
        </span>
      );

    case "CASO_ACTUALIZADO":
      return <span className="text-(--navy-900)">Caso actualizado</span>;

    case "OPERACION_AGREGADA":
      return (
        <span className="text-(--navy-900)">
          Operación agregada
          {d.monto_clp != null && (
            <span className="ml-1.5 tabular-nums text-(--ink-600)">
              · ${Number(d.monto_clp).toLocaleString("es-CL")}
            </span>
          )}
        </span>
      );

    default:
      return <span className="text-(--navy-900)">{entry.accion}</span>;
  }
}

export function CasoDetalleView({ id }: CasoDetalleViewProps) {
  const { data, isLoading, isError, refetch } = useCaso(id);
  const { data: historial } = useHistorialCaso(id);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="rounded-xl bg-(--slate-100) p-3.5">
          <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-(--navy-900)">No se pudo cargar el caso</p>
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
    );
  }

  const { caso, cliente, operaciones } = data;
  const totalCLP = operaciones.reduce((sum, op) => sum + op.montoCLP, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
            {cliente.nombre}
          </h1>
          <p className="mt-0.5 text-sm tabular-nums text-(--ink-600)">{cliente.rut}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {caso.numeroOt && (
            <span className="font-display text-sm font-semibold text-(--amber-500) tabular-nums">
              {caso.numeroOt}
            </span>
          )}
          <EstadoBadge estado={caso.estado} />
          <TransicionarEstadoDialog
            casoId={caso.id}
            estadoActual={caso.estado}
            denunciaValida={caso.denunciaValida}
          />
        </div>
      </div>

      {/* Cards de detalle */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border-border shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Caso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <dl>
              <Field
                label="Fecha DJ"
                value={<span className="tabular-nums">{formatDate(caso.fechaDj)}</span>}
              />
              <Field
                label="Fecha denuncia"
                value={<span className="tabular-nums">{formatDate(caso.fechaDenuncia)}</span>}
              />
              <Field
                label="Denuncia válida"
                value={caso.denunciaValida ? "Sí" : "No"}
              />
              {caso.motivoTermino && (
                <Field label="Motivo término" value={caso.motivoTermino} />
              )}
              <Field
                label="Registrado"
                value={<span className="tabular-nums">{formatDate(caso.createdAt)}</span>}
              />
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <dl>
              <Field label="Nombre" value={cliente.nombre} />
              <Field
                label="RUT"
                value={<span className="tabular-nums">{cliente.rut}</span>}
              />
              <Field label="Contacto" value={cliente.contacto ?? "—"} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Operaciones */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Operaciones impugnadas
              {operaciones.length > 0 && (
                <span className="ml-1.5 font-normal normal-case text-muted-foreground">
                  ({operaciones.length})
                </span>
              )}
            </CardTitle>
            {operaciones.length > 0 && (
              <span className="text-sm font-semibold tabular-nums text-(--navy-900)">
                {formatMontoCLP(totalCLP)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {operaciones.length === 0 ? (
            <p className="py-4 text-center text-sm text-(--ink-600)">
              Sin operaciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Medio
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Relación
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) text-right">
                    Monto CLP
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) text-right">
                    UF
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                    Fecha
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operaciones.map((op) => (
                  <TableRow
                    key={op.id}
                    className="hover:bg-(--slate-100) transition-colors"
                  >
                    <TableCell className="text-sm">
                      {MEDIO_PAGO_LABELS[op.medioPago] ?? op.medioPago}
                    </TableCell>
                    <TableCell className="text-sm text-(--ink-600)">
                      {RELACION_LABELS[op.relacion] ?? op.relacion}
                    </TableCell>
                    <TableCell className="tabular-nums text-right text-sm font-medium text-(--navy-900)">
                      {formatMontoCLP(op.montoCLP)}
                    </TableCell>
                    <TableCell className="tabular-nums text-right text-sm text-(--ink-600)">
                      {op.montoUF != null ? `${op.montoUF.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-(--ink-600)">
                      {formatDate(op.fechaOp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auditoría */}
      {historial && historial.length > 0 && (
        <Card className="rounded-xl border-border shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Auditoría
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <ol className="space-y-3">
              {historial.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm flex-wrap">
                  <span className="shrink-0 text-(--ink-600) tabular-nums text-xs pt-0.5">
                    {formatDateTime(entry.createdAt)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <AuditEntryDescription entry={entry} />
                  </span>
                  <span className="text-xs text-(--ink-600) shrink-0">
                    {entry.usuarioNombre}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Plazos */}
      <PlazosCard casoId={id} />

      {/* Documentos */}
      <DocumentosCard casoId={id} />
    </div>
  );
}
