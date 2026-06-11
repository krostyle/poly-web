"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/features/auth/hooks/useMe";
import { useBancos as useBancosAdmin } from "@/features/bancos/hooks/useBancos";
import type { CasoFilters } from "@/lib/api/casos";
import type { Estado } from "@/lib/api/types";

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "INGRESO",           label: "Ingreso" },
  { value: "REVISION",          label: "Revisión" },
  { value: "PREJUDICIAL",       label: "Medida Precautoria" },
  { value: "PAGO_NORMATIVO",    label: "Pago Normativo" },
  { value: "JUDICIAL",          label: "Demanda" },
  { value: "AUDIENCIA",         label: "Audiencia" },
  { value: "SENTENCIA",         label: "Sentencia" },
  { value: "APELACION",         label: "Apelación" },
  { value: "SENTENCIA_SEGUNDA", label: "Sentencia 2ª Inst." },
  { value: "CUMPLIMIENTO",      label: "Cumplimiento" },
  { value: "TERMINADO",         label: "Terminado" },
  { value: "CIERRE",            label: "Cierre" },
];

interface CasosFiltersProps {
  onChange: (filters: CasoFilters) => void;
}

export function CasosFilters({ onChange }: CasosFiltersProps) {
  const { data: me } = useMe();
  const { data: todosLosBancos } = useBancosAdmin();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [bancoId, setBancoId] = useState("");
  const [estadoVal, setEstadoVal] = useState<Estado | "">("");
  const [soloMios, setSoloMios] = useState(false);
  const [incluirCerrados, setIncluirCerrados] = useState(false);

  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Notify parent whenever any filter changes
  useEffect(() => {
    const filters: CasoFilters = {};
    if (debouncedQ) filters.q = debouncedQ;
    if (bancoId) filters.bancoId = bancoId;
    if (estadoVal) filters.estado = estadoVal;
    if (soloMios) filters.soloMios = true;
    if (incluirCerrados) filters.excluirCierre = false;
    onChange(filters);
  }, [debouncedQ, bancoId, estadoVal, soloMios, incluirCerrados, onChange]);

  const isAdmin = me?.usuario.rol === "ADMIN";
  // Admins see all bancos for filter; others see only their assigned ones
  const bancos = isAdmin ? (todosLosBancos ?? []) : (me?.bancos ?? []);

  const hasFilters = q || bancoId || estadoVal || soloMios || incluirCerrados;

  function reset() {
    setQ("");
    setBancoId("");
    setEstadoVal("");
    setSoloMios(false);
    setIncluirCerrados(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-(--ink-600) pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por cliente o RUT…"
          className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {/* Banco */}
      {bancos.length > 1 && (
        <Select value={bancoId} onValueChange={(v) => setBancoId(v ?? "")}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Todos los bancos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="" className="text-xs">Todos los bancos</SelectItem>
            {bancos.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-xs">
                {b.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Estado */}
      <Select value={estadoVal} onValueChange={(v) => setEstadoVal(v as Estado | "")}>
        <SelectTrigger className="h-8 w-44 text-xs">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="" className="text-xs">Todos los estados</SelectItem>
          {ESTADOS.map((e) => (
            <SelectItem key={e.value} value={e.value} className="text-xs">
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mis casos toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-(--ink-600)">
        <input
          type="checkbox"
          checked={soloMios}
          onChange={(e) => setSoloMios(e.target.checked)}
          className="rounded border-input size-3.5 accent-current"
        />
        Mis casos
      </label>

      {/* Incluir cerrados toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-(--ink-600)">
        <input
          type="checkbox"
          checked={incluirCerrados}
          onChange={(e) => setIncluirCerrados(e.target.checked)}
          className="rounded border-input size-3.5 accent-current"
        />
        Incluir cerrados
      </label>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={reset}
          className="text-xs text-(--ink-600) underline underline-offset-2 hover:text-(--navy-900) transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
