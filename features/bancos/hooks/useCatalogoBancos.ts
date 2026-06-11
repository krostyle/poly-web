import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { listarCatalogoBancos } from "@/lib/api/bancos";

export function useCatalogoBancos() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["bancos", "catalogo"],
    queryFn: async () => {
      const token = await getToken();
      return listarCatalogoBancos(token!);
    },
    staleTime: Infinity, // el catálogo no cambia en runtime
  });
}
