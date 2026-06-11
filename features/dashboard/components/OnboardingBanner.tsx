"use client";

import Link from "next/link";
import { useMe } from "@/features/auth/hooks/useMe";

export function OnboardingBanner() {
  const { data: me, isLoading } = useMe();

  if (isLoading || !me || me.bancos.length > 0) return null;

  const isAdmin = me.usuario.rol === "ADMIN";

  return (
    <div className="rounded-xl border border-border bg-(--slate-100)/60 px-5 py-4">
      <p className="text-sm font-medium text-(--navy-900)">
        {isAdmin ? "Bienvenido a Poly" : "Aún no tienes bancos asignados"}
      </p>
      <p className="mt-1 text-sm text-(--ink-600)">
        {isAdmin
          ? "Para comenzar, crea el primer banco del estudio y asigna usuarios a él."
          : "Contacta al administrador del estudio para que te asigne acceso a un banco."}
      </p>
      {isAdmin && (
        <Link
          href="/configuracion/bancos"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--navy-700) hover:text-(--navy-900) underline underline-offset-2 transition-colors"
        >
          Ir a Configuración →
        </Link>
      )}
    </div>
  );
}
