import { apiClient } from "./client";
import type { Rol } from "./types";

export interface UsuarioEstudio {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export async function getUsuarios(token: string): Promise<UsuarioEstudio[]> {
  const raw = await apiClient.request<{ usuarios: UsuarioEstudio[] }>("/v1/usuarios", { token });
  return raw.usuarios ?? [];
}

export async function invitarUsuario(
  token: string,
  email: string,
  rol: Rol
): Promise<void> {
  await apiClient.request<{ message: string }>("/v1/usuarios/invitar", {
    method: "POST",
    token,
    body: JSON.stringify({ email, rol }),
  });
}

export async function completarOnboarding(
  token: string,
  rol: "ABOGADO" | "TRAMITADOR"
): Promise<UsuarioEstudio> {
  return apiClient.request<UsuarioEstudio>("/v1/me/rol", {
    method: "PATCH",
    token,
    body: JSON.stringify({ rol }),
  });
}

export async function actualizarRolUsuario(
  token: string,
  id: string,
  rol: Rol
): Promise<UsuarioEstudio> {
  return apiClient.request<UsuarioEstudio>(`/v1/usuarios/${id}/rol`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ rol }),
  });
}
