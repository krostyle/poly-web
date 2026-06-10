"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api/client";
import type { Plazo } from "@/lib/api/types";

export function usePlazos(casoId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["plazos", casoId],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.request<Plazo[]>(`/v1/casos/${casoId}/plazos`, {
        token: token ?? "",
      });
    },
    enabled: !!casoId,
  });
}
