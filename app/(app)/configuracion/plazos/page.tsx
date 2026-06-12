"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/features/auth/hooks/useMe";
import { useConfiguracionPlazos } from "@/features/configuracion/hooks/useConfiguracionPlazos";
import { useActualizarConfiguracionPlazo } from "@/features/configuracion/hooks/useActualizarConfiguracionPlazo";
import type { ConfiguracionPlazo } from "@/lib/api/types";

function PlazoRow({ config }: { config: ConfiguracionPlazo }) {
  const [value, setValue] = useState(String(config.diasHabiles));
  const actualizar = useActualizarConfiguracionPlazo();
  const isDirty = value !== String(config.diasHabiles);
  const numValue = parseInt(value, 10);
  const isValid = !isNaN(numValue) && numValue >= 1 && numValue <= 90;

  useEffect(() => {
    setValue(String(config.diasHabiles));
  }, [config.diasHabiles]);

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-(--navy-900)">{config.label}</p>
        <p className="text-xs text-(--ink-600) mt-0.5">
          {config.esDefault ? "Valor por defecto" : "Configurado para este estudio"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            max={90}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-20 text-center text-sm"
          />
          <span className="text-xs text-(--ink-600) whitespace-nowrap">días hábiles</span>
        </div>
        {isDirty && (
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={!isValid || actualizar.isPending}
            onClick={() => actualizar.mutate({ tipo: config.tipo, diasHabiles: numValue })}
          >
            {actualizar.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ConfiguracionPlazosPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const router = useRouter();
  const { data: configs, isLoading } = useConfiguracionPlazos();

  useEffect(() => {
    if (!meLoading && me && me.usuario.rol !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [meLoading, me, router]);

  if (meLoading || !me) return null;
  if (me.usuario.rol !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
          Configuración de plazos
        </h1>
        <p className="mt-0.5 text-sm text-(--ink-600)">
          Días hábiles asignados a cada etapa interna del proceso. Los plazos legales (Ley 20.009) no son modificables.
        </p>
      </div>

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
            Plazos configurables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-(--ink-600)">
              <Loader2 className="size-4 animate-spin" />
              Cargando…
            </div>
          ) : !configs || configs.length === 0 ? (
            <p className="py-4 text-sm text-center text-(--ink-600)">Sin configuración disponible.</p>
          ) : (
            <div>
              {configs.map((c) => (
                <PlazoRow key={c.tipo} config={c} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-none bg-(--slate-100)/40">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-(--ink-600) leading-relaxed">
            <strong className="text-(--navy-900)">Plazos legales fijos (Ley 20.009):</strong>{" "}
            Restitución 10 días hábiles (15 si cajero, +7 si &gt;35 UF) · Medida precautoria 13 días · Resolución JPL 3 días · Demanda banco 10 días · Restitución rechazo 3 días · Respuesta denuncia 30 días
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
