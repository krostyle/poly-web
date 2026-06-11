import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getPlazosGlobal, cumplirPlazo } from "@/lib/api/plazos";
import type { TipoPlazo, Semaforo } from "@/lib/api/types";

export function usePlazos(params?: { tipo?: TipoPlazo; semaforo?: Semaforo }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["plazos-global", params],
    queryFn: async () => {
      const token = await getToken();
      return getPlazosGlobal(token ?? "", params);
    },
    staleTime: 60_000,
  });
}

export function useCumplirPlazoGlobal() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ casoId, plazoId }: { casoId: string; plazoId: string }) => {
      const token = await getToken();
      return cumplirPlazo(casoId, plazoId, token ?? "");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plazos-global"] });
    },
  });
}
