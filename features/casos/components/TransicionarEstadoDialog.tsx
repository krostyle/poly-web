"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Estado } from "@/lib/api/types";
import { useTransicionarEstado } from "@/features/casos/hooks/useTransicionarEstado";

const TRANSICIONES: Record<Estado, Estado[]> = {
  LLAMADA: ["REVISION", "TERMINADO"],
  REVISION: ["SUSPENSION", "TERMINADO"],
  SUSPENSION: ["PRE_JUDICIALIZACION", "TERMINADO"],
  PRE_JUDICIALIZACION: ["JUDICIALIZACION", "RESTITUCION", "TERMINADO"],
  RESTITUCION: ["JUDICIALIZACION", "CIERRE"],
  JUDICIALIZACION: ["CIERRE", "TERMINADO"],
  CIERRE: [],
  TERMINADO: [],
};

const TODOS_LOS_ESTADOS: Estado[] = [
  "LLAMADA",
  "REVISION",
  "SUSPENSION",
  "PRE_JUDICIALIZACION",
  "RESTITUCION",
  "JUDICIALIZACION",
  "CIERRE",
  "TERMINADO",
];

const ESTADO_LABELS: Record<Estado, string> = {
  LLAMADA: "Llamada",
  REVISION: "Revisión",
  SUSPENSION: "Suspensión",
  PRE_JUDICIALIZACION: "Pre-judicialización",
  RESTITUCION: "Restitución",
  JUDICIALIZACION: "Judicialización",
  CIERRE: "Cierre",
  TERMINADO: "Terminado",
};

interface Props {
  casoId: string;
  estadoActual: Estado;
  denunciaValida: boolean;
}

export function TransicionarEstadoDialog({ casoId, estadoActual, denunciaValida }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [motivoTermino, setMotivoTermino] = useState("");
  const [modoCorreccion, setModoCorreccion] = useState(false);
  const { mutate, isPending, error } = useTransicionarEstado(casoId);

  const siguientes = TRANSICIONES[estadoActual] ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEstado) return;
    mutate(
      {
        estado: selectedEstado,
        motivoTermino: selectedEstado === "TERMINADO" ? motivoTermino : undefined,
        forzar: modoCorreccion,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedEstado(null);
          setMotivoTermino("");
          setModoCorreccion(false);
        },
      }
    );
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setSelectedEstado(null);
      setMotivoTermino("");
      setModoCorreccion(false);
    }
    setOpen(val);
  }

  const opciones = modoCorreccion
    ? TODOS_LOS_ESTADOS.filter((e) => e !== estadoActual)
    : siguientes;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        Cambiar estado
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {modoCorreccion ? "Corregir estado del caso" : "Cambiar estado del caso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {modoCorreccion && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>Modo corrección: puedes asignar cualquier estado independiente del flujo normal. Quedará registrado en la auditoría.</span>
            </div>
          )}

          <div className="space-y-2">
            {opciones.length === 0 ? (
              <p className="py-2 text-center text-sm text-(--ink-600)">
                No hay transiciones disponibles.
              </p>
            ) : (
              opciones.map((est) => {
                const disabled = !modoCorreccion && est === "JUDICIALIZACION" && !denunciaValida;
                return (
                  <button
                    key={est}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setSelectedEstado(est)}
                    className={[
                      "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                      disabled
                        ? "cursor-not-allowed border-border bg-(--slate-100) text-muted-foreground"
                        : selectedEstado === est
                        ? "border-(--navy-900) bg-(--navy-900) text-white"
                        : "border-border bg-(--paper) text-(--navy-900) hover:border-(--navy-700) hover:bg-(--slate-100)",
                    ].join(" ")}
                  >
                    <span className="font-medium">{ESTADO_LABELS[est]}</span>
                    {disabled && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (requiere denuncia válida)
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {selectedEstado === "TERMINADO" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-(--ink-600)">
                Motivo de término
              </label>
              <Textarea
                value={motivoTermino}
                onChange={(e) => setMotivoTermino(e.target.value)}
                placeholder="Describe el motivo del cierre…"
                rows={3}
                required
                className="resize-none"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">
              {error instanceof Error ? error.message : "Error al cambiar el estado."}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {!modoCorreccion && (
              <button
                type="button"
                onClick={() => { setModoCorreccion(true); setSelectedEstado(null); }}
                className="flex items-center gap-1 text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
              >
                <RotateCcw className="size-3" />
                Corregir estado
              </button>
            )}
            {modoCorreccion && (
              <button
                type="button"
                onClick={() => { setModoCorreccion(false); setSelectedEstado(null); }}
                className="text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
              >
                Cancelar corrección
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  isPending ||
                  !selectedEstado ||
                  (selectedEstado === "TERMINADO" && !motivoTermino.trim())
                }
              >
                {isPending ? "Guardando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
