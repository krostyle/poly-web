"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { crearTribunal } from "@/lib/api/tribunales";
import type { Tribunal } from "@/lib/api/types";

export function useCrearTribunal(onSuccess?: () => void) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<Tribunal, Error, { nombre: string; region: string }>({
    mutationFn: async ({ nombre, region }) => {
      const token = await getToken();
      return crearTribunal(token ?? "", nombre, region);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tribunales"] });
      onSuccess?.();
    },
  });
}
