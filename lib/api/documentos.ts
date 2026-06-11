import { apiClient } from "./client";
import type { Documento, TipoDocumento } from "./types";

interface RawDocumento {
  id: string;
  tipo: TipoDocumento;
  nombre: string;
  blob_url: string;
  subido_por?: string;
  created_at: string;
}

interface RawDocumentosResponse {
  documentos: RawDocumento[];
}

function mapDocumento(raw: RawDocumento): Documento {
  return {
    id: raw.id,
    tipo: raw.tipo,
    nombre: raw.nombre,
    blobUrl: raw.blob_url,
    subidoPor: raw.subido_por,
    createdAt: raw.created_at,
  };
}

export async function getDocumentos(casoId: string, token: string): Promise<Documento[]> {
  const raw = await apiClient.request<RawDocumentosResponse>(`/v1/casos/${casoId}/documentos`, { token });
  return (raw.documentos ?? []).map(mapDocumento);
}

export async function subirDocumento(
  casoId: string,
  file: File,
  tipo: TipoDocumento,
  token: string
): Promise<Documento> {
  const form = new FormData();
  form.append("file", file);
  form.append("tipo", tipo);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/v1/casos/${casoId}/documentos`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }

  const raw: RawDocumento = await res.json();
  return mapDocumento(raw);
}
