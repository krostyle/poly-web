import { apiClient } from "./client";
import type { ConfiguracionPlazo } from "./types";

export async function listarConfiguracionPlazos(token: string): Promise<ConfiguracionPlazo[]> {
  return apiClient.request("/v1/configuracion/plazos", { token });
}

export async function actualizarConfiguracionPlazo(
  token: string,
  tipo: string,
  diasHabiles: number
): Promise<void> {
  await apiClient.request(`/v1/configuracion/plazos/${tipo}`, {
    token,
    method: "PUT",
    body: JSON.stringify({ dias_habiles: diasHabiles }),
  });
}
