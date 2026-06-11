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
    }: {
      estado: string;
      motivoTermino?: string;
    }) => {
      const token = await getToken();
      return transicionarEstado(casoId, estado, motivoTermino, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casos", casoId] });
      qc.invalidateQueries({ queryKey: ["casos", casoId, "historial"] });
      qc.invalidateQueries({ queryKey: ["casos"] });
    },
  });
}
