"use client";

import { useState } from "react";
import { Loader2, Scale, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompletarOnboarding } from "@/features/configuracion/hooks/useUsuarios";

const OPCIONES = [
  {
    rol: "ABOGADO" as const,
    titulo: "Abogado",
    descripcion: "Gestiono casos, avanzo etapas y reviso el historial legal.",
    icon: Scale,
  },
  {
    rol: "TRAMITADOR" as const,
    titulo: "Tramitador",
    descripcion: "Apoyo la gestión operativa y el seguimiento de plazos.",
    icon: ClipboardList,
  },
];

export function OnboardingRolModal() {
  const [selected, setSelected] = useState<"ABOGADO" | "TRAMITADOR" | null>(null);
  const { mutate, isPending, error } = useCompletarOnboarding();

  function handleConfirmar() {
    if (!selected) return;
    mutate(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-(--paper) p-6 shadow-xl">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Bienvenido a Poly
        </div>
        <h2 className="font-display text-xl font-semibold text-(--navy-900)">
          ¿Cuál es tu rol en el estudio?
        </h2>
        <p className="mt-1 text-sm text-(--ink-600)">
          Elige el rol que mejor describe tu trabajo. El administrador puede cambiarlo más adelante.
        </p>

        <div className="mt-5 space-y-3">
          {OPCIONES.map(({ rol, titulo, descripcion, icon: Icon }) => (
            <button
              key={rol}
              type="button"
              onClick={() => setSelected(rol)}
              className={[
                "w-full rounded-xl border px-4 py-3.5 text-left transition-colors",
                selected === rol
                  ? "border-(--navy-900) bg-(--navy-900) text-white"
                  : "border-border bg-(--paper) text-(--navy-900) hover:border-(--navy-700) hover:bg-(--slate-100)",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <Icon className={`size-5 shrink-0 ${selected === rol ? "text-white/80" : "text-(--ink-600)"}`} strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold">{titulo}</p>
                  <p className={`text-xs mt-0.5 ${selected === rol ? "text-white/70" : "text-(--ink-600)"}`}>
                    {descripcion}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-xs text-destructive">
            {error instanceof Error ? error.message : "Error al guardar el rol."}
          </p>
        )}

        <Button
          className="mt-5 w-full"
          disabled={!selected || isPending}
          onClick={handleConfirmar}
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {isPending ? "Guardando…" : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
