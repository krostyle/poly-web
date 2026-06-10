"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarUsuariosEstudio } from "@/lib/api/bancos";
import type { UsuarioBanco } from "@/lib/api/types";

export function useUsuariosEstudio() {
  const { getToken } = useAuth();
  return useQuery<UsuarioBanco[]>({
    queryKey: ["usuarios-estudio"],
    queryFn: async () => {
      const token = await getToken();
      return listarUsuariosEstudio(token ?? "");
    },
  });
}
