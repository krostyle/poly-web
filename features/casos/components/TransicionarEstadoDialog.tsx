"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ESTADO_LABELS } from "./EstadoBadge";
import type { Estado, EstadoDenuncia, MotivoTermino } from "@/lib/api/types";
import { useTransicionarEstado } from "@/features/casos/hooks/useTransicionarEstado";

// ── Transiciones válidas (mirror del backend) ────────────────────────────────
const TRANSICIONES: Record<Estado, Estado[]> = {
  INGRESO:          ["PREJUDICIAL", "TERMINADO"],
  PREJUDICIAL:      ["PAGO_NORMATIVO", "JUDICIAL", "TERMINADO"],
  PAGO_NORMATIVO:   ["JUDICIAL", "TERMINADO"],
  JUDICIAL:         ["AUDIENCIA", "TERMINADO"],
  AUDIENCIA:        ["SENTENCIA", "TERMINADO"],
  SENTENCIA:        ["APELACION", "CUMPLIMIENTO", "TERMINADO"],
  APELACION:        ["SENTENCIA_SEGUNDA", "TERMINADO"],
  SENTENCIA_SEGUNDA:["CUMPLIMIENTO", "TERMINADO"],
  CUMPLIMIENTO:     ["TERMINADO"],
  TERMINADO:        ["CIERRE"],
  CIERRE:           [],
};

// ── Descripciones de cada estado (ayuda contextual en el dialog) ─────────────
const ESTADO_DESC: Partial<Record<Estado, string>> = {
  PREJUDICIAL:       "Medida precautoria solicitada al tribunal",
  PAGO_NORMATIVO:    "Tribunal acoge MP · ordena restituir abono normativo",
  JUDICIAL:          "Demanda presentada · plazo 10 días hábiles desde notificación",
  AUDIENCIA:         "Audiencia fijada en tribunal",
  SENTENCIA:         "Tribunal dicta sentencia de primera instancia",
  APELACION:         "Recurso de apelación interpuesto",
  SENTENCIA_SEGUNDA: "Sentencia de segunda instancia",
  CUMPLIMIENTO:      "Fase de cumplimiento de la sentencia",
  TERMINADO:         "Caso terminado por motivo específico",
  CIERRE:            "Cierre administrativo — no más gestiones",
};

// ── Grupos visuales para el modo corrección ──────────────────────────────────
const FASES = [
  { label: "Ingreso",     estados: ["INGRESO"] as Estado[] },
  { label: "Prejudicial", estados: ["PREJUDICIAL", "PAGO_NORMATIVO"] as Estado[] },
  { label: "Judicial",    estados: ["JUDICIAL", "AUDIENCIA", "SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA", "CUMPLIMIENTO"] as Estado[] },
  { label: "Término",     estados: ["TERMINADO", "CIERRE"] as Estado[] },
];

// ── Motivos de término ───────────────────────────────────────────────────────
const MOTIVOS: { value: MotivoTermino; label: string }[] = [
  { value: "IMPROCEDENTE",                   label: "Improcedente" },
  { value: "EXTEMPORANEO",                   label: "Extemporáneo" },
  { value: "BUSQUEDAS_NEGATIVAS",            label: "Búsquedas negativas" },
  { value: "DEUDOR_FALLECIDO",               label: "Deudor fallecido" },
  { value: "DESISTIMIENTO_CLIENTE",          label: "Desistimiento del cliente" },
  { value: "DESISTIMIENTO_BANCO",            label: "Desistimiento del banco" },
  { value: "DESISTIMIENTO_DENUNCIA_INVALIDA",label: "Desistimiento por denuncia inválida" },
  { value: "DESISTIMIENTO_SIN_DENUNCIA",     label: "Desistimiento sin denuncia" },
  { value: "SENTENCIA_FAVORABLE_BANCO",      label: "Sentencia favorable al banco" },
  { value: "SENTENCIA_DESFAVORABLE_BANCO",   label: "Sentencia desfavorable al banco" },
  { value: "AVENIMIENTO",                    label: "Avenimiento" },
  { value: "ABANDONO_PROCEDIMIENTO",         label: "Abandono de procedimiento" },
];

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  casoId: string;
  estadoActual: Estado;
  estadoDenuncia: EstadoDenuncia;
}

