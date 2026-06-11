import { apiClient } from "./client";
import type { Plazo, Semaforo, TipoPlazo } from "./types";

interface RawPlazo {
  id: string;
  tipo: TipoPlazo;
  fecha_inicio: string;
  fecha_limite: string;
  dias_habiles: number;
  dias_restantes: number;
  semaforo: Semaforo;
  cumplido: boolean;
  fecha_cumplido?: string;
}

interface RawPlazosResponse {
  plazos: RawPlazo[];
}

function mapPlazo(raw: RawPlazo): Plazo {
  return {
    id: raw.id,
    casoId: "",
    tipo: raw.tipo,
    fechaInicio: raw.fecha_inicio,
    fechaLimite: raw.fecha_limite,
    diasHabiles: raw.dias_habiles,
    diasRestantes: raw.dias_restantes,
    semaforo: raw.semaforo,
    cumplido: raw.cumplido,
    fechaCumplido: raw.fecha_cumplido,
  };
}

export async function getPlazos(casoId: string, token: string): Promise<Plazo[]> {
  const raw = await apiClient.request<RawPlazosResponse>(`/v1/casos/${casoId}/plazos`, { token });
  return (raw.plazos ?? []).map(mapPlazo);
}

export async function cumplirPlazo(casoId: string, plazoId: string, token: string): Promise<void> {
  return apiClient.request<void>(`/v1/casos/${casoId}/plazos/${plazoId}/cumplir`, {
    method: "POST",
    token,
  });
}
