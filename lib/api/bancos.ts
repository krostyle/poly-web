import { apiClient } from "./client";
import type { Banco, UsuarioBanco } from "./types";

type RawBanco = Record<string, unknown>;
type RawUser = Record<string, unknown>;

function mapBanco(r: RawBanco): Banco {
  return { id: r.id as string, nombre: r.nombre as string, createdAt: r.created_at as string };
}

function mapUsuarioBanco(r: RawUser): UsuarioBanco {
  return {
    id: r.id as string,
    nombre: r.nombre as string,
    email: r.email as string,
    rol: r.rol as UsuarioBanco["rol"],
  };
}

export async function listarCatalogoBancos(token: string): Promise<string[]> {
  const res = await apiClient.request<{ bancos: string[] }>("/v1/bancos/catalogo", { token });
  return res.bancos ?? [];
}

export async function listarBancos(token: string): Promise<Banco[]> {
  const res = await apiClient.request<{ bancos: RawBanco[] }>("/v1/bancos", { token });
  return (res.bancos ?? []).map(mapBanco);
}

export async function crearBanco(nombre: string, token: string): Promise<Banco> {
  const raw = await apiClient.request<RawBanco>("/v1/bancos", {
    method: "POST",
    body: JSON.stringify({ nombre }),
    token,
  });
  return mapBanco(raw);
}

export async function actualizarBanco(id: string, nombre: string, token: string): Promise<Banco> {
  const raw = await apiClient.request<RawBanco>(`/v1/bancos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre }),
    token,
  });
  return mapBanco(raw);
}

export async function eliminarBanco(id: string, token: string): Promise<void> {
  await apiClient.request<void>(`/v1/bancos/${id}`, { method: "DELETE", token });
}

export async function listarUsuariosBanco(id: string, token: string): Promise<UsuarioBanco[]> {
  const res = await apiClient.request<{ usuarios: RawUser[] }>(`/v1/bancos/${id}/usuarios`, { token });
  return (res.usuarios ?? []).map(mapUsuarioBanco);
}

export async function asignarUsuario(bancoId: string, usuarioId: string, token: string): Promise<void> {
  await apiClient.request<void>(`/v1/bancos/${bancoId}/usuarios`, {
    method: "POST",
    body: JSON.stringify({ usuario_id: usuarioId }),
    token,
  });
}

export async function desasignarUsuario(bancoId: string, usuarioId: string, token: string): Promise<void> {
  await apiClient.request<void>(`/v1/bancos/${bancoId}/usuarios/${usuarioId}`, {
    method: "DELETE",
    token,
  });
}

export async function listarUsuariosEstudio(token: string): Promise<UsuarioBanco[]> {
  const res = await apiClient.request<{ usuarios: RawUser[] }>("/v1/usuarios", { token });
  return (res.usuarios ?? []).map(mapUsuarioBanco);
}
