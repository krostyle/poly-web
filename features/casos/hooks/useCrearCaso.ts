"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { crearCaso } from "@/lib/api/casos";
import type { CrearCasoPayload } from "@/lib/api/types";

export function useCrearCaso() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CrearCasoPayload) => {
      const token = await getToken();
      return crearCaso(payload, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
    },
  });
}
