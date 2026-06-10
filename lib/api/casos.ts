import { apiClient } from "./client";
import type { Caso } from "./types";

export async function listarCasos(token: string): Promise<Caso[]> {
  return apiClient.request<Caso[]>("/v1/casos", { token });
}

export async function obtenerCaso(id: string, token: string): Promise<Caso> {
  return apiClient.request<Caso>(`/v1/casos/${id}`, { token });
}

export async function crearCaso(
  payload: Pick<Caso, "bancoId" | "clienteId" | "fechaDj">,
  token: string
): Promise<Caso> {
  return apiClient.request<Caso>("/v1/casos", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function transicionarEstado(
  id: string,
  estado: string,
  motivoTermino: string | undefined,
  token: string
): Promise<void> {
  return apiClient.request<void>(`/v1/casos/${id}/transicion`, {
    method: "POST",
    body: JSON.stringify({ estado, motivoTermino }),
    token,
  });
}
