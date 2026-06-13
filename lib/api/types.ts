// Mirrors of the Go domain types

export type Estado =
  | "INGRESO"
  | "PREJUDICIAL"
  | "PAGO_NORMATIVO"
  | "JUDICIAL"
  | "AUDIENCIA"
  | "SENTENCIA"
  | "APELACION"
  | "SENTENCIA_SEGUNDA"
  | "CUMPLIMIENTO"
  | "TERMINADO"
  | "CIERRE";

export type MotivoTermino =
  | "IMPROCEDENTE"
  | "EXTEMPORANEO"
  | "BUSQUEDAS_NEGATIVAS"
  | "DEUDOR_FALLECIDO"
  | "DESISTIMIENTO_CLIENTE"
  | "DESISTIMIENTO_BANCO"
  | "DESISTIMIENTO_DENUNCIA_INVALIDA"
  | "DESISTIMIENTO_SIN_DENUNCIA"
  | "SENTENCIA_FAVORABLE_BANCO"
  | "SENTENCIA_DESFAVORABLE_BANCO"
  | "AVENIMIENTO"
  | "ABANDONO_PROCEDIMIENTO";

export type Semaforo = "VERDE" | "AMARILLO" | "ROJO" | "VENCIDO";

export type EstadoDenuncia = "SOLICITADA" | "VALIDA" | "INVALIDA" | "SIN_DENUNCIA";

export type TipoPlazo =
  | "ANALISIS_INTERNO"
  | "RESTITUCION"
  | "ASIGNACION"
  | "PRECAUTELAR"
  | "RESOLUCION_JPL"
  | "DEMANDA"
  | "RESTITUCION_RECHAZO"
  | "RESPUESTA_DENUNCIA";

export type ResultadoJPL =
  | "ACEPTA_SUSPENSION"
  | "RECHAZA_SUSPENSION"
  | "FALLO_FAVORABLE"
  | "FALLO_DESFAVORABLE";

export interface Caso {
  id: string;
  estudioId: string;
  bancoId: string;
  clienteId: string;
  abogadoId?: string;
  numeroOt?: string;
  estado: Estado;
  fechaDj: string; // ISO date — obligatoria
  fechaDenuncia?: string;
  estadoDenuncia: EstadoDenuncia;
  motivoTermino?: MotivoTermino;
  numeroRol?: string;
  tribunal?: string;
  region?: string;
  resultadoJpl?: ResultadoJPL;
  fechaResolucionJpl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracionPlazo {
  tipo: string;
  label: string;
  diasHabiles: number;
  esDefault: boolean;
}

export interface Plazo {
  id: string;
  casoId: string;
  tipo: TipoPlazo;
  fechaInicio: string;
  diasHabiles: number;
  fechaLimite: string;
  cumplido: boolean;
  fechaCumplido?: string;
  diasRestantes?: number;
  semaforo?: Semaforo;
}

export interface Operacion {
  id: string;
  casoId: string;
  medioPago: "TARJETA_CREDITO" | "TARJETA_DEBITO" | "TRANSFERENCIA" | "CAJERO";
  relacion: "CUENTA_PROPIA" | "FAMILIAR" | "TERCERO";
  montoCLP: number;
  montoUF?: number;
  fechaOp: string;
}

export interface CasoListItem {
  id: string;
  bancoId: string;
  bancoNombre: string;
  clienteId: string;
  clienteRut: string;
  clienteNombre: string;
  abogadoId?: string;
  numeroOt?: string;
  estado: Estado;
  fechaDj: string; // obligatoria
  estadoDenuncia: EstadoDenuncia;
  totalCLP: number;
  createdAt: string;
}

export interface Cliente {
  id: string;
  rut: string;
  nombre: string;
  contacto?: string;
}

export interface CasoDetalle {
  caso: Caso;
  cliente: Cliente;
  operaciones: Operacion[];
}

export interface CrearCasoPayload {
  bancoId: string;
  clienteRut: string;
  clienteNombre: string;
  clienteContacto?: string;
  fechaDj: string; // obligatoria
}

export interface HistorialEntry {
  id: string;
  accion: string;
  detalle: Record<string, unknown>;
  usuarioNombre: string;
  createdAt: string;
}

export type TipoDocumento =
  | "CARTOLA"
  | "EVIDENCIA"
  | "DJ"
  | "DENUNCIA"
  | "CARTA_BANCO"
  | "DEMANDA"
  | "RESOLUCION"
  | "OTRO";

export interface Documento {
  id: string;
  tipo: TipoDocumento;
  nombre: string;
  blobUrl: string;
  subidoPor?: string;
  createdAt: string;
}

export interface Tribunal {
  id: string;
  nombre: string;
  region: string;
}

export type Rol = "ADMIN" | "ABOGADO" | "TRAMITADOR";

export interface Banco {
  id: string;
  nombre: string;
  createdAt: string;
}

export interface UsuarioBanco {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface MeResponse {
  estudio: { id: string; nombre: string };
  usuario: { id: string; nombre: string; email: string; rol: Rol; onboarding_completado: boolean };
  bancos: Array<{ id: string; nombre: string }>;
}
