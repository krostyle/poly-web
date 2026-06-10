"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EditarBancoDialog } from "@/features/bancos/components/EditarBancoDialog";
import { UsuariosBancoTable } from "@/features/bancos/components/UsuariosBancoTable";
import { useMe } from "@/features/auth/hooks/useMe";
import { useBancos } from "@/features/bancos/hooks/useBancos";
import { useEliminarBanco } from "@/features/bancos/hooks/useEliminarBanco";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BancoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: bancos, isLoading: loadingBancos, isError } = useBancos();
  const { mutate: eliminar, isPending: eliminando } = useEliminarBanco();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingMe && me && me.usuario.rol !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [loadingMe, me, router]);

  const banco = bancos?.find((b) => b.id === id);
  const isLoading = loadingMe || loadingBancos;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    );
  }

  if (isError || (!isLoading && !banco)) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="rounded-xl bg-(--slate-100) p-3.5">
          <AlertCircle className="size-6 text-(--ink-600)" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-(--navy-900)">Banco no encontrado</p>
          <p className="mt-0.5 text-xs text-(--ink-600)">
            Es posible que haya sido eliminado o no tengas acceso.
          </p>
        </div>
        <Link
          href="/configuracion/bancos"
          className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Volver a bancos
        </Link>
      </div>
    );
  }

  function handleEliminar() {
    setDeleteError(null);
    eliminar(id, {
      onSuccess: () => router.push("/configuracion/bancos"),
      onError: (err) => {
        setDeleteError(
          err.message.includes("409") || err.message.toLowerCase().includes("casos")
            ? "Este banco tiene casos asociados y no puede eliminarse."
            : "No se pudo eliminar el banco. Intentá nuevamente."
        );
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/configuracion/bancos"
        className="inline-flex items-center text-sm text-(--ink-600) hover:text-(--navy-900) transition-colors"
      >
        ← Bancos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">{banco!.nombre}</h1>
          <p className="mt-0.5 text-sm tabular-nums text-(--ink-600)">
            Creado el {formatDate(banco!.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <EditarBancoDialog banco={banco!} />
          <Button
            variant="destructive"
            size="sm"
            disabled={eliminando}
            onClick={handleEliminar}
          >
            {eliminando ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </div>

      {/* Error de eliminación */}
      {deleteError && (
        <p className="text-sm text-destructive">{deleteError}</p>
      )}

      {/* Usuarios asignados */}
      <UsuariosBancoTable bancoId={id} />
    </div>
  );
}
