import { useQuery } from "@tanstack/react-query";
import { listarTribunales } from "@/lib/api/tribunales";

export function useTribunales() {
  return useQuery({
    queryKey: ["tribunales"],
    queryFn: listarTribunales,
    staleTime: 1000 * 60 * 30, // 30 min — list changes rarely
  });
}
