"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrearCaso } from "@/features/casos/hooks/useCrearCaso";
import { useBancos } from "@/features/casos/hooks/useBancos";

interface CrearCasoFormProps {
  onSuccess?: (casoId: string) => void;
  onCancel?: () => void;
}

export function CrearCasoForm({ onSuccess, onCancel }: CrearCasoFormProps) {
  const { mutate, isPending, error } = useCrearCaso();
  const { data: bancos, isLoading: loadingBancos, isError: bancosError } = useBancos();

  const [bancoId, setBancoId] = useState("");
  const [clienteRut, setClienteRut] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [fechaDj, setFechaDj] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate(
      {
        bancoId,
        clienteRut,
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
          Banco
        </label>
        {loadingBancos ? (
          <Input disabled placeholder="Cargando bancos…" />
        ) : bancos && bancos.length > 0 ? (
          <Select value={bancoId || undefined} onValueChange={(val) => setBancoId(val ?? "")}>
            <SelectTrigger id="banco" className="w-full">
              <SelectValue placeholder="Seleccionar banco" />
            </SelectTrigger>
            <SelectContent>
              {bancos.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : bancosError ? (
          <Input
            id="banco"
            placeholder="ID del banco"
            value={bancoId}
            onChange={(e) => setBancoId(e.target.value)}
          />
        ) : (
          <div className="rounded-lg border-border bg-(--slate-100) px-3 py-2">
            <p className="text-xs text-(--ink-600)">
              No hay bancos asignados a tu usuario. Contactá al administrador.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="rut" className="block text-sm font-medium text-(--ink-600)">
            RUT
          </label>
          <Input
            id="rut"
            placeholder="12.345.678-9"
            value={clienteRut}
            onChange={(e) => setClienteRut(e.target.value)}
            required
            className="tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fecha-dj" className="block text-sm font-medium text-(--ink-600)">
            Fecha DJ
          </label>
          <Input
            id="fecha-dj"
            type="date"
            value={fechaDj}
            onChange={(e) => setFechaDj(e.target.value)}
            required
            className="tabular-nums"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="block text-sm font-medium text-(--ink-600)">
          Nombre del cliente
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
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isPending || !bancoId || !clienteRut || !clienteNombre || !fechaDj}>
          {isPending ? "Creando…" : "Crear caso"}
        </Button>
      </div>
    </form>
  );
}
