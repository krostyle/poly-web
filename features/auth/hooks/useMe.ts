"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api/client";
import type { MeResponse } from "@/lib/api/types";

export function useMe() {
  const { getToken } = useAuth();
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.request<MeResponse>("/v1/me", { token: token ?? "" });
    },
  });
}
