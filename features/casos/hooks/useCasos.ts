"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarCasos } from "@/lib/api/casos";
import type { CasoListItem } from "@/lib/api/types";

export function useCasos() {
  const { getToken } = useAuth();
  return useQuery<{ casos: CasoListItem[]; total: number }>({
    queryKey: ["casos"],
    queryFn: async () => {
      const token = await getToken();
      return listarCasos(token ?? "");
    },
  });
}
