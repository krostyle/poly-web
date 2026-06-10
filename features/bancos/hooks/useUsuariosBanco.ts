"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarUsuariosBanco } from "@/lib/api/bancos";
import type { UsuarioBanco } from "@/lib/api/types";

export function useUsuariosBanco(bancoId: string) {
  const { getToken } = useAuth();
  return useQuery<UsuarioBanco[]>({
    queryKey: ["bancos", bancoId, "usuarios"],
    queryFn: async () => {
      const token = await getToken();
      return listarUsuariosBanco(bancoId, token ?? "");
    },
    enabled: !!bancoId,
  });
}
