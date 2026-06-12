import { apiFetch } from "./client";
import type { Tribunal } from "./types";

interface RawTribunal {
  id: string;
  nombre: string;
  region: string;
}

function mapTribunal(raw: RawTribunal): Tribunal {
  return { id: raw.id, nombre: raw.nombre, region: raw.region };
}

export async function listarTribunales(): Promise<Tribunal[]> {
  const data = await apiFetch<{ tribunales: RawTribunal[] }>("/v1/tribunales");
  return (data.tribunales ?? []).map(mapTribunal);
}

export async function crearTribunal(nombre: string, region: string): Promise<Tribunal> {
  const raw = await apiFetch<RawTribunal>("/v1/tribunales", {
    method: "POST",
    body: JSON.stringify({ nombre, region }),
  });
  return mapTribunal(raw);
}
