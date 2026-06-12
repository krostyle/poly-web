"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Loader2, UserPlus } from "lucide-react";
import { useInvitarUsuario } from "@/features/configuracion/hooks/useUsuarios";
import type { Rol } from "@/lib/api/types";

const ROL_LABELS: Record<Rol, string> = {
  ADMIN: "Administrador",
  ABOGADO: "Abogado",
  TRAMITADOR: "Tramitador",
};

export function InvitarUsuarioDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<Rol>("ABOGADO");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutate: invitar, isPending } = useInvitarUsuario();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("El email es requerido.");
      return;
    }

    invitar(
      { email: email.trim(), rol },
      {
        onSuccess: () => {
          setSuccess(true);
          setEmail("");
          setRol("ABOGADO");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Error al enviar invitación.");
        },
      }
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmail("");
      setRol("ABOGADO");
      setError(null);
      setSuccess(false);
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <UserPlus className="size-4" />
        Invitar usuario
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-sm font-medium text-(--verde)">Invitación enviada</p>
            <p className="text-xs text-(--ink-600)">
              El usuario recibirá un email para unirse al estudio. Una vez que inicie sesión
              quedará disponible para asignar a bancos.
            </p>
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--ink-600)">Email <span className="text-destructive">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-(--ink-600)">Rol <span className="text-destructive">*</span></label>
              <Select value={rol} onValueChange={(v) => setRol(v as Rol)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{ROL_LABELS[rol]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROL_LABELS) as [Rol, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-(--ink-600)">
                {rol === "ADMIN"
                  ? "Acceso completo: bancos, usuarios y todos los casos."
                  : rol === "TRAMITADOR"
                  ? "Solo puede gestionar casos asignados. Sin acceso a configuración."
                  : "Puede gestionar casos asignados y ver historial."}
              </p>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                {isPending ? "Enviando…" : "Enviar invitación"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
