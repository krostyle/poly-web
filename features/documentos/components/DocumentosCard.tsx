"use client";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, FileText, Upload, ExternalLink } from "lucide-react";
import { useDocumentosCaso, useSubirDocumento } from "@/features/documentos/hooks/useDocumentosCaso";
import type { TipoDocumento } from "@/lib/api/types";

const TIPO_LABELS: Record<TipoDocumento, string> = {
  CARTOLA: "Cartola",
  EVIDENCIA: "Evidencia",
  DJ: "Declaración jurada",
  DENUNCIA: "Denuncia",
  CARTA_BANCO: "Carta banco",
  DEMANDA: "Demanda",
  RESOLUCION: "Resolución",
  OTRO: "Otro",
};

const TIPOS = Object.entries(TIPO_LABELS) as [TipoDocumento, string][];

interface DocumentosCardProps {
  casoId: string;
}

export function DocumentosCard({ casoId }: DocumentosCardProps) {
  const { data: documentos, isLoading, isError, refetch } = useDocumentosCaso(casoId);
  const { mutate: subir, isPending: subiendo } = useSubirDocumento(casoId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<TipoDocumento>("OTRO");
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    if (file.size > 20 * 1024 * 1024) {
      setFileError("El archivo supera el límite de 20 MB.");
      e.target.value = "";
      return;
    }

    subir(
      { file, tipo },
      {
        onError: (err) => setFileError(err instanceof Error ? err.message : "Error al subir."),
        onSettled: () => { e.target.value = ""; },
      }
    );
  }

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Documentos
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoDocumento)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {TIPO_LABELS[tipo]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            disabled={subiendo}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {subiendo ? "Subiendo…" : "Subir"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {fileError && (
          <p className="mb-3 text-xs text-destructive">{fileError}</p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-xl bg-(--slate-100) p-3">
              <AlertCircle className="size-5 text-(--ink-600)" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-(--ink-600)">No se pudieron cargar los documentos.</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !documentos || documentos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-xl bg-(--slate-100) p-3.5">
              <FileText className="size-5 text-(--ink-600)" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-(--navy-900)">Sin documentos</p>
              <p className="mt-0.5 text-xs text-(--ink-600)">
                Selecciona el tipo y sube el primer documento.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documentos.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                <div className="rounded-lg bg-(--slate-100) p-2 shrink-0">
                  <FileText className="size-4 text-(--ink-600)" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--navy-900) truncate">{doc.nombre}</p>
                  <p className="text-xs text-(--ink-600)">{TIPO_LABELS[doc.tipo]}</p>
                </div>
                <a
                  href={doc.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-(--ink-600) hover:text-(--navy-900) transition-colors"
                  title="Abrir documento"
                >
                  <ExternalLink className="size-4" strokeWidth={1.5} />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
