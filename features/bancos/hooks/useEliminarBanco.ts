"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { eliminarBanco } from "@/lib/api/bancos";

export function useEliminarBanco() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken();
      return eliminarBanco(id, token ?? "");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bancos"] }),
  });
}
