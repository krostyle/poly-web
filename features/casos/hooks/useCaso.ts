"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { obtenerCasoDetalle } from "@/lib/api/casos";
import type { CasoDetalle } from "@/lib/api/types";

export function useCaso(id: string) {
  const { getToken } = useAuth();
  return useQuery<CasoDetalle>({
    queryKey: ["casos", id],
    queryFn: async () => {
      const token = await getToken();
      return obtenerCasoDetalle(id, token ?? "");
    },
    enabled: !!id,
  });
}
