"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Trash2 } from "lucide-react";
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
import { useActualizarCliente } from "@/features/casos/hooks/useActualizarCliente";
import { useEliminarCaso } from "@/features/casos/hooks/useEliminarCaso";
import { useUsuariosBanco } from "@/features/bancos/hooks/useUsuariosBanco";
import { useMe } from "@/features/auth/hooks/useMe";
import { TribunalCombobox } from "@/features/tribunales/components/TribunalCombobox";
import { CasoFlowView } from "./CasoFlowView";
import type { HistorialEntry, Estado, EstadoDenuncia, Caso, Cliente, ResultadoJPL } from "@/lib/api/types";

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

function formatDate(iso: string | undefined | null): string {
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

    case "CASO_ACTUALIZADO": {
      const cambios = d.cambios as Record<string, string | null> | undefined;
      const CAMPO_LABELS: Record<string, string> = {
        abogado:              "Abogado",
        numero_ot:            "N° OT",
        estado_denuncia:      "Denuncia banco",
        fecha_denuncia:       "Fecha denuncia",
        fecha_dj:             "Fecha DJ",
        numero_rol:           "N° Rol",
        tribunal:             "Tribunal",
        region:               "Región",
        resultado_jpl:        "Resultado JPL",
        fecha_resolucion_jpl: "Fecha resolución JPL",
      };
      const DENUNCIA_LABELS: Record<string, string> = {
        SOLICITADA: "Solicitada", VALIDA: "Válida", INVALIDA: "Inválida", SIN_DENUNCIA: "Sin denuncia",
      };
      const items = cambios
        ? Object.entries(cambios).map(([k, v]) => {
            const label = CAMPO_LABELS[k] ?? k;
            if (v === null || v === "") return `${label} eliminado`;
            if (k === "estado_denuncia") return `${label} → ${DENUNCIA_LABELS[v] ?? v}`;
            if (k === "abogado") return label; // ID, no mostramos UUID
            return `${label} → ${v}`;
          })
        : [];
      return (
        <span className="text-(--navy-900)">
          Caso actualizado
          {items.length > 0 && (
            <span className="ml-1 text-(--ink-600)">— {items.join(", ")}</span>
          )}
        </span>
      );
    }

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
          {isSaving && <Loader2 className="size-3.5 animate-spin" />}
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

// ── Shared editable field types ───────────────────────────────────────────────

const ESTADO_DENUNCIA_LABELS: Record<EstadoDenuncia, string> = {
  SOLICITADA:   "Solicitada",
  VALIDA:       "Válida",
  INVALIDA:     "Inválida",
  SIN_DENUNCIA: "Sin denuncia",
};

interface CasoEditState {
  abogadoId: string;
  numeroOt: string;
  estadoDenuncia: EstadoDenuncia;
  fechaDenuncia: string;
  fechaDj: string;
  numeroRol: string;
  tribunal: string;
  region: string;
  resultadoJpl: ResultadoJPL | "";
  fechaResolucionJpl: string;
}

const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

interface ClienteEditState {
  nombre: string;
  contacto: string;
}

// ── Editable Caso card (purely presentational) ────────────────────────────────

function CasoEditCard({
  caso,
  current,
  onChange,
  canEditCaseFields,
}: {
  caso: Caso;
  current: CasoEditState;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEditCaseFields: boolean;
}) {
  const { data: usuarios } = useUsuariosBanco(caso.bancoId);

  const abogadoNombre = useMemo(
    () => usuarios?.find((u) => u.id === current.abogadoId)?.nombre ?? "—",
    [usuarios, current.abogadoId]
  );

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Caso
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* Abogado */}
          {canEditCaseFields ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Abogado</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.abogadoId}
                  onValueChange={(v) => onChange("abogadoId", v ?? "")}
                >
                  <SelectTrigger className="h-8 w-full max-w-48 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.abogadoId
                        ? abogadoNombre
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
          ) : (
            <Field label="Abogado" value={current.abogadoId ? abogadoNombre : "—"} />
          )}

          {/* N° OT */}
          {canEditCaseFields ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">N° OT</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.numeroOt}
                  onChange={(e) => onChange("numeroOt", e.target.value)}
                  placeholder="—"
                  className="w-full max-w-35 rounded border border-border/60 bg-(--slate-100)/60 px-2 py-0.5 text-right text-sm font-medium font-display text-(--amber-500) placeholder:font-sans placeholder:text-muted-foreground placeholder:font-normal outline-none hover:border-input focus:border-input focus:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : (
            <Field
              label="N° OT"
              value={
                current.numeroOt
                  ? <span className="font-display font-semibold text-(--amber-500)">{current.numeroOt}</span>
                  : "—"
              }
            />
          )}

          {/* Estado denuncia */}
          {canEditCaseFields ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Denuncia banco</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.estadoDenuncia}
                  onValueChange={(v) => onChange("estadoDenuncia", (v ?? "SOLICITADA") as EstadoDenuncia)}
                >
                  <SelectTrigger className="h-8 w-full max-w-36 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {ESTADO_DENUNCIA_LABELS[current.estadoDenuncia]}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {(["SOLICITADA", "VALIDA", "INVALIDA", "SIN_DENUNCIA"] as EstadoDenuncia[]).map((v) => (
                      <SelectItem key={v} value={v} className="text-sm">
                        {ESTADO_DENUNCIA_LABELS[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : (
            <Field label="Denuncia banco" value={ESTADO_DENUNCIA_LABELS[current.estadoDenuncia]} />
          )}

          {/* Fecha DJ — editable for all roles, obligatoria */}
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">
              Fecha DJ <span className="text-destructive">*</span>
            </dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <DatePicker
                value={current.fechaDj || undefined}
                onChange={(v) => { if (v) onChange("fechaDj", v); }}
                placeholder="Sin fecha"
                toDate={new Date()}
                className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
              />
            </dd>
          </div>

          {/* Fecha denuncia — bloqueada mientras el banco no haya respondido */}
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Fecha denuncia</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <DatePicker
                value={current.fechaDenuncia || undefined}
                onChange={(v) => onChange("fechaDenuncia", v)}
                placeholder={current.estadoDenuncia === "SIN_DENUNCIA" ? "Sin denuncia" : ""}
                disabled={current.estadoDenuncia === "SIN_DENUNCIA"}
                className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
              />
            </dd>
          </div>

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
  );
}

