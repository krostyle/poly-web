"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { actualizarCaso } from "@/lib/api/casos";

export function useActualizarCaso(casoId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: {
      abogadoId?: string;
      numeroOt?: string;
      estadoDenuncia?: import("@/lib/api/types").EstadoDenuncia;
      fechaDenuncia?: string;
      fechaDj?: string;
      numeroRol?: string;
      tribunal?: string;
      region?: string;
      resultadoJpl?: import("@/lib/api/types").ResultadoJPL | "";
      fechaResolucionJpl?: string;
      fechaMedidaPrecautoria?: string;
      fechaDemanda?: string;
      fechaNotificacionDemanda?: string;
      fechaSentencia?: string;
      resultadoSentencia?: import("@/lib/api/types").ResultadoSentencia | "";
      sentenciaApelada?: boolean;
      sentenciaEjecutoriada?: boolean;
      rolSegundaInstancia?: string;
      corteApelaciones?: string;
      fechaFalloCorte?: string;
      resultadoSegundaInstancia?: import("@/lib/api/types").ResultadoSentencia | "";
      segundaInstanciaEjecutoriada?: boolean;
    }) => {
      const token = await getToken();
      return actualizarCaso(casoId, patch, token ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos", casoId] });
      queryClient.invalidateQueries({ queryKey: ["plazos", casoId] });
    },
  });
}
