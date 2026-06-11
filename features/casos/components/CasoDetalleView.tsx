"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { EstadoBadge } from "./EstadoBadge";
import { TransicionarEstadoDialog } from "./TransicionarEstadoDialog";
import { PlazosCard } from "@/features/plazos/components/PlazosCard";
import { DocumentosCard } from "@/features/documentos/components/DocumentosCard";
import { useCaso } from "@/features/casos/hooks/useCaso";
import { useHistorialCaso } from "@/features/casos/hooks/useHistorialCaso";
import { useActualizarCaso } from "@/features/casos/hooks/useActualizarCaso";
import { useEliminarCaso } from "@/features/casos/hooks/useEliminarCaso";
import { useUsuariosBanco } from "@/features/bancos/hooks/useUsuariosBanco";
import { useMe } from "@/features/auth/hooks/useMe";
import type { HistorialEntry, Estado, Caso } from "@/lib/api/types";

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
          {d.forzado && (
            <span className="text-xs text-amber-600">(corrección manual)</span>
          )}
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

// ── Unsaved changes bar ────────────────────────────────────────────────────────

function UnsavedChangesBar({
  onSave,
  onDiscard,
  isSaving,
}: {
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-(--paper)/95 px-6 py-3 shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-amber-400 shrink-0" />
        <span className="text-sm text-(--ink-600)">Tienes cambios sin guardar</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
        >
          Descartar
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

// ── Editable Caso card ────────────────────────────────────────────────────────

interface EditState {
  abogadoId: string;
  numeroOt: string;
  denunciaValida: boolean;
  fechaDenuncia: string;
}

function CasoEditCard({ caso }: { caso: Caso }) {
  const { data: usuarios } = useUsuariosBanco(caso.bancoId);
  const { mutate, isPending } = useActualizarCaso(caso.id);

  const original = useMemo<EditState>(
    () => ({
      abogadoId: caso.abogadoId ?? "",
      numeroOt: caso.numeroOt ?? "",
      denunciaValida: caso.denunciaValida,
      fechaDenuncia: caso.fechaDenuncia ?? "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caso.abogadoId, caso.numeroOt, caso.denunciaValida, caso.fechaDenuncia]
  );

  const [current, setCurrent] = useState<EditState>(original);

  // Sync local state when server data updates (after save or external change)
  useEffect(() => {
    setCurrent(original);
  }, [original]);

  function set<K extends keyof EditState>(key: K, value: EditState[K]) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  const isDirty =
    current.abogadoId !== original.abogadoId ||
    current.numeroOt !== original.numeroOt ||
    current.denunciaValida !== original.denunciaValida ||
    current.fechaDenuncia !== original.fechaDenuncia;

  function handleSave() {
    const patch: {
      abogadoId?: string;
      numeroOt?: string;
      denunciaValida?: boolean;
      fechaDenuncia?: string;
    } = {};
    if (current.abogadoId !== original.abogadoId)
      patch.abogadoId = current.abogadoId || undefined;
    if (current.numeroOt !== original.numeroOt)
      patch.numeroOt = current.numeroOt.trim() || undefined;
    if (current.denunciaValida !== original.denunciaValida)
      patch.denunciaValida = current.denunciaValida;
    if (current.fechaDenuncia !== original.fechaDenuncia)
      patch.fechaDenuncia = current.fechaDenuncia || undefined;
    mutate(patch);
  }

  // Lookup abogado name from loaded users (avoids displaying UUID when items aren't ready)
  const abogadoNombre = useMemo(
    () => usuarios?.find((u) => u.id === current.abogadoId)?.nombre,
    [usuarios, current.abogadoId]
  );

  return (
    <>
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
            Caso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <dl>
            {/* Abogado — render label directly so UUID never appears */}
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Abogado</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.abogadoId}
                  onValueChange={(v) => set("abogadoId", v ?? "")}
                >
                  <SelectTrigger className="h-8 w-full max-w-48 text-sm border-transparent hover:border-input focus:border-input bg-transparent hover:bg-(--slate-100) px-2">
                    {/* Skip SelectValue — render name directly to avoid UUID display bug */}
                    <span className="flex-1 text-left text-sm truncate">
                      {current.abogadoId
                        ? (abogadoNombre ?? "—")
                        : <span className="text-muted-foreground text-sm">Sin asignar</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" className="text-sm text-muted-foreground">
                      Sin asignar
                    </SelectItem>
                    {(usuarios ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-sm">
                        {u.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>

            {/* N° OT */}
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">N° OT</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.numeroOt}
                  onChange={(e) => set("numeroOt", e.target.value)}
                  placeholder="—"
                  className="w-full max-w-35 rounded border-transparent bg-transparent px-2 py-0.5 text-right text-sm font-medium font-display text-(--amber-500) placeholder:font-sans placeholder:text-muted-foreground placeholder:font-normal outline-none hover:border hover:border-input focus:border focus:border-input focus:bg-(--slate-100)"
                />
              </dd>
            </div>

            {/* Denuncia válida */}
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600)">Denuncia válida</dt>
              <dd>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-(--navy-900)">
                  <input
                    type="checkbox"
                    checked={current.denunciaValida}
                    onChange={(e) => set("denunciaValida", e.target.checked)}
                    className="size-4 rounded accent-current"
                  />
                  {current.denunciaValida ? "Sí" : "No"}
                </label>
              </dd>
            </div>

            {/* Fecha denuncia */}
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha denuncia</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaDenuncia || undefined}
                  onChange={(v) => set("fechaDenuncia", v)}
                  placeholder="Sin fecha"
                  className="h-8 w-full max-w-44 text-sm border-transparent hover:border-input bg-transparent hover:bg-(--slate-100)"
                />
              </dd>
            </div>

            <Field
              label="Fecha DJ"
              value={<span className="tabular-nums">{formatDate(caso.fechaDj)}</span>}
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

      {isDirty && (
        <UnsavedChangesBar
          onSave={handleSave}
          onDiscard={() => setCurrent(original)}
          isSaving={isPending}
        />
      )}
    </>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function CasoDetalleView({ id }: CasoDetalleViewProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCaso(id);
  const { data: historial } = useHistorialCaso(id);
  const { data: me } = useMe();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const eliminar = useEliminarCaso(id, () => router.push("/casos"));

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
  const isAdmin = me?.usuario.rol === "ADMIN";
  const canDelete = isAdmin && caso.estado === "INGRESO";

  return (
    <div className="space-y-6 pb-20">
      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este caso?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente el caso de{" "}
              <strong>{cliente.nombre}</strong> y todos sus registros
              asociados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={eliminar.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => eliminar.mutate()}
              disabled={eliminar.isPending}
            >
              {eliminar.isPending ? "Eliminando…" : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards de detalle */}
      <div className="grid gap-4 md:grid-cols-2">
        <CasoEditCard caso={caso} />

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
