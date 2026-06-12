import { apiClient } from "./client";
import type { Tribunal } from "./types";

interface RawTribunal {
  id: string;
  nombre: string;
  region: string;
}

function mapTribunal(raw: RawTribunal): Tribunal {
  return { id: raw.id, nombre: raw.nombre, region: raw.region };
}

export async function listarTribunales(token: string): Promise<Tribunal[]> {
  const data = await apiClient.request<{ tribunales: RawTribunal[] }>("/v1/tribunales", { token });
  return (data.tribunales ?? []).map(mapTribunal);
}

export async function crearTribunal(token: string, nombre: string, region: string): Promise<Tribunal> {
  const raw = await apiClient.request<RawTribunal>("/v1/tribunales", {
    method: "POST",
    token,
    body: JSON.stringify({ nombre, region }),
  });
  return mapTribunal(raw);
}
