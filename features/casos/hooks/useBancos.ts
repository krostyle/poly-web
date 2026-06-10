"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api/client";

interface Banco {
  id: string;
  nombre: string;
}

interface MeResponse {
  estudio: { id: string; nombre: string };
  usuario: { id: string; nombre: string; email: string; rol: string };
  bancos: Banco[];
}

export function useBancos() {
  const { getToken } = useAuth();
  return useQuery<Banco[]>({
    queryKey: ["me-bancos"],
    queryFn: async () => {
      const token = await getToken();
      const me = await apiClient.request<MeResponse>("/v1/me", { token: token ?? "" });
      return me.bancos ?? [];
    },
  });
}