// ── Editable Cliente card (purely presentational) ─────────────────────────────

const editInputClass =
  "w-full rounded border border-border/60 bg-(--slate-100)/60 px-2 py-1 text-right text-sm font-medium text-(--navy-900) outline-none hover:border-input focus:border-input focus:bg-(--slate-100)";

function ClienteEditCard({
  cliente,
  current,
  onChange,
}: {
  cliente: Cliente;
  current: ClienteEditState;
  onChange: (key: keyof ClienteEditState, value: string) => void;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Nombre</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <input
                type="text"
                value={current.nombre}
                onChange={(e) => onChange("nombre", e.target.value)}
                className={editInputClass}
              />
            </dd>
          </div>

          <Field
            label="RUT"
            value={<span className="tabular-nums">{cliente.rut}</span>}
          />

          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Contacto</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <input
                type="text"
                value={current.contacto}
                onChange={(e) => onChange("contacto", e.target.value)}
                placeholder="—"
                className={`${editInputClass} placeholder:font-normal placeholder:text-muted-foreground`}
              />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Datos judiciales card ─────────────────────────────────────────────────────

const RESULTADO_JPL_OPTIONS: { value: ResultadoJPL; label: string }[] = [
  { value: "ACEPTA_SUSPENSION",  label: "Acepta suspensión — continúa vía judicial" },
  { value: "RECHAZA_SUSPENSION", label: "Rechaza suspensión — banco devuelve el monto" },
  { value: "FALLO_FAVORABLE",    label: "Fallo favorable al cliente" },
  { value: "FALLO_DESFAVORABLE", label: "Fallo desfavorable al cliente" },
];

function DatosJudicialesCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "numeroRol" | "tribunal" | "region" | "resultadoJpl" | "fechaResolucionJpl">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Datos judiciales
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* Número de rol */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">N° Rol</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.numeroRol}
                  onChange={(e) => onChange("numeroRol", e.target.value)}
                  placeholder="—"
                  className={`${editInputClass} placeholder:font-normal placeholder:text-muted-foreground`}
                />
              </dd>
            </div>
          ) : (
            <Field label="N° Rol" value={current.numeroRol || "—"} />
          )}

          {/* Región */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Región</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                {current.tribunal ? (
                  <span className="text-sm text-(--navy-900) truncate max-w-48">
                    {current.region || "—"}
                  </span>
                ) : (
                  <Select
                    value={current.region}
                    onValueChange={(v) => onChange("region", v ?? "")}
                  >
                    <SelectTrigger className="h-8 w-full max-w-48 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                      <span className="flex-1 text-left text-sm truncate">
                        {current.region || <span className="text-muted-foreground text-sm">Sin región</span>}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-sm text-muted-foreground">
                        Sin región
                      </SelectItem>
                      {REGIONES_CHILE.map((r) => (
                        <SelectItem key={r} value={r} className="text-sm">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </dd>
            </div>
          ) : (
            <Field label="Región" value={current.region || "—"} />
          )}

          {/* Tribunal */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Tribunal</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <TribunalCombobox
                  value={current.tribunal}
                  regionFilter={current.region || undefined}
                  onSelect={(nombre, region) => {
                    onChange("tribunal", nombre);
                    onChange("region", region);
                  }}
                  className="w-full max-w-64"
                />
              </dd>
            </div>
          ) : (
            <Field label="Tribunal" value={current.tribunal || "—"} />
          )}

          {/* Resultado JPL */}
          {canEdit ? (
            <div className="py-2.5 border-b border-border space-y-1.5">
              <dt className="text-sm text-(--ink-600)">Resultado JPL</dt>
              <dd>
                <Select
                  value={current.resultadoJpl}
                  onValueChange={(v) => onChange("resultadoJpl", (v ?? "") as ResultadoJPL | "")}
                >
                  <SelectTrigger className="h-8 w-full text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.resultadoJpl
                        ? RESULTADO_JPL_OPTIONS.find((o) => o.value === current.resultadoJpl)?.label
                        : <span className="text-muted-foreground text-sm">Sin resultado</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" className="text-sm text-muted-foreground">Sin resultado</SelectItem>
                    {RESULTADO_JPL_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : current.resultadoJpl ? (
            <Field
              label="Resultado JPL"
              value={RESULTADO_JPL_OPTIONS.find((o) => o.value === current.resultadoJpl)?.label ?? current.resultadoJpl}
            />
          ) : null}

          {/* Fecha resolución JPL */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha resolución JPL</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaResolucionJpl || undefined}
                  onChange={(v) => onChange("fechaResolucionJpl", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaResolucionJpl ? (
            <Field label="Fecha resolución JPL" value={<span className="tabular-nums">{formatDate(current.fechaResolucionJpl)}</span>} />
          ) : null}
        </dl>
      </CardContent>
    </Card>
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

  // ── Editable state — lifted so both cards share one save bar ──────────────
  const casoMutation = useActualizarCaso(data?.caso.id ?? "");
  const clienteMutation = useActualizarCliente(data?.cliente.id ?? "");

  const casoOriginal = useMemo<CasoEditState>(
    () => ({
      abogadoId: data?.caso.abogadoId ?? "",
      numeroOt: data?.caso.numeroOt ?? "",
      estadoDenuncia: data?.caso.estadoDenuncia ?? "SOLICITADA",
      fechaDenuncia: data?.caso.fechaDenuncia ?? "",
      fechaDj: data?.caso.fechaDj ?? "",
      numeroRol: data?.caso.numeroRol ?? "",
      tribunal: data?.caso.tribunal ?? "",
      region: data?.caso.region ?? "",
      resultadoJpl: data?.caso.resultadoJpl ?? "",
      fechaResolucionJpl: data?.caso.fechaResolucionJpl ?? "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.caso.abogadoId, data?.caso.numeroOt, data?.caso.estadoDenuncia, data?.caso.fechaDenuncia, data?.caso.fechaDj, data?.caso.numeroRol, data?.caso.tribunal, data?.caso.region, data?.caso.resultadoJpl, data?.caso.fechaResolucionJpl]
  );

  const clienteOriginal = useMemo<ClienteEditState>(
    () => ({
      nombre: data?.cliente.nombre ?? "",
      contacto: data?.cliente.contacto ?? "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.cliente.nombre, data?.cliente.contacto]
  );

  const [casoEdit, setCasoEdit] = useState<CasoEditState>(casoOriginal);
  const [clienteEdit, setClienteEdit] = useState<ClienteEditState>(clienteOriginal);

  // Sync when server data updates after save
  useEffect(() => { setCasoEdit(casoOriginal); }, [casoOriginal]);
  useEffect(() => { setClienteEdit(clienteOriginal); }, [clienteOriginal]);

  function onCasoChange<K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) {
    setCasoEdit((prev) => ({ ...prev, [key]: value }));
  }
  function onClienteChange(key: keyof ClienteEditState, value: string) {
    setClienteEdit((prev) => ({ ...prev, [key]: value }));
  }

  const casoIsDirty =
    casoEdit.abogadoId !== casoOriginal.abogadoId ||
    casoEdit.numeroOt !== casoOriginal.numeroOt ||
    casoEdit.estadoDenuncia !== casoOriginal.estadoDenuncia ||
    casoEdit.fechaDenuncia !== casoOriginal.fechaDenuncia ||
    casoEdit.fechaDj !== casoOriginal.fechaDj ||
    casoEdit.numeroRol !== casoOriginal.numeroRol ||
    casoEdit.tribunal !== casoOriginal.tribunal ||
    casoEdit.region !== casoOriginal.region ||
    casoEdit.resultadoJpl !== casoOriginal.resultadoJpl ||
    casoEdit.fechaResolucionJpl !== casoOriginal.fechaResolucionJpl;

  const clienteIsDirty =
    clienteEdit.nombre !== clienteOriginal.nombre ||
    clienteEdit.contacto !== clienteOriginal.contacto;

  const isDirty = casoIsDirty || clienteIsDirty;
  const isSaving = casoMutation.isPending || clienteMutation.isPending;

  function handleSaveAll() {
    if (casoIsDirty) {
      const patch: Parameters<typeof casoMutation.mutate>[0] = {};
      if (casoEdit.abogadoId !== casoOriginal.abogadoId)
        patch.abogadoId = casoEdit.abogadoId || undefined;
      if (casoEdit.numeroOt !== casoOriginal.numeroOt)
        patch.numeroOt = casoEdit.numeroOt.trim() || undefined;
      if (casoEdit.estadoDenuncia !== casoOriginal.estadoDenuncia)
        patch.estadoDenuncia = casoEdit.estadoDenuncia;
      if (casoEdit.fechaDenuncia !== casoOriginal.fechaDenuncia)
        patch.fechaDenuncia = casoEdit.fechaDenuncia;
      if (casoEdit.fechaDj !== casoOriginal.fechaDj)
        patch.fechaDj = casoEdit.fechaDj;
      if (casoEdit.numeroRol !== casoOriginal.numeroRol)
        patch.numeroRol = casoEdit.numeroRol.trim() || undefined;
      if (casoEdit.tribunal !== casoOriginal.tribunal)
        patch.tribunal = casoEdit.tribunal.trim() || undefined;
      if (casoEdit.region !== casoOriginal.region)
        patch.region = casoEdit.region || undefined;
      if (casoEdit.resultadoJpl !== casoOriginal.resultadoJpl)
        patch.resultadoJpl = casoEdit.resultadoJpl || undefined;
      if (casoEdit.fechaResolucionJpl !== casoOriginal.fechaResolucionJpl)
        patch.fechaResolucionJpl = casoEdit.fechaResolucionJpl || undefined;
      casoMutation.mutate(patch);
    }
    if (clienteIsDirty) {
      const patch: { nombre?: string; contacto?: string | null } = {};
      if (clienteEdit.nombre !== clienteOriginal.nombre)
        patch.nombre = clienteEdit.nombre.trim() || clienteOriginal.nombre;
      if (clienteEdit.contacto !== clienteOriginal.contacto)
        patch.contacto = clienteEdit.contacto.trim() || null;
      clienteMutation.mutate(patch);
    }
  }

  function handleDiscardAll() {
    setCasoEdit(casoOriginal);
    setClienteEdit(clienteOriginal);
  }

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
  const rol = me?.usuario.rol;
  const isAdmin = rol === "ADMIN";
  const canDelete = isAdmin;
  const canTransition = rol === "ADMIN" || rol === "ABOGADO";
  const canEditCaseFields = rol === "ADMIN" || rol === "ABOGADO";

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
              {eliminar.isPending && <Loader2 className="size-3.5 animate-spin" />}
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
          {totalCLP > 0 && (
            <p className="mt-1 text-sm font-semibold tabular-nums text-(--navy-900)">
              {formatMontoCLP(totalCLP)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {caso.numeroOt && (
            <span className="font-display text-sm font-semibold text-(--amber-500) tabular-nums">
              {caso.numeroOt}
            </span>
          )}
          <EstadoBadge estado={caso.estado} />
          {canTransition && (
            <TransicionarEstadoDialog
              casoId={caso.id}
              estadoActual={caso.estado}
              resultadoJpl={caso.resultadoJpl}
            />
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive gap-1.5"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Cards de detalle */}
      <div className="grid gap-4 md:grid-cols-2">
        <CasoEditCard caso={caso} current={casoEdit} onChange={onCasoChange} canEditCaseFields={canEditCaseFields} />
        <ClienteEditCard cliente={cliente} current={clienteEdit} onChange={onClienteChange} />
      </div>

      {/* Datos judiciales */}
      <DatosJudicialesCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />

      {/* Flujo del caso */}
      <CasoFlowView casoId={id} />

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

      {/* Single save bar for both editable cards */}
      {isDirty && (
        <UnsavedChangesBar
          onSave={handleSaveAll}
          onDiscard={handleDiscardAll}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
