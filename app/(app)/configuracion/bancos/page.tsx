"use client";

import { redirect } from "next/navigation";
import { BancosTable } from "@/features/bancos/components/BancosTable";
import { NuevoBancoDialog } from "@/features/bancos/components/NuevoBancoDialog";
import { useMe } from "@/features/auth/hooks/useMe";

export default function BancosPage() {
  const { data: me, isLoading } = useMe();

  if (!isLoading && me?.usuario.rol !== "ADMIN") {
    redirect("/dashboard");
  }

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