// ── Componente ───────────────────────────────────────────────────────────────
export function TransicionarEstadoDialog({ casoId, estadoActual, estadoDenuncia }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [motivoTermino, setMotivoTermino] = useState<MotivoTermino | "">("");
  const [modoCorreccion, setModoCorreccion] = useState(false);
  const { mutate, isPending, error } = useTransicionarEstado(casoId);

  const siguientesBase = TRANSICIONES[estadoActual] ?? [];

  // Build options with optional block reason (shown disabled + explanation)
  type Opcion = { estado: Estado; bloqueado?: string };
  const opciones: Opcion[] = modoCorreccion
    ? (Object.keys(TRANSICIONES) as Estado[])
        .filter((e) => e !== estadoActual)
        .map((e) => ({ estado: e }))
    : siguientesBase.map((e) => {
        // PREJUDICIAL → PAGO_NORMATIVO: only if bank rejected denuncia
        if (estadoActual === "PREJUDICIAL" && e === "PAGO_NORMATIVO" && estadoDenuncia !== "RECHAZADA")
          return { estado: e, bloqueado: "El banco debe haber rechazado la denuncia para tomar esta vía." };
        // PREJUDICIAL → JUDICIAL: only if bank accepted denuncia
        if (estadoActual === "PREJUDICIAL" && e === "JUDICIAL" && estadoDenuncia !== "ACOGIDA")
          return { estado: e, bloqueado: "El banco debe haber acogido la denuncia para continuar directamente a Judicial." };
        return { estado: e };
      });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEstado) return;
    if (selectedEstado === "TERMINADO" && !motivoTermino) return;
    mutate(
      {
        estado: selectedEstado,
        motivoTermino: selectedEstado === "TERMINADO" ? motivoTermino : undefined,
        forzar: modoCorreccion,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      }
    );
  }

  function resetForm() {
    setSelectedEstado(null);
    setMotivoTermino("");
    setModoCorreccion(false);
  }

  function handleOpenChange(val: boolean) {
    if (!val) resetForm();
    setOpen(val);
  }

  const hasSiguientes = siguientesBase.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" disabled={!hasSiguientes && !modoCorreccion} />}>
        Cambiar estado
      </DialogTrigger>

      {/* p-0 + flex col + max-h so header/footer stay fixed and only the list scrolls */}
      <DialogContent className="max-w-md flex flex-col gap-0 p-0 max-h-[90dvh] overflow-hidden">

        {/* Fixed header — pr-10 avoids overlap with the close button */}
        <div className="shrink-0 px-4 pt-4 pb-3 pr-10 border-b border-border">
          <DialogTitle className="text-base">
            {modoCorreccion ? "Corregir estado del caso" : "Avanzar estado del caso"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">

            {/* Corrección warning */}
            {modoCorreccion && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Modo corrección: puedes asignar cualquier estado independiente del flujo normal.
                  Quedará registrado en la auditoría como corrección manual.
                </span>
              </div>
            )}

            {/* Estado options */}
            {modoCorreccion ? (
              <div className="space-y-3">
                {FASES.map((fase) => {
                  const faseOpciones = fase.estados.filter((e) => e !== estadoActual);
                  if (faseOpciones.length === 0) return null;
                  return (
                    <div key={fase.label}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                        {fase.label}
                      </p>
                      <div className="space-y-1">
                        {faseOpciones.map((est) => (
                          <EstadoButton
                            key={est}
                            estado={est}
                            selected={selectedEstado === est}
                            onSelect={() => { setSelectedEstado(est); setMotivoTermino(""); }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {opciones.length === 0 ? (
                  <p className="py-3 text-center text-sm text-(--ink-600)">
                    No hay transiciones disponibles.
                  </p>
                ) : (
                  opciones.map(({ estado: est, bloqueado }) => (
                    <EstadoButton
                      key={est}
                      estado={est}
                      selected={selectedEstado === est}
                      bloqueado={bloqueado}
                      onSelect={() => { if (!bloqueado) { setSelectedEstado(est); setMotivoTermino(""); } }}
                    />
                  ))
                )}
              </div>
            )}

            {/* Motivo de término */}
            {selectedEstado === "TERMINADO" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-(--ink-600)">
                  Motivo de término <span className="text-destructive">*</span>
                </label>
                <Select
                  value={motivoTermino}
                  onValueChange={(v) => setMotivoTermino((v ?? "") as MotivoTermino | "")}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <span className="flex-1 text-left text-sm">
                      {motivoTermino
                        ? MOTIVOS.find((m) => m.value === motivoTermino)?.label
                        : <span className="text-muted-foreground">Seleccionar motivo…</span>
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {MOTIVOS.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-sm">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive">
                {error instanceof Error ? error.message : "Error al cambiar el estado."}
              </p>
            )}
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 border-t border-border px-4 pt-3 pb-4 flex items-center justify-between gap-2">
            {!modoCorreccion ? (
              <button
                type="button"
                onClick={() => { setModoCorreccion(true); setSelectedEstado(null); setMotivoTermino(""); }}
                className="flex items-center gap-1 text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
              >
                <RotateCcw className="size-3" />
                Corregir estado
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setModoCorreccion(false); setSelectedEstado(null); setMotivoTermino(""); }}
                className="text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
              >
                ← Volver al flujo normal
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  isPending ||
                  !selectedEstado ||
                  (selectedEstado === "TERMINADO" && !motivoTermino)
                }
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                {isPending ? "Guardando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-componente botón de estado ───────────────────────────────────────────
function EstadoButton({
  estado,
  selected,
  bloqueado,
  onSelect,
}: {
  estado: Estado;
  selected: boolean;
  bloqueado?: string;
  onSelect: () => void;
}) {
  const desc = ESTADO_DESC[estado];

  if (bloqueado) {
    return (
      <div className="w-full rounded-lg border border-border/50 bg-(--slate-100)/60 px-3.5 py-2.5 opacity-70 cursor-not-allowed">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="size-3.5 shrink-0 text-(--ink-600)" />
          <p className="text-sm font-medium text-(--ink-600)">{ESTADO_LABELS[estado]}</p>
        </div>
        <p className="mt-1 text-xs text-(--ink-600)">{bloqueado}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-lg border px-3.5 py-2.5 text-left transition-colors",
        selected
          ? "border-(--navy-900) bg-(--navy-900) text-white"
          : "border-border bg-(--paper) text-(--navy-900) hover:border-(--navy-700) hover:bg-(--slate-100)",
      ].join(" ")}
    >
      <p className="text-sm font-medium">{ESTADO_LABELS[estado]}</p>
      {desc && (
        <p className={`mt-0.5 text-xs ${selected ? "text-white/70" : "text-(--ink-600)"}`}>
          {desc}
        </p>
      )}
    </button>
  );
}
