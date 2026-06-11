"use client";

import { useState, type FormEvent } from "react";
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
import { useAsignarUsuario } from "@/features/bancos/hooks/useAsignarUsuario";
import { useUsuariosEstudio } from "@/features/bancos/hooks/useUsuariosEstudio";
import type { UsuarioBanco } from "@/lib/api/types";

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  ABOGADO: "Abogado",
  TRAMITADOR: "Tramitador",
};

interface AsignarUsuarioDialogProps {
  bancoId: string;
  asignados: UsuarioBanco[];
}

export function AsignarUsuarioDialog({ bancoId, asignados }: AsignarUsuarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [usuarioId, setUsuarioId] = useState("");
  const { mutate, isPending, error, reset } = useAsignarUsuario();
  const { data: todos } = useUsuariosEstudio();

  const asignadosIds = new Set(asignados.map((u) => u.id));
  const disponibles = (todos ?? []).filter((u) => !asignadosIds.has(u.id));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate({ bancoId, usuarioId }, {
      onSuccess: () => {
        setOpen(false);
        setUsuarioId("");
        reset();
      },
    });
  }

  function handleClose() {
    setOpen(false);
    setUsuarioId("");
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else setOpen(true); }}>
      <DialogTrigger render={<Button size="sm" />}>
        + Asignar usuario
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-(--navy-900)">
            Asignar usuario
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="asignar-usuario" className="block text-sm font-medium text-(--ink-600)">
              Usuario
            </label>
            {disponibles.length === 0 ? (
              <div className="rounded-lg border border-border bg-(--slate-100) px-3 py-2.5">
                <p className="text-xs text-(--ink-600)">
                  Todos los usuarios del estudio ya están asignados a este banco.
                </p>
              </div>
            ) : (
              <Select value={usuarioId || undefined} onValueChange={(v) => setUsuarioId(v ?? "")}>
                <SelectTrigger id="asignar-usuario" className="w-full">
                  <SelectValue placeholder="Seleccionar usuario">
                    {usuarioId ? disponibles.find((u) => u.id === usuarioId)?.nombre : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {disponibles.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre}
                      <span className="ml-1 text-xs text-(--ink-600)">
                        · {ROL_LABELS[u.rol] ?? u.rol}
                      </span>
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
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !usuarioId || disponibles.length === 0}
            >
              {isPending ? "Asignando…" : "Asignar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
