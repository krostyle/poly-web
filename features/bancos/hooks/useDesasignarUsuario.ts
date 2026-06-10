"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { desasignarUsuario } from "@/lib/api/bancos";

interface DesasignarInput { bancoId: string; usuarioId: string }

export function useDesasignarUsuario() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, DesasignarInput>({
    mutationFn: async ({ bancoId, usuarioId }) => {
      const token = await getToken();
      return desasignarUsuario(bancoId, usuarioId, token ?? "");
    },
    onSuccess: (_data, { bancoId }) => {
      qc.invalidateQueries({ queryKey: ["bancos", bancoId, "usuarios"] });
    },
  });
}
