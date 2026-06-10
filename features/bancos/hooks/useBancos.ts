"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarBancos } from "@/lib/api/bancos";
import type { Banco } from "@/lib/api/types";

export function useBancos() {
  const { getToken } = useAuth();
  return useQuery<Banco[]>({
    queryKey: ["bancos"],
    queryFn: async () => {
      const token = await getToken();
      return listarBancos(token ?? "");
    },
  });
}
