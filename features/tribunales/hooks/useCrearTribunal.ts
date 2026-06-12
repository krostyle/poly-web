import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearTribunal } from "@/lib/api/tribunales";

export function useCrearTribunal(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nombre, region }: { nombre: string; region: string }) =>
      crearTribunal(nombre, region),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tribunales"] });
      onSuccess?.();
    },
  });
}
