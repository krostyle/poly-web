"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarCasos } from "@/lib/api/casos";

export function useCasos() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["casos"],
    queryFn: async () => {
      const token = await getToken();
      return listarCasos(token ?? "");
    },
  });
}
