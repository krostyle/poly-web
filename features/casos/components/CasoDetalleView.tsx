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
import type {
  HistorialEntry, Estado, EstadoDenuncia, Caso, Cliente,
  ResultadoJPL, ResultadoSentencia, AdmisibilidadDemanda,
  ResultadoReposicion, ResultadoAudiencia, Dolo, TipoArtefacto,
} from "@/lib/api/types";

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
            <>en estado <EstadoBadge estado={d.estado as Estado} /></>
          )}
        </span>
      );
    case "ESTADO_CAMBIADO":
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <EstadoBadge estado={d.anterior as Estado} />
          <ArrowRight className="size-3.5 shrink-0 text-(--ink-600)" />
          <EstadoBadge estado={d.nuevo as Estado} />
          {d.forzado && <span className="text-xs text-amber-600">(corrección manual)</span>}
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
        abogado:                       "Abogado",
        numero_ot:                     "N° OT",
        estado_denuncia:               "Denuncia banco",
        fecha_denuncia:                "Fecha denuncia",
        fecha_dj:                      "Fecha DJ",
        monto_reclamado:               "Monto reclamado",
        dolo:                          "Dolo",
        tipo_artefacto:                "Tipo artefacto",
        rol_mp:                        "N° Rol MP",
        tribunal:                      "Tribunal",
        region:                        "Región",
        resultado_jpl:                 "Resultado JPL",
        fecha_resolucion_jpl:          "Fecha resolución JPL",
        fecha_medida_precautoria:      "Fecha MP",
        abono:                         "Abono",
        monto_abono:                   "Monto abono",
        rol_demanda:                   "N° Rol demanda",
        fecha_demanda:                 "Fecha demanda",
        admisibilidad_demanda:         "Admisibilidad demanda",
        reposicion_interpuesta:        "Reposición interpuesta",
        resultado_reposicion:          "Resultado reposición",
        fecha_notificacion_demanda:    "Fecha notificación demanda",
        fecha_audiencia:               "Fecha audiencia",
        resultado_audiencia:           "Resultado audiencia",
        fecha_sentencia:               "Fecha sentencia",
        resultado_sentencia:           "Resultado sentencia",
        sentencia_apelada:             "Apelada",
        sentencia_ejecutoriada:        "Ejecutoriada",
        rol_segunda_instancia:         "Rol segunda instancia",
        corte_apelaciones:             "Corte de apelaciones",
        fecha_fallo_corte:             "Fecha fallo corte",
        resultado_segunda_instancia:   "Resultado segunda instancia",
        segunda_instancia_ejecutoriada: "Segunda instancia ejecutoriada",
      };
      const DENUNCIA_LABELS: Record<string, string> = {
        SOLICITADA: "Solicitada", VALIDA: "Válida", INVALIDA: "Inválida", SIN_DENUNCIA: "Sin denuncia",
      };
      const items = cambios
        ? Object.entries(cambios).map(([k, v]) => {
            const label = CAMPO_LABELS[k] ?? k;
            if (v === null || v === "") return `${label} eliminado`;
            if (k === "estado_denuncia") return `${label} → ${DENUNCIA_LABELS[v] ?? v}`;
            if (k === "abogado") return label;
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

function UnsavedChangesBar({ onSave, onDiscard, isSaving }: {
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
        <Button variant="outline" size="sm" onClick={onDiscard} disabled={isSaving}>Descartar</Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving && <Loader2 className="size-3.5 animate-spin" />}
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

// ── Edit state ─────────────────────────────────────────────────────────────────

const ESTADO_DENUNCIA_LABELS: Record<EstadoDenuncia, string> = {
  SOLICITADA:   "Solicitada",
  VALIDA:       "Válida",
  INVALIDA:     "Inválida",
  SIN_DENUNCIA: "Sin denuncia",
};

const TIPO_ARTEFACTO_OPTIONS: { value: TipoArtefacto; label: string }[] = [
  { value: "CUENTA_CORRIENTE", label: "Cuenta corriente" },
  { value: "CUENTA_VISTA",     label: "Cuenta vista / RUT" },
  { value: "TARJETA_CREDITO",  label: "Tarjeta de crédito" },
  { value: "TARJETA_DEBITO",   label: "Tarjeta de débito" },
  { value: "LINEA_CREDITO",    label: "Línea de crédito" },
  { value: "CUENTA_AHORRO",    label: "Cuenta de ahorro" },
  { value: "OTRO",             label: "Otro" },
];

const RESULTADO_JPL_OPTIONS: { value: ResultadoJPL; label: string }[] = [
  { value: "ACEPTA_SUSPENSION",  label: "Acepta suspensión — continúa vía judicial" },
  { value: "RECHAZA_SUSPENSION", label: "Rechaza suspensión — banco devuelve el monto" },
];

const RESULTADO_SENTENCIA_OPTIONS: { value: ResultadoSentencia; label: string }[] = [
  { value: "FAVORABLE_BANCO",   label: "Favorable al banco" },
  { value: "FAVORABLE_CLIENTE", label: "Favorable al cliente" },
  { value: "PARCIAL",           label: "Parcial" },
];

const REGIONES_CHILE = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
  "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
] as const;

interface CasoEditState {
  // Caso card
  abogadoId: string;
  numeroOt: string;
  estadoDenuncia: EstadoDenuncia;
  fechaDenuncia: string;
  fechaDj: string;
  montoReclamado: string;
  dolo: Dolo | "";
  tipoArtefacto: TipoArtefacto | "";
  // MP card
  rolMp: string;
  region: string;
  tribunal: string;
  fechaMedidaPrecautoria: string;
  fechaResolucionJpl: string;
  resultadoJpl: ResultadoJPL | "";
  abono: boolean;
  montoAbono: string;
  // Demanda card
  rolDemanda: string;
  fechaDemanda: string;
  admisibilidadDemanda: AdmisibilidadDemanda | "";
  reposicionInterpuesta: boolean;
  resultadoReposicion: ResultadoReposicion | "";
  fechaNotificacionDemanda: string;
  // Audiencia card
  fechaAudiencia: string;
  resultadoAudiencia: ResultadoAudiencia | "";
  // Sentencia card
  fechaSentencia: string;
  resultadoSentencia: ResultadoSentencia | "";
  sentenciaApelada: boolean;
  sentenciaEjecutoriada: boolean;
  // Segunda instancia card
  rolSegundaInstancia: string;
  corteApelaciones: string;
  fechaFalloCorte: string;
  resultadoSegundaInstancia: ResultadoSentencia | "";
  segundaInstanciaEjecutoriada: boolean;
}

interface ClienteEditState {
  nombre: string;
  contacto: string;
}

const editInputClass =
  "w-full rounded border border-border/60 bg-(--slate-100)/60 px-2 py-1 text-right text-sm font-medium text-(--navy-900) outline-none hover:border-input focus:border-input focus:bg-(--slate-100)";

// ── Bool select helper ─────────────────────────────────────────────────────────

function BoolSelect({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Select
      value={value ? "true" : "false"}
      onValueChange={(v) => onChange(v === "true")}
    >
      <SelectTrigger className="h-8 w-full max-w-24 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
        <span className="flex-1 text-left text-sm">{value ? "Sí" : "No"}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="false" className="text-sm">No</SelectItem>
        <SelectItem value="true" className="text-sm">Sí</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ── Caso card ─────────────────────────────────────────────────────────────────

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
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Caso</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* Abogado */}
          {canEditCaseFields ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Abogado</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select value={current.abogadoId} onValueChange={(v) => onChange("abogadoId", v ?? "")}>
                  <SelectTrigger className="h-8 w-full max-w-48 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.abogadoId ? abogadoNombre : <span className="text-muted-foreground text-sm">Sin asignar</span>}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" className="text-sm text-muted-foreground">Sin asignar</SelectItem>
                    {(usuarios ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-sm">{u.nombre}</SelectItem>
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
              value={current.numeroOt ? <span className="font-display font-semibold text-(--amber-500)">{current.numeroOt}</span> : "—"}
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
                    <span className="flex-1 text-left text-sm truncate">{ESTADO_DENUNCIA_LABELS[current.estadoDenuncia]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {(["SOLICITADA", "VALIDA", "INVALIDA", "SIN_DENUNCIA"] as EstadoDenuncia[]).map((v) => (
                      <SelectItem key={v} value={v} className="text-sm">{ESTADO_DENUNCIA_LABELS[v]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : (
            <Field label="Denuncia banco" value={ESTADO_DENUNCIA_LABELS[current.estadoDenuncia]} />
          )}

          {/* Fecha DJ */}
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Fecha DJ <span className="text-destructive">*</span></dt>
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

          {/* Fecha denuncia */}
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

          {/* Monto reclamado */}
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Monto reclamado</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <input
                type="number"
                min={0}
                value={current.montoReclamado}
                onChange={(e) => onChange("montoReclamado", e.target.value)}
                placeholder="—"
                className={`${editInputClass} max-w-40 placeholder:font-normal placeholder:text-muted-foreground`}
              />
            </dd>
          </div>

          {/* Tipo artefacto */}
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Artefacto afectado</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <Select
                value={current.tipoArtefacto || "__none__"}
                onValueChange={(v) => onChange("tipoArtefacto", (v === "__none__" ? "" : v) as TipoArtefacto | "")}
              >
                <SelectTrigger className="h-8 w-full max-w-48 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                  <span className="flex-1 text-left text-sm truncate">
                    {current.tipoArtefacto
                      ? TIPO_ARTEFACTO_OPTIONS.find((o) => o.value === current.tipoArtefacto)?.label
                      : <span className="text-muted-foreground text-sm">Sin especificar</span>
                    }
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin especificar</SelectItem>
                  {TIPO_ARTEFACTO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </dd>
          </div>

          {/* Dolo — solo ADMIN/ABOGADO */}
          {canEditCaseFields && (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Dolo (Art. 2 Ley 20.009)</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.dolo || "__none__"}
                  onValueChange={(v) => onChange("dolo", (v === "__none__" ? "" : v) as Dolo | "")}
                >
                  <SelectTrigger className="h-8 w-full max-w-56 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.dolo === "DOLO"
                        ? "Dolo del cliente"
                        : current.dolo === "CULPA_GRAVE"
                        ? "Culpa grave del cliente"
                        : <span className="text-muted-foreground text-sm">No aplica</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">No aplica</SelectItem>
                    <SelectItem value="DOLO" className="text-sm">Dolo del cliente</SelectItem>
                    <SelectItem value="CULPA_GRAVE" className="text-sm">Culpa grave del cliente</SelectItem>
                  </SelectContent>
                </Select>
              </dd>
            </div>
          )}
          {!canEditCaseFields && current.dolo && (
            <Field
              label="Dolo (Art. 2 Ley 20.009)"
              value={current.dolo === "DOLO" ? "Dolo del cliente" : "Culpa grave del cliente"}
            />
          )}

          {caso.motivoTermino && <Field label="Motivo término" value={caso.motivoTermino} />}
          <Field label="Registrado" value={<span className="tabular-nums">{formatDate(caso.createdAt)}</span>} />
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Cliente card ───────────────────────────────────────────────────────────────

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
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Cliente</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Nombre</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              <input type="text" value={current.nombre} onChange={(e) => onChange("nombre", e.target.value)} className={editInputClass} />
            </dd>
          </div>
          <Field label="RUT" value={<span className="tabular-nums">{cliente.rut}</span>} />
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

// ── Medida Precautoria card ────────────────────────────────────────────────────

function DatosMPCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "rolMp" | "region" | "tribunal" | "fechaMedidaPrecautoria" | "fechaResolucionJpl" | "resultadoJpl" | "abono" | "montoAbono">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Medida precautoria
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* N° Rol MP */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">N° Rol MP</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.rolMp}
                  onChange={(e) => onChange("rolMp", e.target.value)}
                  placeholder="—"
                  className={`${editInputClass} max-w-35 placeholder:font-normal placeholder:text-muted-foreground`}
                />
              </dd>
            </div>
          ) : (
            <Field label="N° Rol MP" value={current.rolMp || "—"} />
          )}

          {/* Región */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Región</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.region || "__none__"}
                  onValueChange={(v) => onChange("region", v === "__none__" ? "" : (v ?? ""))}
                >
                  <SelectTrigger className="h-8 w-full max-w-48 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.region || <span className="text-muted-foreground text-sm">Sin región</span>}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin región</SelectItem>
                    {REGIONES_CHILE.map((r) => (
                      <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onSelect={(nombre, region) => { onChange("tribunal", nombre); onChange("region", region); }}
                  onClear={() => { onChange("tribunal", ""); onChange("region", ""); }}
                  className="w-full max-w-64"
                />
              </dd>
            </div>
          ) : (
            <Field label="Tribunal" value={current.tribunal || "—"} />
          )}

          {/* Fecha MP */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha presentación MP</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaMedidaPrecautoria || undefined}
                  onChange={(v) => onChange("fechaMedidaPrecautoria", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaMedidaPrecautoria ? (
            <Field label="Fecha presentación MP" value={<span className="tabular-nums">{formatDate(current.fechaMedidaPrecautoria)}</span>} />
          ) : null}

          {/* Fecha resolución JPL */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
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

          {/* Resultado JPL */}
          {canEdit ? (
            <div className="py-2.5 border-b border-border space-y-1.5">
              <dt className="text-sm text-(--ink-600)">Resultado JPL</dt>
              <dd>
                <Select
                  value={current.resultadoJpl || "__none__"}
                  onValueChange={(v) => onChange("resultadoJpl", (v === "__none__" ? "" : v) as ResultadoJPL | "")}
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
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin resultado</SelectItem>
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

          {/* Abono — solo si JPL rechaza */}
          {(canEdit || current.abono) && (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Abono al cliente</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                {canEdit
                  ? <BoolSelect value={current.abono} onChange={(v) => onChange("abono", v)} />
                  : <span className="text-sm font-medium">{current.abono ? "Sí" : "No"}</span>
                }
              </dd>
            </div>
          )}

          {/* Monto abono */}
          {current.abono && (
            canEdit ? (
              <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <dt className="text-sm text-(--ink-600) shrink-0">Monto abono</dt>
                <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                  <input
                    type="number"
                    min={0}
                    value={current.montoAbono}
                    onChange={(e) => onChange("montoAbono", e.target.value)}
                    placeholder="—"
                    className={`${editInputClass} max-w-40 placeholder:font-normal placeholder:text-muted-foreground`}
                  />
                </dd>
              </div>
            ) : current.montoAbono ? (
              <Field label="Monto abono" value={<span className="tabular-nums">{formatMontoCLP(Number(current.montoAbono))}</span>} />
            ) : null
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Demanda card ───────────────────────────────────────────────────────────────

function DatosJudicialCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "rolDemanda" | "fechaDemanda" | "admisibilidadDemanda" | "reposicionInterpuesta" | "resultadoReposicion" | "fechaNotificacionDemanda">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Demanda
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* N° Rol demanda */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">N° Rol demanda</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.rolDemanda}
                  onChange={(e) => onChange("rolDemanda", e.target.value)}
                  placeholder="—"
                  className={`${editInputClass} max-w-35 placeholder:font-normal placeholder:text-muted-foreground`}
                />
              </dd>
            </div>
          ) : (
            <Field label="N° Rol demanda" value={current.rolDemanda || "—"} />
          )}

          {/* Fecha demanda */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha demanda</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaDemanda || undefined}
                  onChange={(v) => onChange("fechaDemanda", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaDemanda ? (
            <Field label="Fecha demanda" value={<span className="tabular-nums">{formatDate(current.fechaDemanda)}</span>} />
          ) : null}

          {/* Admisibilidad */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Admisibilidad</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <Select
                  value={current.admisibilidadDemanda || "__none__"}
                  onValueChange={(v) => onChange("admisibilidadDemanda", (v === "__none__" ? "" : v) as AdmisibilidadDemanda | "")}
                >
                  <SelectTrigger className="h-8 w-full max-w-40 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.admisibilidadDemanda === "ADMISIBLE"
                        ? "Admisible"
                        : current.admisibilidadDemanda === "NO_ADMISIBLE"
                        ? "No admisible"
                        : <span className="text-muted-foreground text-sm">Sin resolución</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin resolución</SelectItem>
                    <SelectItem value="ADMISIBLE" className="text-sm">Admisible</SelectItem>
                    <SelectItem value="NO_ADMISIBLE" className="text-sm">No admisible</SelectItem>
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : current.admisibilidadDemanda ? (
            <Field
              label="Admisibilidad"
              value={current.admisibilidadDemanda === "ADMISIBLE" ? "Admisible" : "No admisible"}
            />
          ) : null}

          {/* Reposición — solo si no admisible */}
          {current.admisibilidadDemanda === "NO_ADMISIBLE" && (
            <>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <dt className="text-sm text-(--ink-600) shrink-0">Reposición interpuesta</dt>
                <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                  {canEdit
                    ? <BoolSelect value={current.reposicionInterpuesta} onChange={(v) => onChange("reposicionInterpuesta", v)} />
                    : <span className="text-sm font-medium">{current.reposicionInterpuesta ? "Sí" : "No"}</span>
                  }
                </dd>
              </div>

              {current.reposicionInterpuesta && (
                canEdit ? (
                  <div className="flex items-center justify-between py-2.5 border-b border-border">
                    <dt className="text-sm text-(--ink-600) shrink-0">Resultado reposición</dt>
                    <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                      <Select
                        value={current.resultadoReposicion || "__none__"}
                        onValueChange={(v) => onChange("resultadoReposicion", (v === "__none__" ? "" : v) as ResultadoReposicion | "")}
                      >
                        <SelectTrigger className="h-8 w-full max-w-36 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                          <span className="flex-1 text-left text-sm truncate">
                            {current.resultadoReposicion === "ACOGE"
                              ? "Se acoge"
                              : current.resultadoReposicion === "RECHAZA"
                              ? "Se rechaza"
                              : <span className="text-muted-foreground text-sm">Pendiente</span>
                            }
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" className="text-sm text-muted-foreground">Pendiente</SelectItem>
                          <SelectItem value="ACOGE" className="text-sm">Se acoge</SelectItem>
                          <SelectItem value="RECHAZA" className="text-sm">Se rechaza</SelectItem>
                        </SelectContent>
                      </Select>
                    </dd>
                  </div>
                ) : current.resultadoReposicion ? (
                  <Field
                    label="Resultado reposición"
                    value={current.resultadoReposicion === "ACOGE" ? "Se acoge" : "Se rechaza"}
                  />
                ) : null
              )}
            </>
          )}

          {/* Fecha notificación demanda */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha notificación demanda</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaNotificacionDemanda || undefined}
                  onChange={(v) => onChange("fechaNotificacionDemanda", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaNotificacionDemanda ? (
            <Field label="Fecha notificación demanda" value={<span className="tabular-nums">{formatDate(current.fechaNotificacionDemanda)}</span>} />
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Audiencia card ─────────────────────────────────────────────────────────────

function AudienciaCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "fechaAudiencia" | "resultadoAudiencia">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Audiencia</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {/* Fecha audiencia */}
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha audiencia</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaAudiencia || undefined}
                  onChange={(v) => onChange("fechaAudiencia", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaAudiencia ? (
            <Field label="Fecha audiencia" value={<span className="tabular-nums">{formatDate(current.fechaAudiencia)}</span>} />
          ) : null}

          {/* Resultado audiencia */}
          {canEdit ? (
            <div className="py-2.5 border-b border-border last:border-0 space-y-1.5">
              <dt className="text-sm text-(--ink-600)">Resultado audiencia</dt>
              <dd>
                <Select
                  value={current.resultadoAudiencia || "__none__"}
                  onValueChange={(v) => onChange("resultadoAudiencia", (v === "__none__" ? "" : v) as ResultadoAudiencia | "")}
                >
                  <SelectTrigger className="h-8 w-full text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.resultadoAudiencia === "TERMINO"
                        ? "Término"
                        : current.resultadoAudiencia === "AVENIMIENTO"
                        ? "Avenimiento"
                        : current.resultadoAudiencia === "AUTO_PARA_FALLO"
                        ? "Auto para fallos — pendiente sentencia"
                        : <span className="text-muted-foreground text-sm">Sin resultado</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin resultado</SelectItem>
                    <SelectItem value="TERMINO" className="text-sm">Término</SelectItem>
                    <SelectItem value="AVENIMIENTO" className="text-sm">Avenimiento</SelectItem>
                    <SelectItem value="AUTO_PARA_FALLO" className="text-sm">Auto para fallos — pendiente sentencia</SelectItem>
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : current.resultadoAudiencia ? (
            <Field
              label="Resultado audiencia"
              value={
                current.resultadoAudiencia === "TERMINO" ? "Término"
                : current.resultadoAudiencia === "AVENIMIENTO" ? "Avenimiento"
                : "Auto para fallos — pendiente sentencia"
              }
            />
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Sentencia card ─────────────────────────────────────────────────────────────

function SentenciaCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "fechaSentencia" | "resultadoSentencia" | "sentenciaApelada" | "sentenciaEjecutoriada">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Sentencia</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha sentencia</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaSentencia || undefined}
                  onChange={(v) => onChange("fechaSentencia", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaSentencia ? (
            <Field label="Fecha sentencia" value={<span className="tabular-nums">{formatDate(current.fechaSentencia)}</span>} />
          ) : null}

          {canEdit ? (
            <div className="py-2.5 border-b border-border space-y-1.5">
              <dt className="text-sm text-(--ink-600)">Resultado sentencia</dt>
              <dd>
                <Select
                  value={current.resultadoSentencia || "__none__"}
                  onValueChange={(v) => onChange("resultadoSentencia", (v === "__none__" ? "" : v) as ResultadoSentencia | "")}
                >
                  <SelectTrigger className="h-8 w-full text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.resultadoSentencia
                        ? RESULTADO_SENTENCIA_OPTIONS.find((o) => o.value === current.resultadoSentencia)?.label
                        : <span className="text-muted-foreground text-sm">Sin resultado</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin resultado</SelectItem>
                    {RESULTADO_SENTENCIA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : current.resultadoSentencia ? (
            <Field
              label="Resultado sentencia"
              value={RESULTADO_SENTENCIA_OPTIONS.find((o) => o.value === current.resultadoSentencia)?.label ?? current.resultadoSentencia}
            />
          ) : null}

          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <dt className="text-sm text-(--ink-600) shrink-0">Apelada</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              {canEdit
                ? <BoolSelect value={current.sentenciaApelada} onChange={(v) => onChange("sentenciaApelada", v)} />
                : <span className="text-sm font-medium">{current.sentenciaApelada ? "Sí" : "No"}</span>
              }
            </dd>
          </div>

          {!current.sentenciaApelada && (
            <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <dt className="text-sm text-(--ink-600) shrink-0">Ejecutoriada</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                {canEdit
                  ? <BoolSelect value={current.sentenciaEjecutoriada} onChange={(v) => onChange("sentenciaEjecutoriada", v)} />
                  : <span className="text-sm font-medium">{current.sentenciaEjecutoriada ? "Sí" : "No"}</span>
                }
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Apelación card ─────────────────────────────────────────────────────────────

function ApelacionCard({
  current,
  onChange,
  canEdit,
}: {
  current: Pick<CasoEditState, "rolSegundaInstancia" | "corteApelaciones" | "fechaFalloCorte" | "resultadoSegundaInstancia" | "segundaInstanciaEjecutoriada">;
  onChange: <K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Segunda instancia (apelación)</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl>
          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Rol segunda instancia</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.rolSegundaInstancia}
                  onChange={(e) => onChange("rolSegundaInstancia", e.target.value)}
                  placeholder="—"
                  className={`${editInputClass} max-w-35 placeholder:font-normal placeholder:text-muted-foreground`}
                />
              </dd>
            </div>
          ) : (
            <Field label="Rol segunda instancia" value={current.rolSegundaInstancia || "—"} />
          )}

          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Corte de apelaciones</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <input
                  type="text"
                  value={current.corteApelaciones}
                  onChange={(e) => onChange("corteApelaciones", e.target.value)}
                  placeholder="—"
                  className={`${editInputClass} placeholder:font-normal placeholder:text-muted-foreground`}
                />
              </dd>
            </div>
          ) : (
            <Field label="Corte de apelaciones" value={current.corteApelaciones || "—"} />
          )}

          {canEdit ? (
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <dt className="text-sm text-(--ink-600) shrink-0">Fecha fallo corte</dt>
              <dd className="ml-3 min-w-0 flex-1 flex justify-end">
                <DatePicker
                  value={current.fechaFalloCorte || undefined}
                  onChange={(v) => onChange("fechaFalloCorte", v)}
                  placeholder="Sin fecha"
                  toDate={new Date()}
                  className="h-8 w-full max-w-44 text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100)"
                />
              </dd>
            </div>
          ) : current.fechaFalloCorte ? (
            <Field label="Fecha fallo corte" value={<span className="tabular-nums">{formatDate(current.fechaFalloCorte)}</span>} />
          ) : null}

          {canEdit ? (
            <div className="py-2.5 border-b border-border space-y-1.5">
              <dt className="text-sm text-(--ink-600)">Resultado segunda instancia</dt>
              <dd>
                <Select
                  value={current.resultadoSegundaInstancia || "__none__"}
                  onValueChange={(v) => onChange("resultadoSegundaInstancia", (v === "__none__" ? "" : v) as ResultadoSentencia | "")}
                >
                  <SelectTrigger className="h-8 w-full text-sm border-border/60 bg-(--slate-100)/60 hover:border-input hover:bg-(--slate-100) px-2">
                    <span className="flex-1 text-left text-sm truncate">
                      {current.resultadoSegundaInstancia
                        ? RESULTADO_SENTENCIA_OPTIONS.find((o) => o.value === current.resultadoSegundaInstancia)?.label
                        : <span className="text-muted-foreground text-sm">Sin resultado</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-sm text-muted-foreground">Sin resultado</SelectItem>
                    {RESULTADO_SENTENCIA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          ) : current.resultadoSegundaInstancia ? (
            <Field
              label="Resultado segunda instancia"
              value={RESULTADO_SENTENCIA_OPTIONS.find((o) => o.value === current.resultadoSegundaInstancia)?.label ?? current.resultadoSegundaInstancia}
            />
          ) : null}

          <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <dt className="text-sm text-(--ink-600) shrink-0">Ejecutoriada</dt>
            <dd className="ml-3 min-w-0 flex-1 flex justify-end">
              {canEdit
                ? <BoolSelect value={current.segundaInstanciaEjecutoriada} onChange={(v) => onChange("segundaInstanciaEjecutoriada", v)} />
                : <span className="text-sm font-medium">{current.segundaInstanciaEjecutoriada ? "Sí" : "No"}</span>
              }
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

const ESTADO_CON_MP = new Set<Estado>(["PREJUDICIAL", "PAGO_NORMATIVO", "JUDICIAL", "AUDIENCIA", "SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA", "CUMPLIMIENTO", "TERMINADO", "CIERRE"]);
const ESTADO_CON_DEMANDA = new Set<Estado>(["JUDICIAL", "AUDIENCIA", "SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA", "CUMPLIMIENTO", "TERMINADO", "CIERRE"]);
const ESTADO_CON_AUDIENCIA = new Set<Estado>(["AUDIENCIA", "SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA", "CUMPLIMIENTO", "TERMINADO", "CIERRE"]);
const ESTADO_CON_SENTENCIA = new Set<Estado>(["SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA", "CUMPLIMIENTO", "TERMINADO", "CIERRE"]);

export function CasoDetalleView({ id }: CasoDetalleViewProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCaso(id);
  const { data: historial } = useHistorialCaso(id);
  const { data: me } = useMe();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const eliminar = useEliminarCaso(id, () => router.push("/casos"));

  const casoMutation = useActualizarCaso(data?.caso.id ?? "");
  const clienteMutation = useActualizarCliente(data?.cliente.id ?? "");

  const casoOriginal = useMemo<CasoEditState>(
    () => ({
      abogadoId: data?.caso.abogadoId ?? "",
      numeroOt: data?.caso.numeroOt ?? "",
      estadoDenuncia: data?.caso.estadoDenuncia ?? "SOLICITADA",
      fechaDenuncia: data?.caso.fechaDenuncia ?? "",
      fechaDj: data?.caso.fechaDj ?? "",
      montoReclamado: data?.caso.montoReclamado != null ? String(data.caso.montoReclamado) : "",
      dolo: data?.caso.dolo ?? "",
      tipoArtefacto: data?.caso.tipoArtefacto ?? "",
      rolMp: data?.caso.rolMp ?? "",
      region: data?.caso.region ?? "",
      tribunal: data?.caso.tribunal ?? "",
      fechaMedidaPrecautoria: data?.caso.fechaMedidaPrecautoria ?? "",
      fechaResolucionJpl: data?.caso.fechaResolucionJpl ?? "",
      resultadoJpl: data?.caso.resultadoJpl ?? "",
      abono: data?.caso.abono ?? false,
      montoAbono: data?.caso.montoAbono != null ? String(data.caso.montoAbono) : "",
      rolDemanda: data?.caso.rolDemanda ?? "",
      fechaDemanda: data?.caso.fechaDemanda ?? "",
      admisibilidadDemanda: data?.caso.admisibilidadDemanda ?? "",
      reposicionInterpuesta: data?.caso.reposicionInterpuesta ?? false,
      resultadoReposicion: data?.caso.resultadoReposicion ?? "",
      fechaNotificacionDemanda: data?.caso.fechaNotificacionDemanda ?? "",
      fechaAudiencia: data?.caso.fechaAudiencia ?? "",
      resultadoAudiencia: data?.caso.resultadoAudiencia ?? "",
      fechaSentencia: data?.caso.fechaSentencia ?? "",
      resultadoSentencia: data?.caso.resultadoSentencia ?? "",
      sentenciaApelada: data?.caso.sentenciaApelada ?? false,
      sentenciaEjecutoriada: data?.caso.sentenciaEjecutoriada ?? false,
      rolSegundaInstancia: data?.caso.rolSegundaInstancia ?? "",
      corteApelaciones: data?.caso.corteApelaciones ?? "",
      fechaFalloCorte: data?.caso.fechaFalloCorte ?? "",
      resultadoSegundaInstancia: data?.caso.resultadoSegundaInstancia ?? "",
      segundaInstanciaEjecutoriada: data?.caso.segundaInstanciaEjecutoriada ?? false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.caso]
  );

  const clienteOriginal = useMemo<ClienteEditState>(
    () => ({ nombre: data?.cliente.nombre ?? "", contacto: data?.cliente.contacto ?? "" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.cliente.nombre, data?.cliente.contacto]
  );

  const [casoEdit, setCasoEdit] = useState<CasoEditState>(casoOriginal);
  const [clienteEdit, setClienteEdit] = useState<ClienteEditState>(clienteOriginal);

  useEffect(() => { setCasoEdit(casoOriginal); }, [casoOriginal]);
  useEffect(() => { setClienteEdit(clienteOriginal); }, [clienteOriginal]);

  function onCasoChange<K extends keyof CasoEditState>(key: K, value: CasoEditState[K]) {
    setCasoEdit((prev) => ({ ...prev, [key]: value }));
  }
  function onClienteChange(key: keyof ClienteEditState, value: string) {
    setClienteEdit((prev) => ({ ...prev, [key]: value }));
  }

  const casoIsDirty = (Object.keys(casoOriginal) as (keyof CasoEditState)[]).some(
    (k) => casoEdit[k] !== casoOriginal[k]
  );
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
      if (casoEdit.montoReclamado !== casoOriginal.montoReclamado)
        patch.montoReclamado = casoEdit.montoReclamado ? Number(casoEdit.montoReclamado) : 0;
      if (casoEdit.dolo !== casoOriginal.dolo)
        patch.dolo = casoEdit.dolo;
      if (casoEdit.tipoArtefacto !== casoOriginal.tipoArtefacto)
        patch.tipoArtefacto = casoEdit.tipoArtefacto;
      if (casoEdit.rolMp !== casoOriginal.rolMp)
        patch.rolMp = casoEdit.rolMp.trim() || undefined;
      if (casoEdit.tribunal !== casoOriginal.tribunal)
        patch.tribunal = casoEdit.tribunal.trim();
      if (casoEdit.region !== casoOriginal.region)
        patch.region = casoEdit.region;
      if (casoEdit.resultadoJpl !== casoOriginal.resultadoJpl)
        patch.resultadoJpl = casoEdit.resultadoJpl;
      if (casoEdit.fechaResolucionJpl !== casoOriginal.fechaResolucionJpl)
        patch.fechaResolucionJpl = casoEdit.fechaResolucionJpl || undefined;
      if (casoEdit.fechaMedidaPrecautoria !== casoOriginal.fechaMedidaPrecautoria)
        patch.fechaMedidaPrecautoria = casoEdit.fechaMedidaPrecautoria;
      if (casoEdit.abono !== casoOriginal.abono)
        patch.abono = casoEdit.abono;
      if (casoEdit.montoAbono !== casoOriginal.montoAbono)
        patch.montoAbono = casoEdit.montoAbono ? Number(casoEdit.montoAbono) : 0;
      if (casoEdit.rolDemanda !== casoOriginal.rolDemanda)
        patch.rolDemanda = casoEdit.rolDemanda.trim();
      if (casoEdit.fechaDemanda !== casoOriginal.fechaDemanda)
        patch.fechaDemanda = casoEdit.fechaDemanda;
      if (casoEdit.admisibilidadDemanda !== casoOriginal.admisibilidadDemanda)
        patch.admisibilidadDemanda = casoEdit.admisibilidadDemanda;
      if (casoEdit.reposicionInterpuesta !== casoOriginal.reposicionInterpuesta)
        patch.reposicionInterpuesta = casoEdit.reposicionInterpuesta;
      if (casoEdit.resultadoReposicion !== casoOriginal.resultadoReposicion)
        patch.resultadoReposicion = casoEdit.resultadoReposicion;
      if (casoEdit.fechaNotificacionDemanda !== casoOriginal.fechaNotificacionDemanda)
        patch.fechaNotificacionDemanda = casoEdit.fechaNotificacionDemanda;
      if (casoEdit.fechaAudiencia !== casoOriginal.fechaAudiencia)
        patch.fechaAudiencia = casoEdit.fechaAudiencia;
      if (casoEdit.resultadoAudiencia !== casoOriginal.resultadoAudiencia)
        patch.resultadoAudiencia = casoEdit.resultadoAudiencia;
      if (casoEdit.fechaSentencia !== casoOriginal.fechaSentencia)
        patch.fechaSentencia = casoEdit.fechaSentencia;
      if (casoEdit.resultadoSentencia !== casoOriginal.resultadoSentencia)
        patch.resultadoSentencia = casoEdit.resultadoSentencia;
      if (casoEdit.sentenciaApelada !== casoOriginal.sentenciaApelada)
        patch.sentenciaApelada = casoEdit.sentenciaApelada;
      if (casoEdit.sentenciaEjecutoriada !== casoOriginal.sentenciaEjecutoriada)
        patch.sentenciaEjecutoriada = casoEdit.sentenciaEjecutoriada;
      if (casoEdit.rolSegundaInstancia !== casoOriginal.rolSegundaInstancia)
        patch.rolSegundaInstancia = casoEdit.rolSegundaInstancia;
      if (casoEdit.corteApelaciones !== casoOriginal.corteApelaciones)
        patch.corteApelaciones = casoEdit.corteApelaciones;
      if (casoEdit.fechaFalloCorte !== casoOriginal.fechaFalloCorte)
        patch.fechaFalloCorte = casoEdit.fechaFalloCorte;
      if (casoEdit.resultadoSegundaInstancia !== casoOriginal.resultadoSegundaInstancia)
        patch.resultadoSegundaInstancia = casoEdit.resultadoSegundaInstancia;
      if (casoEdit.segundaInstanciaEjecutoriada !== casoOriginal.segundaInstanciaEjecutoriada)
        patch.segundaInstanciaEjecutoriada = casoEdit.segundaInstanciaEjecutoriada;
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
          <p className="mt-0.5 text-xs text-(--ink-600)">Verifica tu conexión e intenta nuevamente.</p>
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

  const showMPCard = ESTADO_CON_MP.has(caso.estado) || !!casoEdit.rolMp || !!casoEdit.fechaMedidaPrecautoria;
  const showDemandaCard = ESTADO_CON_DEMANDA.has(caso.estado) || !!casoEdit.rolDemanda || !!casoEdit.fechaDemanda;
  const showAudienciaCard = ESTADO_CON_AUDIENCIA.has(caso.estado) || !!casoEdit.fechaAudiencia;
  const showSentenciaCard = ESTADO_CON_SENTENCIA.has(caso.estado) || !!casoEdit.fechaSentencia;

  return (
    <div className="space-y-6 pb-20">
      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este caso?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente el caso de <strong>{cliente.nombre}</strong> y todos sus registros.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={eliminar.isPending}>Cancelar</Button>
            <Button variant="destructive" onClick={() => eliminar.mutate()} disabled={eliminar.isPending}>
              {eliminar.isPending && <Loader2 className="size-3.5 animate-spin" />}
              {eliminar.isPending ? "Eliminando…" : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">{cliente.nombre}</h1>
          <p className="mt-0.5 text-sm tabular-nums text-(--ink-600)">{cliente.rut}</p>
          {totalCLP > 0 && (
            <p className="mt-1 text-sm font-semibold tabular-nums text-(--navy-900)">{formatMontoCLP(totalCLP)}</p>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {caso.numeroOt && (
            <span className="font-display text-sm font-semibold text-(--amber-500) tabular-nums">{caso.numeroOt}</span>
          )}
          <EstadoBadge estado={caso.estado} />
          {canTransition && (
            <TransicionarEstadoDialog casoId={caso.id} estadoActual={caso.estado} resultadoJpl={caso.resultadoJpl} />
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

      {/* Caso + Cliente */}
      <div className="grid gap-4 md:grid-cols-2">
        <CasoEditCard caso={caso} current={casoEdit} onChange={onCasoChange} canEditCaseFields={canEditCaseFields} />
        <ClienteEditCard cliente={cliente} current={clienteEdit} onChange={onClienteChange} />
      </div>

      {/* Estado-scoped judicial cards */}
      {showMPCard && (
        <DatosMPCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />
      )}
      {showDemandaCard && (
        <DatosJudicialCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />
      )}
      {showAudienciaCard && (
        <AudienciaCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />
      )}
      {showSentenciaCard && (
        <SentenciaCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />
      )}
      {casoEdit.sentenciaApelada && (
        <ApelacionCard current={casoEdit} onChange={onCasoChange} canEdit={canEditCaseFields} />
      )}

      {/* Flujo */}
      <CasoFlowView casoId={id} />

      {/* Operaciones */}
      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
              Operaciones impugnadas
              {operaciones.length > 0 && (
                <span className="ml-1.5 font-normal normal-case text-muted-foreground">({operaciones.length})</span>
              )}
            </CardTitle>
            {operaciones.length > 0 && (
              <span className="text-sm font-semibold tabular-nums text-(--navy-900)">{formatMontoCLP(totalCLP)}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {operaciones.length === 0 ? (
            <p className="py-4 text-center text-sm text-(--ink-600)">Sin operaciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Medio</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Relación</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) text-right">Monto CLP</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600) text-right">UF</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operaciones.map((op) => (
                    <TableRow key={op.id} className="hover:bg-(--slate-100) transition-colors">
                      <TableCell className="text-sm">{MEDIO_PAGO_LABELS[op.medioPago] ?? op.medioPago}</TableCell>
                      <TableCell className="text-sm text-(--ink-600)">{RELACION_LABELS[op.relacion] ?? op.relacion}</TableCell>
                      <TableCell className="tabular-nums text-right text-sm font-medium text-(--navy-900)">{formatMontoCLP(op.montoCLP)}</TableCell>
                      <TableCell className="tabular-nums text-right text-sm text-(--ink-600)">
                        {op.montoUF != null ? `${op.montoUF.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm text-(--ink-600)">{formatDate(op.fechaOp)}</TableCell>
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
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Auditoría</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <ol className="space-y-3">
              {historial.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm flex-wrap">
                  <span className="shrink-0 text-(--ink-600) tabular-nums text-xs pt-0.5">{formatDateTime(entry.createdAt)}</span>
                  <span className="flex-1 min-w-0"><AuditEntryDescription entry={entry} /></span>
                  <span className="text-xs text-(--ink-600) shrink-0">{entry.usuarioNombre}</span>
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

      {/* Save bar */}
      {isDirty && (
        <UnsavedChangesBar onSave={handleSaveAll} onDiscard={handleDiscardAll} isSaving={isSaving} />
      )}
    </div>
  );
}
