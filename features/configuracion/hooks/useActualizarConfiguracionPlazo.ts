"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { actualizarConfiguracionPlazo } from "@/lib/api/configuracion";

export function useActualizarConfiguracionPlazo() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, { tipo: string; diasHabiles: number }>({
    mutationFn: async ({ tipo, diasHabiles }) => {
      const token = await getToken();
      await actualizarConfiguracionPlazo(token ?? "", tipo, diasHabiles);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["configuracion", "plazos"] });
    },
  });
}
