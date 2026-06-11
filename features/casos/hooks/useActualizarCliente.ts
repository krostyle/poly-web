"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarCliente } from "@/lib/api/clientes";

export function useActualizarCliente(clienteId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { nombre?: string; contacto?: string | null }) => {
      const token = await getToken();
      return actualizarCliente(clienteId, patch, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caso"] });
    },
  });
}
