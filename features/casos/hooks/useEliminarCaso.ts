import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { eliminarCaso } from "@/lib/api/casos";

export function useEliminarCaso(casoId: string, onSuccess?: () => void) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return eliminarCaso(casoId, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      onSuccess?.();
    },
  });
}
