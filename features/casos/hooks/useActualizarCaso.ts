"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { actualizarCaso } from "@/lib/api/casos";
import type {
  EstadoDenuncia, ResultadoJPL, ResultadoSentencia,
  AdmisibilidadDemanda, ResultadoReposicion, ResultadoAudiencia, Dolo, TipoArtefacto,
} from "@/lib/api/types";

export function useActualizarCaso(casoId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: {
      abogadoId?: string;
      numeroOt?: string;
      estadoDenuncia?: EstadoDenuncia;
      fechaDenuncia?: string;
      fechaDj?: string;
      montoReclamado?: number;
      dolo?: Dolo | "";
      tipoArtefacto?: TipoArtefacto | "";
      rolMp?: string;
      tribunal?: string;
      region?: string;
      resultadoJpl?: ResultadoJPL | "";
      fechaResolucionJpl?: string;
      fechaMedidaPrecautoria?: string;
      abono?: boolean;
      montoAbono?: number;
      rolDemanda?: string;
      fechaDemanda?: string;
      admisibilidadDemanda?: AdmisibilidadDemanda | "";
      reposicionInterpuesta?: boolean;
      resultadoReposicion?: ResultadoReposicion | "";
      fechaNotificacionDemanda?: string;
      fechaAudiencia?: string;
      resultadoAudiencia?: ResultadoAudiencia | "";
      fechaSentencia?: string;
      resultadoSentencia?: ResultadoSentencia | "";
      sentenciaApelada?: boolean;
      sentenciaEjecutoriada?: boolean;
      rolSegundaInstancia?: string;
      corteApelaciones?: string;
      fechaFalloCorte?: string;
      resultadoSegundaInstancia?: ResultadoSentencia | "";
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
