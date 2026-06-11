import { apiClient } from "./client";
import type { CasoListItem, CasoDetalle, CrearCasoPayload, Operacion, HistorialEntry, Estado } from "./types";

// Raw snake_case shapes returned by poly-api

interface RawCasoListItem {
  id: string;
  banco_id: string;
  banco_nombre: string;
  cliente_id: string;
  cliente_rut: string;
  cliente_nombre: string;
  abogado_id: string | null;
  numero_ot: string | null;
  estado: Estado;
  fecha_dj: string;
  denuncia_valida: boolean;
  created_at: string;
}

interface RawOperacion {
  id: string;
  caso_id: string;
  medio_pago: "TARJETA_CREDITO" | "TARJETA_DEBITO" | "TRANSFERENCIA" | "CAJERO";
  relacion: "CUENTA_PROPIA" | "FAMILIAR" | "TERCERO";
  monto_clp: number;
  monto_uf: number | null;
  fecha_op: string;
}

interface RawCaso {
  id: string;
  estudio_id: string;
  banco_id: string;
  cliente_id: string;
  abogado_id: string | null;
  numero_ot: string | null;
  estado: Estado;
  fecha_dj: string;
  fecha_denuncia: string | null;
  denuncia_valida: boolean;
  motivo_termino: string | null;
  created_at: string;
  updated_at: string;
}

interface RawCliente {
  id: string;
  rut: string;
  nombre: string;
  contacto: string | null;
}

interface RawCasoDetalle {
  caso: RawCaso;
  cliente: RawCliente;
  operaciones: RawOperacion[];
}

interface RawListarCasosResponse {
  casos: RawCasoListItem[];
  total: number;
}

interface RawHistorialEntry {
  id: string;
  accion: string;
  detalle: Record<string, unknown>;
  usuario_nombre: string;
  created_at: string;
}

interface RawHistorialResponse {
  historial: RawHistorialEntry[];
}

function mapCasoListItem(raw: RawCasoListItem): CasoListItem {
  return {
    id: raw.id,
    bancoId: raw.banco_id,
    bancoNombre: raw.banco_nombre,
    clienteId: raw.cliente_id,
    clienteRut: raw.cliente_rut,
    clienteNombre: raw.cliente_nombre,
    abogadoId: raw.abogado_id ?? undefined,
    numeroOt: raw.numero_ot ?? undefined,
    estado: raw.estado,
    fechaDj: raw.fecha_dj,
    denunciaValida: raw.denuncia_valida,
    createdAt: raw.created_at,
  };
}

function mapCasoDetalle(raw: RawCasoDetalle): CasoDetalle {
  return {
    caso: {
      id: raw.caso.id,
      estudioId: raw.caso.estudio_id,
      bancoId: raw.caso.banco_id,
      clienteId: raw.caso.cliente_id,
      abogadoId: raw.caso.abogado_id ?? undefined,
      numeroOt: raw.caso.numero_ot ?? undefined,
      estado: raw.caso.estado,
      fechaDj: raw.caso.fecha_dj,
      fechaDenuncia: raw.caso.fecha_denuncia ?? undefined,
      denunciaValida: raw.caso.denuncia_valida,
      motivoTermino: (raw.caso.motivo_termino ?? undefined) as import("./types").MotivoTermino | undefined,
      createdAt: raw.caso.created_at,
      updatedAt: raw.caso.updated_at,
    },
    cliente: {
      id: raw.cliente.id,
      rut: raw.cliente.rut,
      nombre: raw.cliente.nombre,
      contacto: raw.cliente.contacto ?? undefined,
    },
    operaciones: (raw.operaciones ?? []).map((op) => ({
      id: op.id,
      casoId: op.caso_id,
      medioPago: op.medio_pago,
      relacion: op.relacion,
      montoCLP: op.monto_clp,
      montoUF: op.monto_uf ?? undefined,
      fechaOp: op.fecha_op,
    })),
  };
}

