"use client";

import { AlertCircle, FolderOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsuariosBanco } from "@/features/bancos/hooks/useUsuariosBanco";
import { useDesasignarUsuario } from "@/features/bancos/hooks/useDesasignarUsuario";
import { AsignarUsuarioDialog } from "./AsignarUsuarioDialog";

const ROL_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  ABOGADO: "Abogado",
  TRAMITADOR: "Tramitador",
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}

interface UsuariosBancoTableProps {
  bancoId: string;
}

export function UsuariosBancoTable({ bancoId }: UsuariosBancoTableProps) {
  const { data: usuarios, isLoading, isError, refetch } = useUsuariosBanco(bancoId);
  const { mutate: desasignar, isPending: desasignando } = useDesasignarUsuario();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Usuarios con acceso
          {usuarios && usuarios.length > 0 && (
            <span className="ml-1.5 font-normal normal-case text-muted-foreground">
              ({usuarios.length})
            </span>
          )}
        </h2>
        <AsignarUsuarioDialog bancoId={bancoId} asignados={usuarios ?? []} />
      </div>

      <div className="rounded-xl border border-border bg-(--paper) overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="rounded-xl bg-(--slate-100) p-3.5">
              <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--navy-900)">No se pudieron cargar los usuarios</p>
              <p className="mt-0.5 text-xs text-(--ink-600)">Verificá tu conexión e intentá nuevamente.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !usuarios || usuarios.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="rounded-xl bg-(--slate-100) p-3.5">
              <FolderOpen className="size-6 text-(--ink-600)" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--navy-900)">Sin usuarios asignados</p>
              <p className="mt-0.5 text-xs text-(--ink-600)">
                Asigna usuarios para que puedan crear y ver casos de este banco.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-(--slate-100) hover:bg-(--slate-100)">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                  Nombre
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                  Rol
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
                  Email
                </TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id} className="hover:bg-(--slate-100) transition-colors">
                  <TableCell className="text-sm font-medium text-(--navy-900)">{u.nombre}</TableCell>
                  <TableCell className="text-sm text-(--ink-600)">
                    {ROL_LABELS[u.rol] ?? u.rol}
                  </TableCell>
                  <TableCell className="text-sm text-(--ink-600)">{u.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={desasignando}
                      onClick={() => desasignar({ bancoId, usuarioId: u.id })}
                      className="text-xs"
                    >
                      Quitar acceso
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>
    </div>
  );
}
