"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { actualizarCaso } from "@/lib/api/casos";

export function useActualizarCaso(casoId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: {
      abogadoId?: string;
      numeroOt?: string;
      denunciaValida?: boolean;
      fechaDenuncia?: string;
      fechaDj?: string;
    }) => {
      const token = await getToken();
      return actualizarCaso(casoId, patch, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos", casoId] });
    },
  });
}
