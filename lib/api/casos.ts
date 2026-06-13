import { apiClient } from "./client";
import type {
  CasoListItem, CasoDetalle, CrearCasoPayload, Operacion, HistorialEntry,
  Estado, EstadoDenuncia, ResultadoJPL, ResultadoSentencia,
  AdmisibilidadDemanda, ResultadoReposicion, ResultadoAudiencia, Dolo, TipoArtefacto,
} from "./types";

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
  fecha_dj: string | null;
  estado_denuncia: EstadoDenuncia;
  total_clp: number;
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
  fecha_dj: string | null;
  fecha_denuncia: string | null;
  estado_denuncia: EstadoDenuncia;
  motivo_termino: string | null;
  // Caso context
  monto_reclamado: number | null;
  dolo: Dolo | null;
  tipo_artefacto: TipoArtefacto | null;
  // MP
  rol_mp: string | null;
  tribunal: string | null;
  region: string | null;
  resultado_jpl: ResultadoJPL | null;
  fecha_resolucion_jpl: string | null;
  fecha_medida_precautoria: string | null;
  abono: boolean;
  monto_abono: number | null;
  // Demanda
  rol_demanda: string | null;
  fecha_demanda: string | null;
  admisibilidad_demanda: AdmisibilidadDemanda | null;
  reposicion_interpuesta: boolean;
  resultado_reposicion: ResultadoReposicion | null;
  fecha_notificacion_demanda: string | null;
  // Audiencia
  fecha_audiencia: string | null;
  resultado_audiencia: ResultadoAudiencia | null;
  // Sentencia
  fecha_sentencia: string | null;
  resultado_sentencia: ResultadoSentencia | null;
  sentencia_apelada: boolean;
  sentencia_ejecutoriada: boolean;
  // Segunda instancia
  rol_segunda_instancia: string | null;
  corte_apelaciones: string | null;
  fecha_fallo_corte: string | null;
  resultado_segunda_instancia: ResultadoSentencia | null;
  segunda_instancia_ejecutoriada: boolean;
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
    fechaDj: raw.fecha_dj!,
    estadoDenuncia: raw.estado_denuncia,
    totalCLP: raw.total_clp,
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
      fechaDj: raw.caso.fecha_dj!,
      fechaDenuncia: raw.caso.fecha_denuncia ?? undefined,
      estadoDenuncia: raw.caso.estado_denuncia,
      motivoTermino: (raw.caso.motivo_termino ?? undefined) as import("./types").MotivoTermino | undefined,
      montoReclamado: raw.caso.monto_reclamado ?? undefined,
      dolo: raw.caso.dolo ?? undefined,
      tipoArtefacto: raw.caso.tipo_artefacto ?? undefined,
      rolMp: raw.caso.rol_mp ?? undefined,
      tribunal: raw.caso.tribunal ?? undefined,
      region: raw.caso.region ?? undefined,
      resultadoJpl: raw.caso.resultado_jpl ?? undefined,
      fechaResolucionJpl: raw.caso.fecha_resolucion_jpl ?? undefined,
      fechaMedidaPrecautoria: raw.caso.fecha_medida_precautoria ?? undefined,
      abono: raw.caso.abono,
      montoAbono: raw.caso.monto_abono ?? undefined,
      rolDemanda: raw.caso.rol_demanda ?? undefined,
      fechaDemanda: raw.caso.fecha_demanda ?? undefined,
      admisibilidadDemanda: raw.caso.admisibilidad_demanda ?? undefined,
      reposicionInterpuesta: raw.caso.reposicion_interpuesta,
      resultadoReposicion: raw.caso.resultado_reposicion ?? undefined,
      fechaNotificacionDemanda: raw.caso.fecha_notificacion_demanda ?? undefined,
      fechaAudiencia: raw.caso.fecha_audiencia ?? undefined,
      resultadoAudiencia: raw.caso.resultado_audiencia ?? undefined,
      fechaSentencia: raw.caso.fecha_sentencia ?? undefined,
      resultadoSentencia: raw.caso.resultado_sentencia ?? undefined,
      sentenciaApelada: raw.caso.sentencia_apelada,
      sentenciaEjecutoriada: raw.caso.sentencia_ejecutoriada,
      rolSegundaInstancia: raw.caso.rol_segunda_instancia ?? undefined,
      corteApelaciones: raw.caso.corte_apelaciones ?? undefined,
      fechaFalloCorte: raw.caso.fecha_fallo_corte ?? undefined,
      resultadoSegundaInstancia: raw.caso.resultado_segunda_instancia ?? undefined,
      segundaInstanciaEjecutoriada: raw.caso.segunda_instancia_ejecutoriada,
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
  excluirCierre?: boolean;
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
  if (filters?.excluirCierre === false) params.set("excluir_cierre", "false");

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
  const body: Record<string, unknown> = {
    banco_id: payload.bancoId,
    cliente_rut: payload.clienteRut,
    cliente_nombre: payload.clienteNombre,
    cliente_contacto: payload.clienteContacto,
  };
  if (payload.fechaDj) body.fecha_dj = payload.fechaDj;
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
    estadoDenuncia?: EstadoDenuncia;
    fechaDenuncia?: string;
    fechaDj?: string;
    // Caso context
    montoReclamado?: number;
    dolo?: Dolo | "";
    tipoArtefacto?: TipoArtefacto | "";
    // MP
    rolMp?: string;
    tribunal?: string;
    region?: string;
    resultadoJpl?: ResultadoJPL | "";
    fechaResolucionJpl?: string;
    fechaMedidaPrecautoria?: string;
    abono?: boolean;
    montoAbono?: number;
    // Demanda
    rolDemanda?: string;
    fechaDemanda?: string;
    admisibilidadDemanda?: AdmisibilidadDemanda | "";
    reposicionInterpuesta?: boolean;
    resultadoReposicion?: ResultadoReposicion | "";
    fechaNotificacionDemanda?: string;
    // Audiencia
    fechaAudiencia?: string;
    resultadoAudiencia?: ResultadoAudiencia | "";
    // Sentencia
    fechaSentencia?: string;
    resultadoSentencia?: ResultadoSentencia | "";
    sentenciaApelada?: boolean;
    sentenciaEjecutoriada?: boolean;
    // Segunda instancia
    rolSegundaInstancia?: string;
    corteApelaciones?: string;
    fechaFalloCorte?: string;
    resultadoSegundaInstancia?: ResultadoSentencia | "";
    segundaInstanciaEjecutoriada?: boolean;
  },
  token: string
): Promise<CasoDetalle> {
  const body: Record<string, unknown> = {};
  if (patch.abogadoId !== undefined) body.abogado_id = patch.abogadoId;
  if (patch.numeroOt !== undefined) body.numero_ot = patch.numeroOt;
  if (patch.estadoDenuncia !== undefined) body.estado_denuncia = patch.estadoDenuncia;
  if (patch.fechaDenuncia !== undefined) body.fecha_denuncia = patch.fechaDenuncia;
  if (patch.fechaDj !== undefined) body.fecha_dj = patch.fechaDj;
  if (patch.montoReclamado !== undefined) body.monto_reclamado = patch.montoReclamado;
  if (patch.dolo !== undefined) body.dolo = patch.dolo;
  if (patch.tipoArtefacto !== undefined) body.tipo_artefacto = patch.tipoArtefacto;
  if (patch.rolMp !== undefined) body.rol_mp = patch.rolMp;
  if (patch.tribunal !== undefined) body.tribunal = patch.tribunal;
  if (patch.region !== undefined) body.region = patch.region;
  if (patch.resultadoJpl !== undefined) body.resultado_jpl = patch.resultadoJpl;
  if (patch.fechaResolucionJpl !== undefined) body.fecha_resolucion_jpl = patch.fechaResolucionJpl;
  if (patch.fechaMedidaPrecautoria !== undefined) body.fecha_medida_precautoria = patch.fechaMedidaPrecautoria;
  if (patch.abono !== undefined) body.abono = patch.abono;
  if (patch.montoAbono !== undefined) body.monto_abono = patch.montoAbono;
  if (patch.rolDemanda !== undefined) body.rol_demanda = patch.rolDemanda;
  if (patch.fechaDemanda !== undefined) body.fecha_demanda = patch.fechaDemanda;
  if (patch.admisibilidadDemanda !== undefined) body.admisibilidad_demanda = patch.admisibilidadDemanda;
  if (patch.reposicionInterpuesta !== undefined) body.reposicion_interpuesta = patch.reposicionInterpuesta;
  if (patch.resultadoReposicion !== undefined) body.resultado_reposicion = patch.resultadoReposicion;
  if (patch.fechaNotificacionDemanda !== undefined) body.fecha_notificacion_demanda = patch.fechaNotificacionDemanda;
  if (patch.fechaAudiencia !== undefined) body.fecha_audiencia = patch.fechaAudiencia;
  if (patch.resultadoAudiencia !== undefined) body.resultado_audiencia = patch.resultadoAudiencia;
  if (patch.fechaSentencia !== undefined) body.fecha_sentencia = patch.fechaSentencia;
  if (patch.resultadoSentencia !== undefined) body.resultado_sentencia = patch.resultadoSentencia;
  if (patch.sentenciaApelada !== undefined) body.sentencia_apelada = patch.sentenciaApelada;
  if (patch.sentenciaEjecutoriada !== undefined) body.sentencia_ejecutoriada = patch.sentenciaEjecutoriada;
  if (patch.rolSegundaInstancia !== undefined) body.rol_segunda_instancia = patch.rolSegundaInstancia;
  if (patch.corteApelaciones !== undefined) body.corte_apelaciones = patch.corteApelaciones;
  if (patch.fechaFalloCorte !== undefined) body.fecha_fallo_corte = patch.fechaFalloCorte;
  if (patch.resultadoSegundaInstancia !== undefined) body.resultado_segunda_instancia = patch.resultadoSegundaInstancia;
  if (patch.segundaInstanciaEjecutoriada !== undefined) body.segunda_instancia_ejecutoriada = patch.segundaInstanciaEjecutoriada;
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

export async function eliminarCaso(id: string, token: string): Promise<void> {
  await apiClient.request<void>(`/v1/casos/${id}`, { method: "DELETE", token });
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
