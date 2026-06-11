import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getPlazos, cumplirPlazo } from "@/lib/api/plazos";

export function usePlazosCaso(casoId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["plazos", casoId],
    queryFn: async () => {
      const token = await getToken();
      return getPlazos(casoId, token ?? "");
    },
    enabled: !!casoId,
    staleTime: 60_000,
  });
}

export function useCumplirPlazo(casoId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plazoId: string) => {
      const token = await getToken();
      return cumplirPlazo(casoId, plazoId, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plazos", casoId] });
    },
  });
}
