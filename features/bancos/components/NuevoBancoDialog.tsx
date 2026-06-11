"use client";

import { useState } from "react";
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
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useCrearBanco } from "@/features/bancos/hooks/useCrearBanco";
import { useCatalogoBancos } from "@/features/bancos/hooks/useCatalogoBancos";

export function NuevoBancoDialog() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const { mutate, isPending, error, reset } = useCrearBanco();
  const { data: catalogo, isLoading: loadingCatalogo, isError: catalogoError, refetch } = useCatalogoBancos();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) return;
    mutate(nombre, {
      onSuccess: () => {
        setOpen(false);
        setNombre("");
        reset();
      },
    });
  }

  function handleClose() {
    setOpen(false);
    setNombre("");
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else setOpen(true); }}>
      <DialogTrigger render={<Button size="sm" />}>
        + Nuevo banco
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-(--navy-900)">
            Nuevo banco
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-(--ink-600) -mt-2 mb-2">
          Selecciona la entidad financiera con la que trabaja el estudio.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-(--ink-600)">
              Entidad financiera
            </label>
            {loadingCatalogo ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : catalogoError ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-(--slate-100) px-3 py-2.5">
                <AlertCircle className="size-4 shrink-0 text-(--ink-600)" strokeWidth={1.5} />
                <p className="flex-1 text-xs text-(--ink-600)">No se pudieron cargar las entidades.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors shrink-0"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <Select value={nombre || undefined} onValueChange={(v) => setNombre(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar entidad…" />
                </SelectTrigger>
                <SelectContent>
                  {(catalogo ?? []).map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error.message}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !nombre}>
              {isPending ? "Creando…" : "Crear banco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
