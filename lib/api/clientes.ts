import { apiClient } from "./client";
import type { Cliente } from "./types";

interface RawCliente {
  id: string;
  estudio_id: string;
  banco_id: string;
  rut: string;
  nombre: string;
  contacto: string | null;
}

function mapCliente(raw: RawCliente): Cliente {
  return {
    id: raw.id,
    rut: raw.rut,
    nombre: raw.nombre,
    contacto: raw.contacto ?? undefined,
  };
}

export async function actualizarCliente(
  id: string,
  patch: { nombre?: string; contacto?: string | null },
  token: string
): Promise<Cliente> {
  const body: Record<string, unknown> = {};
  if (patch.nombre !== undefined) body.nombre = patch.nombre;
  if (patch.contacto !== undefined) body.contacto = patch.contacto;

  const raw = await apiClient.request<RawCliente>(`/v1/clientes/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
  return mapCliente(raw);
}