export interface CasoFilters {
  q?: string;
  bancoId?: string;
  estado?: Estado;
  soloMios?: boolean;
}

export async function listarCasos(
  token: string,
  filters?: CasoFilters
): Promise<{ casos: CasoListItem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);
  if (filters?.bancoId) params.set("banco_id", filters.bancoId);
  if (filters?.estado) params.set("estado", filters.estado);
  if (filters?.soloMios) params.set("abogado_id", "me");

  const qs = params.toString();
  const raw = await apiClient.request<RawListarCasosResponse>(
    qs ? `/v1/casos?${qs}` : "/v1/casos",
    { token }
  );
  return {
    casos: (raw.casos ?? []).map(mapCasoListItem),
    total: raw.total ?? 0,
  };
}

export async function obtenerCasoDetalle(id: string, token: string): Promise<CasoDetalle> {
  const raw = await apiClient.request<RawCasoDetalle>(`/v1/casos/${id}`, { token });
  return mapCasoDetalle(raw);
}

export async function crearCaso(payload: CrearCasoPayload, token: string): Promise<CasoDetalle> {
  const body = {
    banco_id: payload.bancoId,
    cliente_rut: payload.clienteRut,
    cliente_nombre: payload.clienteNombre,
    cliente_contacto: payload.clienteContacto,
    fecha_dj: payload.fechaDj,
  };
  const raw = await apiClient.request<RawCasoDetalle>("/v1/casos", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return mapCasoDetalle(raw);
}

export async function actualizarCaso(
  id: string,
  patch: {
    abogadoId?: string;
    numeroOt?: string;
    denunciaValida?: boolean;
    fechaDenuncia?: string;
  },
  token: string
): Promise<CasoDetalle> {
  const body: Record<string, unknown> = {};
  if (patch.abogadoId !== undefined) body.abogado_id = patch.abogadoId;
  if (patch.numeroOt !== undefined) body.numero_ot = patch.numeroOt;
  if (patch.denunciaValida !== undefined) body.denuncia_valida = patch.denunciaValida;
  if (patch.fechaDenuncia !== undefined) body.fecha_denuncia = patch.fechaDenuncia;
  const raw = await apiClient.request<RawCasoDetalle>(`/v1/casos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
  return mapCasoDetalle(raw);
}

export async function transicionarEstado(
  id: string,
  estado: string,
  motivoTermino: string | undefined,
  token: string,
  forzar?: boolean
): Promise<void> {
  return apiClient.request<void>(`/v1/casos/${id}/transicion`, {
    method: "POST",
    body: JSON.stringify({ estado, motivo_termino: motivoTermino, forzar: forzar ?? false }),
    token,
  });
}

export async function getHistorial(casoId: string, token: string): Promise<HistorialEntry[]> {
  const raw = await apiClient.request<RawHistorialResponse>(`/v1/casos/${casoId}/historial`, { token });
  return (raw.historial ?? []).map((e) => ({
    id: e.id,
    accion: e.accion,
    detalle: e.detalle ?? {},
    usuarioNombre: e.usuario_nombre,
    createdAt: e.created_at,
  }));
}

export async function agregarOperacion(
  casoId: string,
  op: {
    medioPago: string;
    relacion: string;
    montoCLP: number;
    montoUF?: number;
    fechaOp: string;
  },
  token: string
): Promise<Operacion> {
  const body = {
    medio_pago: op.medioPago,
    relacion: op.relacion,
    monto_clp: op.montoCLP,
    monto_uf: op.montoUF,
    fecha_op: op.fechaOp,
  };
  const raw = await apiClient.request<RawOperacion>(`/v1/casos/${casoId}/operaciones`, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return {
    id: raw.id,
    casoId: raw.caso_id,
    medioPago: raw.medio_pago,
    relacion: raw.relacion,
    montoCLP: raw.monto_clp,
    montoUF: raw.monto_uf ?? undefined,
    fechaOp: raw.fecha_op,
  };
}
