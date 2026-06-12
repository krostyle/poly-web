"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarConfiguracionPlazos } from "@/lib/api/configuracion";
import type { ConfiguracionPlazo } from "@/lib/api/types";

export function useConfiguracionPlazos() {
  const { getToken } = useAuth();
  return useQuery<ConfiguracionPlazo[]>({
    queryKey: ["configuracion", "plazos"],
    queryFn: async () => {
      const token = await getToken();
      return listarConfiguracionPlazos(token ?? "");
    },
    staleTime: 1000 * 60 * 5,
  });
}
