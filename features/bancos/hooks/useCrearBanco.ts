"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { crearBanco } from "@/lib/api/bancos";
import type { Banco } from "@/lib/api/types";

export function useCrearBanco() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<Banco, Error, string>({
    mutationFn: async (nombre) => {
      const token = await getToken();
      return crearBanco(nombre, token ?? "");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bancos"] }),
  });
}
