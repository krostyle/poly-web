import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getDocumentos, subirDocumento } from "@/lib/api/documentos";
import type { TipoDocumento } from "@/lib/api/types";

export function useDocumentosCaso(casoId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["documentos", casoId],
    queryFn: async () => {
      const token = await getToken();
      return getDocumentos(casoId, token ?? "");
    },
    enabled: !!casoId,
    staleTime: 30_000,
  });
}

export function useSubirDocumento(casoId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, tipo }: { file: File; tipo: TipoDocumento }) => {
      const token = await getToken();
      return subirDocumento(casoId, file, tipo, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos", casoId] });
    },
  });
}
