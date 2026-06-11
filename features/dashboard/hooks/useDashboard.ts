import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  getDashboardPorVencer,
  getDashboardNuevos,
  getDashboardEstancados,
  getDashboardPorAbogado,
} from "@/lib/api/dashboard";

const REFETCH_INTERVAL = 5 * 60 * 1000;

export function usePorVencer(params?: { dias?: number; bancoId?: string }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "por-vencer", params],
    queryFn: async () => {
      const token = await getToken();
      return getDashboardPorVencer(token ?? "", params);
    },
    staleTime: 60_000,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useNuevos(params?: { bancoId?: string }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "nuevos", params],
    queryFn: async () => {
      const token = await getToken();
      return getDashboardNuevos(token ?? "", params);
    },
    staleTime: 60_000,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useEstancados(params?: { dias?: number; bancoId?: string }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "estancados", params],
    queryFn: async () => {
      const token = await getToken();
      return getDashboardEstancados(token ?? "", params);
    },
    staleTime: 60_000,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function usePorAbogado(params?: { bancoId?: string }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "por-abogado", params],
    queryFn: async () => {
      const token = await getToken();
      return getDashboardPorAbogado(token ?? "", params);
    },
    staleTime: 60_000,
    refetchInterval: REFETCH_INTERVAL,
  });
}
