import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getHistorial } from "@/lib/api/casos";

export function useHistorialCaso(casoId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["casos", casoId, "historial"],
    queryFn: async () => {
      const token = await getToken();
      return getHistorial(casoId, token!);
    },
    enabled: !!casoId,
  });
}
