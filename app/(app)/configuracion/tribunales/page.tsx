"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useMe } from "@/features/auth/hooks/useMe";
import { useTribunales } from "@/features/tribunales/hooks/useTribunales";
import { useCrearTribunal } from "@/features/tribunales/hooks/useCrearTribunal";
import type { Tribunal } from "@/lib/api/types";

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

function RegionGroup({
  region,
  tribunales,
}: {
  region: string;
  tribunales: Tribunal[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between bg-(--slate-100)/50 px-4 py-3 hover:bg-(--slate-100) transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 text-(--ink-600)" />
          ) : (
            <ChevronRight className="size-4 text-(--ink-600)" />
          )}
          <span className="text-sm font-semibold text-(--navy-900)">{region}</span>
        </div>
        <span className="text-xs text-(--ink-600)">{tribunales.length}</span>
      </button>
      {expanded && (
        <ul className="divide-y divide-border">
          {tribunales.map((t) => (
            <li key={t.id} className="px-4 py-2.5 text-sm text-(--navy-900)">
              {t.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NuevoTribunalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nombre, setNombre] = useState("");
  const [region, setRegion] = useState("");
  const crear = useCrearTribunal(onClose);

  function handleSubmit() {
    if (!nombre.trim() || !region) return;
    crear.mutate({ nombre: nombre.trim(), region });
  }

  useEffect(() => {
    if (!open) {
      setNombre("");
      setRegion("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar tribunal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm text-(--ink-600)">Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: 3° Juzgado de Policía Local de Santiago"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-(--ink-600)">Región</label>
            <Select value={region} onValueChange={(v) => setRegion(v ?? "")}>
              <SelectTrigger className="w-full">
                <span className={region ? undefined : "text-muted-foreground"}>
                  {region || "Seleccionar región"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {REGIONES_CHILE.map((r) => (
                  <SelectItem key={r} value={r} className="text-sm">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={crear.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={crear.isPending || !nombre.trim() || !region}
          >
            {crear.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {crear.isPending ? "Guardando…" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TribunalesPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const router = useRouter();
  const { data: tribunales = [], isLoading } = useTribunales();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!meLoading && me && me.usuario.rol !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [meLoading, me, router]);

  if (meLoading || !me) return null;
  if (me.usuario.rol !== "ADMIN") return null;

  // Group by region preserving REGIONES_CHILE order
  const grouped = new Map<string, Tribunal[]>();
  for (const r of REGIONES_CHILE) grouped.set(r, []);
  for (const t of tribunales) {
    const list = grouped.get(t.region);
    if (list) list.push(t);
    else grouped.set(t.region, [t]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">
            Tribunales
          </h1>
          <p className="mt-0.5 text-sm text-(--ink-600)">
            Juzgados de Policía Local disponibles para asignar a casos.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Agregar tribunal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-(--ink-600)">
          <Loader2 className="size-4 animate-spin" />
          Cargando…
        </div>
      ) : (
        <div className="space-y-3">
          {[...grouped.entries()]
            .filter(([, courts]) => courts.length > 0)
            .map(([region, courts]) => (
              <RegionGroup key={region} region={region} tribunales={courts} />
            ))}
        </div>
      )}

      <NuevoTribunalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
