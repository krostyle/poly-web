"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrearBanco } from "@/features/bancos/hooks/useCrearBanco";

export function NuevoBancoDialog() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const { mutate, isPending, error, reset } = useCrearBanco();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
          Ingresa el nombre del banco con el que trabaja el estudio.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="banco-nombre" className="block text-sm font-medium text-(--ink-600)">
              Nombre del banco
            </label>
            <Input
              id="banco-nombre"
              placeholder="ej. Banco de Chile"
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
            <Button type="submit" size="sm" disabled={isPending || !nombre.trim()}>
              {isPending ? "Creando…" : "Crear banco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
