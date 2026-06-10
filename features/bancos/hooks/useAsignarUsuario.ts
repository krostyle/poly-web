"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { asignarUsuario } from "@/lib/api/bancos";

interface AsignarInput { bancoId: string; usuarioId: string }

export function useAsignarUsuario() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, AsignarInput>({
    mutationFn: async ({ bancoId, usuarioId }) => {
      const token = await getToken();
      return asignarUsuario(bancoId, usuarioId, token ?? "");
    },
    onSuccess: (_data, { bancoId }) => {
      qc.invalidateQueries({ queryKey: ["bancos", bancoId, "usuarios"] });
    },
  });
}
