"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/features/auth/hooks/useMe";
import { UsuariosTable } from "@/features/configuracion/components/UsuariosTable";
import { InvitarUsuarioDialog } from "@/features/configuracion/components/InvitarUsuarioDialog";

export default function UsuariosPage() {
  const { data: me, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && me && me.usuario.rol !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, me, router]);

  if (isLoading || !me) return null;
  if (me.usuario.rol !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--navy-900)">Usuarios</h1>
          <p className="mt-0.5 text-sm text-(--ink-600)">
            Gestiona los miembros del estudio y sus roles.
          </p>
        </div>
        <InvitarUsuarioDialog />
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <UsuariosTable />
      </div>

      <div className="rounded-xl border border-border bg-(--slate-100)/50 p-4 text-xs text-(--ink-600) space-y-1">
        <p className="font-medium text-(--navy-900)">¿Cómo funciona la invitación?</p>
        <p>
          El usuario invitado recibirá un email para unirse al estudio. Una vez que
          acepte e inicie sesión en Poly, su perfil quedará registrado automáticamente y podrás
          asignarlo a los bancos correspondientes desde la sección <strong>Bancos</strong>.
        </p>
        <p>
          Si el rol seleccionado es <strong>Tramitador</strong>, el usuario se registrará
          inicialmente como Abogado. Una vez que haya iniciado sesión, cámbialo a Tramitador
          desde esta misma tabla.
        </p>
      </div>
    </div>
  );
}
