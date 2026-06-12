"use client";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrearCaso } from "@/features/casos/hooks/useCrearCaso";
import { useBancos } from "@/features/casos/hooks/useBancos";
import { formatRut, cleanRut } from "@/lib/utils/rut";

interface CrearCasoFormProps {
  onSuccess?: (casoId: string) => void;
  onCancel?: () => void;
  navigating?: boolean;
}

export function CrearCasoForm({ onSuccess, onCancel, navigating = false }: CrearCasoFormProps) {
  const { mutate, isPending, error } = useCrearCaso();
  const { data: bancos, isLoading: loadingBancos, isError: bancosError, refetch: refetchBancos } = useBancos();

  const [bancoId, setBancoId] = useState("");
  const [clienteRutDisplay, setClienteRutDisplay] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [fechaDj, setFechaDj] = useState("");

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClienteRutDisplay(formatRut(e.target.value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate(
      {
        bancoId,
        clienteRut: cleanRut(clienteRutDisplay),
        clienteNombre,
        clienteContacto: clienteContacto || undefined,
        fechaDj,
      },
      {
        onSuccess: (data) => {
          onSuccess?.(data.caso.id);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="banco" className="block text-sm font-medium text-(--ink-600)">
          Banco <span className="text-destructive">*</span>
        </label>
        {loadingBancos ? (
          <Skeleton className="h-9 w-full rounded-md" />
        ) : bancosError ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-(--slate-100) px-3 py-2.5">
            <AlertCircle className="size-4 shrink-0 text-(--ink-600)" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-(--ink-600)">No se pudieron cargar los bancos.</p>
            </div>
            <button
              type="button"
              onClick={() => refetchBancos()}
              className="text-xs text-(--navy-700) underline underline-offset-2 hover:text-(--navy-900) transition-colors shrink-0"
            >
              Reintentar
            </button>
          </div>
        ) : bancos && bancos.length > 0 ? (
          <Select value={bancoId || undefined} onValueChange={(val) => setBancoId(val ?? "")}>
            <SelectTrigger id="banco" className="w-full">
              <SelectValue placeholder="Seleccionar banco">
                {bancoId ? bancos.find((b) => b.id === bancoId)?.nombre : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bancos.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="rounded-lg border border-border bg-(--slate-100) px-3 py-2.5">
            <p className="text-xs text-(--ink-600)">
              No hay bancos asignados. Pídele al administrador que te asigne uno en Configuración.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="rut" className="block text-sm font-medium text-(--ink-600)">
            RUT <span className="text-destructive">*</span>
          </label>
          <Input
            id="rut"
            placeholder="12.345.678-9"
            value={clienteRutDisplay}
            onChange={handleRutChange}
            required
            className="tabular-nums"
            maxLength={12}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fecha-dj" className="block text-sm font-medium text-(--ink-600)">
            Fecha DJ <span className="text-destructive">*</span>
          </label>
          <DatePicker
            value={fechaDj}
            onChange={setFechaDj}
            toDate={new Date()}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="block text-sm font-medium text-(--ink-600)">
          Nombre del cliente <span className="text-destructive">*</span>
        </label>
        <Input
          id="nombre"
          placeholder="Juan Pérez"
          value={clienteNombre}
          onChange={(e) => setClienteNombre(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contacto" className="block text-sm font-medium text-(--ink-600)">
          Contacto{" "}
          <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
        </label>
        <Input
          id="contacto"
          placeholder="email o teléfono"
          value={clienteContacto}
          onChange={(e) => setClienteContacto(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Error al crear el caso."}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending || navigating}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isPending || navigating || !bancoId || !clienteRutDisplay || !clienteNombre || !fechaDj}
        >
          {(isPending || navigating) && <Loader2 className="size-3.5 animate-spin" />}
          {navigating ? "Abriendo…" : isPending ? "Creando…" : "Crear caso"}
        </Button>
      </div>
    </form>
  );
}
