import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { transicionarEstado } from "@/lib/api/casos";

export function useTransicionarEstado(casoId: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      estado,
      motivoTermino,
      forzar,
    }: {
      estado: string;
      motivoTermino?: string;
      forzar?: boolean;
    }) => {
      const token = await getToken();
      return transicionarEstado(casoId, estado, motivoTermino, token!, forzar);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casos", casoId] });
      qc.invalidateQueries({ queryKey: ["casos", casoId, "historial"] });
      qc.invalidateQueries({ queryKey: ["casos"] });
      qc.invalidateQueries({ queryKey: ["plazos", casoId] });
    },
  });
}
