"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

export function CrearCasoForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useCrearCaso();
  const { data: bancos, isLoading: loadingBancos } = useBancos();

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
          router.push(`/casos/${data.caso.id}`);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <label
          htmlFor="banco"
          className="block text-sm font-medium text-(--navy-900)"
        >
          Banco
        </label>
        {loadingBancos ? (
          <Input disabled placeholder="Cargando bancos..." />
        ) : bancos && bancos.length > 0 ? (
          <Select
            value={bancoId || null}
            onValueChange={(val) => setBancoId(val ?? "")}
          >
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
        ) : (
          <Input
            id="banco"
            placeholder="ID del banco"
            value={bancoId}
            onChange={(e) => setBancoId(e.target.value)}
            required
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="rut"
          className="block text-sm font-medium text-(--navy-900)"
        >
          RUT del cliente
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
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-(--navy-900)"
        >
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
        <label
          htmlFor="contacto"
          className="block text-sm font-medium text-(--navy-900)"
        >
          Contacto{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <Input
          id="contacto"
          placeholder="email@example.com"
          value={clienteContacto}
          onChange={(e) => setClienteContacto(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="fecha-dj"
          className="block text-sm font-medium text-(--navy-900)"
        >
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

      {error && (
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Error al crear el caso."}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear caso"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
