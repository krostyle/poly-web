"use client";

import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsuarios, useActualizarRol } from "@/features/configuracion/hooks/useUsuarios";
import { useMe } from "@/features/auth/hooks/useMe";
import type { Rol } from "@/lib/api/types";

const ROL_LABELS: Record<Rol, string> = {
  ADMIN: "Administrador",
  ABOGADO: "Abogado",
  TRAMITADOR: "Tramitador",
};

const ROL_BADGE: Record<Rol, string> = {
  ADMIN: "bg-(--navy-700)/10 text-(--navy-700)",
  ABOGADO: "bg-(--verde)/10 text-(--verde)",
  TRAMITADOR: "bg-(--amarillo)/15 text-(--amarillo)",
};

export function UsuariosTable() {
  const { data: me } = useMe();
  const { data: usuarios, isLoading, isError, refetch } = useUsuarios();
  const { mutate: actualizarRol, isPending: updatingRol } = useActualizarRol();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-(--ink-600)">
        <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
        No se pudieron cargar los usuarios.{" "}
        <button
          onClick={() => refetch()}
          className="underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--ink-600)">
        Sin usuarios registrados todavía.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {usuarios.map((u) => {
        const isMe = u.id === me?.usuario.id;
        return (
          <div key={u.id} className="flex items-center gap-4 py-3.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--navy-900) truncate">
                {u.nombre}
                {isMe && (
                  <span className="ml-2 text-[10px] font-normal text-(--ink-600)">(tú)</span>
                )}
              </p>
              <p className="text-xs text-(--ink-600) truncate">{u.email}</p>
            </div>

            {isMe ? (
              // Can't change own role
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROL_BADGE[u.rol as Rol]}`}
              >
                {ROL_LABELS[u.rol as Rol] ?? u.rol}
              </span>
            ) : (
              <Select
                value={u.rol}
                disabled={updatingRol}
                onValueChange={(newRol) => actualizarRol({ id: u.id, rol: newRol as Rol })}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue>{ROL_LABELS[u.rol as Rol] ?? u.rol}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROL_LABELS) as [Rol, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}
    </div>
  );
}
