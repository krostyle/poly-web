import { apiClient } from "./client";

export interface BootstrapResponse {
  estudio: { id: string; nombre: string };
  usuario: { id: string; nombre: string; email: string; rol: string };
  bancos: { id: string; nombre: string }[];
}

export async function bootstrap(
  token: string,
  data: { org_name: string; user_name: string; user_email: string }
): Promise<BootstrapResponse> {
  return apiClient.request<BootstrapResponse>("/v1/bootstrap", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}
