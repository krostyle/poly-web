import { apiClient } from "./client";
import type { Semaforo, Estado } from "./types";

export interface DashboardPlazoCritico {
  id: string;
  tipo: string;
  fechaLimite: string;
  diasRestantes: number;
  semaforo: Semaforo;
}

export interface CasoPorVencer {
  casoId: string;
  bancoId: string;
  bancoNombre: string;
  numeroOt?: string;
  clienteRut: string;
  clienteNombre: string;
  estado: Estado;
  plazoCritico: DashboardPlazoCritico;
}

export interface CasoNuevo {
  casoId: string;
  bancoId: string;
  bancoNombre: string;
  clienteRut: string;
  clienteNombre: string;
  abogadoId?: string;
  createdAt: string;
}

export interface CasoEstancado {
  casoId: string;
  bancoId: string;
  bancoNombre: string;
  numeroOt?: string;
  clienteRut: string;
  clienteNombre: string;
  estado: Estado;
  ultimoMovimiento: string;
  diasEstancado: number;
}

export interface CargaAbogado {
  abogadoId: string;
  nombre: string;
  total: number;
  porVencer: number;
  vencidos: number;
}

// ── Raw shapes from API (snake_case) ──────────────────────────────────────────

interface RawPlazoCritico {
  id: string;
  tipo: string;
  fecha_limite: string;
  dias_restantes: number;
  semaforo: Semaforo;
}

interface RawCasoPorVencer {
  caso_id: string;
  banco_id: string;
  banco_nombre: string;
  numero_ot?: string;
  cliente_rut: string;
  cliente_nombre: string;
  estado: Estado;
  plazo_critico: RawPlazoCritico;
}

interface RawCasoNuevo {
  caso_id: string;
  banco_id: string;
  banco_nombre: string;
  cliente_rut: string;
  cliente_nombre: string;
  abogado_id?: string;
  created_at: string;
}

interface RawCasoEstancado {
  caso_id: string;
  banco_id: string;
  banco_nombre: string;
  numero_ot?: string;
  cliente_rut: string;
  cliente_nombre: string;
  estado: Estado;
  ultimo_movimiento: string;
  dias_estancado: number;
}

interface RawCargaAbogado {
  abogado_id: string;
  nombre: string;
  total: number;
  por_vencer: number;
  vencidos: number;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapPorVencer(r: RawCasoPorVencer): CasoPorVencer {
  return {
    casoId: r.caso_id,
    bancoId: r.banco_id,
    bancoNombre: r.banco_nombre,
    numeroOt: r.numero_ot,
    clienteRut: r.cliente_rut,
    clienteNombre: r.cliente_nombre,
    estado: r.estado,
    plazoCritico: {
      id: r.plazo_critico.id,
      tipo: r.plazo_critico.tipo,
      fechaLimite: r.plazo_critico.fecha_limite,
      diasRestantes: r.plazo_critico.dias_restantes,
      semaforo: r.plazo_critico.semaforo,
    },
  };
}

function mapNuevo(r: RawCasoNuevo): CasoNuevo {
  return {
    casoId: r.caso_id,
    bancoId: r.banco_id,
    bancoNombre: r.banco_nombre,
    clienteRut: r.cliente_rut,
    clienteNombre: r.cliente_nombre,
    abogadoId: r.abogado_id,
    createdAt: r.created_at,
  };
}

function mapEstancado(r: RawCasoEstancado): CasoEstancado {
  return {
    casoId: r.caso_id,
    bancoId: r.banco_id,
    bancoNombre: r.banco_nombre,
    numeroOt: r.numero_ot,
    clienteRut: r.cliente_rut,
    clienteNombre: r.cliente_nombre,
    estado: r.estado,
    ultimoMovimiento: r.ultimo_movimiento,
    diasEstancado: r.dias_estancado,
  };
}

function mapAbogado(r: RawCargaAbogado): CargaAbogado {
  return {
    abogadoId: r.abogado_id,
    nombre: r.nombre,
    total: r.total,
    porVencer: r.por_vencer,
    vencidos: r.vencidos,
  };
}

// ── Fetch functions ───────────────────────────────────────────────────────────

export async function getDashboardPorVencer(
  token: string,
  params?: { dias?: number; bancoId?: string }
): Promise<CasoPorVencer[]> {
  const qs = new URLSearchParams();
  if (params?.dias) qs.set("dias", String(params.dias));
  if (params?.bancoId) qs.set("bancoId", params.bancoId);
  const path = `/v1/dashboard/por-vencer${qs.size ? `?${qs}` : ""}`;
  const raw = await apiClient.request<{ items: RawCasoPorVencer[] }>(path, { token });
  return (raw.items ?? []).map(mapPorVencer);
}

export async function getDashboardNuevos(
  token: string,
  params?: { bancoId?: string }
): Promise<CasoNuevo[]> {
  const qs = new URLSearchParams();
  if (params?.bancoId) qs.set("bancoId", params.bancoId);
  const path = `/v1/dashboard/nuevos${qs.size ? `?${qs}` : ""}`;
  const raw = await apiClient.request<{ items: RawCasoNuevo[] }>(path, { token });
  return (raw.items ?? []).map(mapNuevo);
}

export async function getDashboardEstancados(
  token: string,
  params?: { dias?: number; bancoId?: string }
): Promise<CasoEstancado[]> {
  const qs = new URLSearchParams();
  if (params?.dias) qs.set("dias", String(params.dias));
  if (params?.bancoId) qs.set("bancoId", params.bancoId);
  const path = `/v1/dashboard/estancados${qs.size ? `?${qs}` : ""}`;
  const raw = await apiClient.request<{ items: RawCasoEstancado[] }>(path, { token });
  return (raw.items ?? []).map(mapEstancado);
}

export async function getDashboardPorAbogado(
  token: string,
  params?: { bancoId?: string }
): Promise<CargaAbogado[]> {
  const qs = new URLSearchParams();
  if (params?.bancoId) qs.set("bancoId", params.bancoId);
  const path = `/v1/dashboard/por-abogado${qs.size ? `?${qs}` : ""}`;
  const raw = await apiClient.request<{ abogados: RawCargaAbogado[] }>(path, { token });
  return (raw.abogados ?? []).map(mapAbogado);
}
