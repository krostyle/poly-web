"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BancosTable } from "@/features/bancos/components/BancosTable";
import { NuevoBancoDialog } from "@/features/bancos/components/NuevoBancoDialog";
import { useMe } from "@/features/auth/hooks/useMe";

export default function BancosPage() {
  const { data: me, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && me && me.usuario.rol !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, me, router]);

  // Still loading or waiting for bootstrap to update role — don't redirect yet
  if (isLoading || !me) return null;
  if (me.usuario.rol !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Bancos</h1>
          <p className="mt-0.5 text-sm text-(--ink-600)">
            Los bancos con los que trabaja el estudio.
          </p>
        </div>
        <NuevoBancoDialog />
      </div>
      <BancosTable />
    </div>
  );
}
