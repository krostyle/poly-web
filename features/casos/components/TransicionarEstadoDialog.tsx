"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
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
import type { Estado, MotivoTermino } from "@/lib/api/types";
import { useTransicionarEstado } from "@/features/casos/hooks/useTransicionarEstado";

// ── Transiciones válidas (mirror del backend) ────────────────────────────────
const TRANSICIONES: Record<Estado, Estado[]> = {
  INGRESO:          ["REVISION", "TERMINADO"],
  REVISION:         ["PREJUDICIAL", "TERMINADO"],
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
  REVISION:          "Banco revisa si la denuncia es válida",
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
  { label: "Ingreso",     estados: ["INGRESO", "REVISION"] as Estado[] },
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
  denunciaValida: boolean;
}

// ── Componente ───────────────────────────────────────────────────────────────
export function TransicionarEstadoDialog({ casoId, estadoActual }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [motivoTermino, setMotivoTermino] = useState<MotivoTermino | "">("");
  const [modoCorreccion, setModoCorreccion] = useState(false);
  const { mutate, isPending, error } = useTransicionarEstado(casoId);

  const siguientes = TRANSICIONES[estadoActual] ?? [];
  const opciones: Estado[] = modoCorreccion
    ? (Object.keys(TRANSICIONES) as Estado[]).filter((e) => e !== estadoActual)
    : siguientes;

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

  // When state machine has no forward transitions, only show if mode corrección
  const hasSiguientes = siguientes.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" disabled={!hasSiguientes && !modoCorreccion} />}>
        Cambiar estado
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {modoCorreccion ? "Corregir estado del caso" : "Avanzar estado del caso"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
            // In correction mode: show states grouped by phase
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
            // Normal mode: flat list of valid transitions
            <div className="space-y-1.5">
              {opciones.length === 0 ? (
                <p className="py-3 text-center text-sm text-(--ink-600)">
                  No hay transiciones disponibles.
                </p>
              ) : (
                opciones.map((est) => (
                  <EstadoButton
                    key={est}
                    estado={est}
                    selected={selectedEstado === est}
                    onSelect={() => { setSelectedEstado(est); setMotivoTermino(""); }}
                  />
                ))
              )}
            </div>
          )}

          {/* Motivo de término (solo cuando se selecciona TERMINADO) */}
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

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
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
  onSelect,
}: {
  estado: Estado;
  selected: boolean;
  onSelect: () => void;
}) {
  const desc = ESTADO_DESC[estado];
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
