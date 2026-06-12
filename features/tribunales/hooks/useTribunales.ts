"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarTribunales } from "@/lib/api/tribunales";
import type { Tribunal } from "@/lib/api/types";

export function useTribunales() {
  const { getToken } = useAuth();
  return useQuery<Tribunal[]>({
    queryKey: ["tribunales"],
    queryFn: async () => {
      const token = await getToken();
      return listarTribunales(token ?? "");
    },
    staleTime: 1000 * 60 * 30, // 30 min — list changes rarely
  });
}
