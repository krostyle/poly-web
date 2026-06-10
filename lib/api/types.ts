// Mirrors of the Go domain types

export type Estado =
  | "LLAMADA"
  | "REVISION"
  | "SUSPENSION"
  | "PRE_JUDICIALIZACION"
  | "RESTITUCION"
  | "JUDICIALIZACION"
  | "CIERRE"
  | "TERMINADO";

export type Semaforo = "VERDE" | "AMARILLO" | "ROJO" | "VENCIDO";

export type TipoPlazo =
  | "ANALISIS_INTERNO"
  | "RESTITUCION"
  | "ASIGNACION"
  | "PRECAUTELAR"
  | "DEMANDA"
  | "RESTITUCION_RECHAZO";

export interface Caso {
  id: string;
  estudioId: string;
  bancoId: string;
  clienteId: string;
  abogadoId?: string;
  numeroOt?: string;
  estado: Estado;
  fechaDj: string; // ISO date
  fechaDenuncia?: string;
  denunciaValida: boolean;
  motivoTermino?: string;
  createdAt: string;
  updatedAt: string;
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
  fechaDj: string;
  denunciaValida: boolean;
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
  fechaDj: string;
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
  usuario: { id: string; nombre: string; email: string; rol: Rol };
  bancos: Array<{ id: string; nombre: string }>;
}
