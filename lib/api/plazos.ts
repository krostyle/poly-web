import { apiClient } from "./client";
import type { Plazo, Semaforo, TipoPlazo, Estado } from "./types";

// ── Per-case plazos ───────────────────────────────────────────────────────────

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
  const raw = await apiClient.request<{ plazos: RawPlazo[] }>(`/v1/casos/${casoId}/plazos`, { token });
  return (raw.plazos ?? []).map(mapPlazo);
}

export async function cumplirPlazo(casoId: string, plazoId: string, token: string): Promise<void> {
  return apiClient.request<void>(`/v1/casos/${casoId}/plazos/${plazoId}/cumplir`, {
    method: "POST",
    token,
  });
}

// ── Global plazos ─────────────────────────────────────────────────────────────

export interface PlazoGlobal {
  id: string;
  casoId: string;
  numeroOt?: string;
  clienteNombre: string;
  clienteRut: string;
  bancoNombre: string;
  estado: Estado;
  tipo: TipoPlazo;
  fechaInicio: string;
  fechaLimite: string;
  diasHabiles: number;
  diasRestantes: number;
  semaforo: Semaforo;
}

interface RawPlazoGlobal {
  id: string;
  caso_id: string;
  numero_ot?: string;
  cliente_nombre: string;
  cliente_rut: string;
  banco_nombre: string;
  estado: Estado;
  tipo: TipoPlazo;
  fecha_inicio: string;
  fecha_limite: string;
  dias_habiles: number;
  dias_restantes: number;
  semaforo: Semaforo;
}

function mapPlazoGlobal(raw: RawPlazoGlobal): PlazoGlobal {
  return {
    id: raw.id,
    casoId: raw.caso_id,
    numeroOt: raw.numero_ot,
    clienteNombre: raw.cliente_nombre,
    clienteRut: raw.cliente_rut,
    bancoNombre: raw.banco_nombre,
    estado: raw.estado,
    tipo: raw.tipo,
    fechaInicio: raw.fecha_inicio,
    fechaLimite: raw.fecha_limite,
    diasHabiles: raw.dias_habiles,
    diasRestantes: raw.dias_restantes,
    semaforo: raw.semaforo,
  };
}

export async function getPlazosGlobal(
  token: string,
  params?: { tipo?: string; semaforo?: string }
): Promise<PlazoGlobal[]> {
  const qs = new URLSearchParams();
  if (params?.tipo) qs.set("tipo", params.tipo);
  if (params?.semaforo) qs.set("semaforo", params.semaforo);
  const path = `/v1/plazos${qs.size ? `?${qs}` : ""}`;
  const raw = await apiClient.request<{ plazos: RawPlazoGlobal[] }>(path, { token });
  return (raw.plazos ?? []).map(mapPlazoGlobal);
}
