"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActualizarBanco } from "@/features/bancos/hooks/useActualizarBanco";
import type { Banco } from "@/lib/api/types";

interface EditarBancoDialogProps {
  banco: Banco;
}

export function EditarBancoDialog({ banco }: EditarBancoDialogProps) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(banco.nombre);
  const { mutate, isPending, error, reset } = useActualizarBanco();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate({ id: banco.id, nombre }, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else { setOpen(true); setNombre(banco.nombre); } }}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Editar nombre
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-(--navy-900)">
            Editar banco
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="editar-nombre" className="block text-sm font-medium text-(--ink-600)">
              Nombre del banco
            </label>
            <Input
              id="editar-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
            />
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
              disabled={isPending || !nombre.trim() || nombre === banco.nombre}
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
