"use client";

import Link from "next/link";
import { AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNuevos } from "@/features/dashboard/hooks/useDashboard";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Hace menos de 1h";
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function CasosNuevos() {
  const { data, isLoading, isError } = useNuevos();

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          <Inbox className="size-3.5" strokeWidth={2} />
          Casos nuevos
          {data && data.length > 0 && (
            <span className="ml-auto font-normal normal-case tabular-nums text-(--navy-900)">
              {data.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-3">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 py-6 text-sm text-(--ink-600)">
            <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} />
            Error al cargar casos nuevos.
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--ink-600)">
            Sin casos en estado LLAMADA.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((item) => (
              <Link
                key={item.casoId}
                href={`/casos/${item.casoId}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-(--slate-100) rounded-lg px-1 -mx-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--navy-900) truncate">
                    {item.clienteNombre}
                  </p>
                  <p className="text-xs text-(--ink-600) truncate">
                    {item.bancoNombre}
                    {!item.abogadoId && (
                      <span className="ml-1.5 text-(--rojo)">· Sin asignar</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-(--ink-600) tabular-nums">
                  {formatRelative(item.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
