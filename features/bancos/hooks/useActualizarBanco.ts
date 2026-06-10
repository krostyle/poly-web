"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { actualizarBanco } from "@/lib/api/bancos";
import type { Banco } from "@/lib/api/types";

interface ActualizarInput { id: string; nombre: string }

export function useActualizarBanco() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<Banco, Error, ActualizarInput>({
    mutationFn: async ({ id, nombre }) => {
      const token = await getToken();
      return actualizarBanco(id, nombre, token ?? "");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bancos"] }),
  });
}
