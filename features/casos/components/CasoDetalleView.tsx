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

export function CasoDetalleView({ id }: CasoDetalleViewProps) {
  const { data, isLoading, isError } = useCaso(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        Error al cargar el caso. Intente nuevamente.
      </p>
    );
  }

  const { caso, cliente, operaciones } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
          {cliente.nombre}
        </h1>
        <EstadoBadge estado={caso.estado} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del caso</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">N° OT</dt>
                <dd className="font-display tabular-nums font-medium text-(--navy-900)">
                  {caso.numeroOt ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Fecha DJ</dt>
                <dd className="tabular-nums">{formatDate(caso.fechaDj)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Fecha denuncia</dt>
                <dd className="tabular-nums">{formatDate(caso.fechaDenuncia)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Denuncia válida</dt>
                <dd>{caso.denunciaValida ? "Sí" : "No"}</dd>
              </div>
              {caso.motivoTermino && (
                <div className="flex justify-between">
                  <dt className="text-(--ink-600)">Motivo término</dt>
                  <dd className="max-w-48 text-right">{caso.motivoTermino}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Creado</dt>
                <dd className="tabular-nums">{formatDate(caso.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Nombre</dt>
                <dd className="font-medium text-(--navy-900)">{cliente.nombre}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">RUT</dt>
                <dd className="tabular-nums">{cliente.rut}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--ink-600)">Contacto</dt>
                <dd>{cliente.contacto ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operaciones ({operaciones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {operaciones.length === 0 ? (
            <p className="text-sm text-(--ink-600)">Sin operaciones registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medio de pago</TableHead>
                  <TableHead>Relación</TableHead>
                  <TableHead className="tabular-nums text-right">Monto CLP</TableHead>
                  <TableHead className="tabular-nums text-right">Monto UF</TableHead>
                  <TableHead className="tabular-nums">Fecha op.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operaciones.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>{MEDIO_PAGO_LABELS[op.medioPago] ?? op.medioPago}</TableCell>
                    <TableCell>{RELACION_LABELS[op.relacion] ?? op.relacion}</TableCell>
                    <TableCell className="tabular-nums text-right">
                      {formatMontoCLP(op.montoCLP)}
                    </TableCell>
                    <TableCell className="tabular-nums text-right">
                      {op.montoUF != null ? op.montoUF.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatDate(op.fechaOp)}</TableCell>
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
