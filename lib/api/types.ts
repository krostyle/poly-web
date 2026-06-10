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
