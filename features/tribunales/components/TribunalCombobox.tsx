"use client";

import { useState, useMemo } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTribunales } from "@/features/tribunales/hooks/useTribunales";
import type { Tribunal } from "@/lib/api/types";

interface TribunalComboboxProps {
  value: string;
  onSelect: (nombre: string, region: string) => void;
  className?: string;
}

export function TribunalCombobox({ value, onSelect, className }: TribunalComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: tribunales = [] } = useTribunales();

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? tribunales.filter(
          (t) =>
            t.nombre.toLowerCase().includes(q) ||
            t.region.toLowerCase().includes(q)
        )
      : tribunales;

    const map = new Map<string, Tribunal[]>();
    for (const t of filtered) {
      if (!map.has(t.region)) map.set(t.region, []);
      map.get(t.region)!.push(t);
    }
    return map;
  }, [tribunales, search]);

  function handleSelect(t: Tribunal) {
    onSelect(t.nombre, t.region);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1 rounded border border-border/60 bg-(--slate-100)/60 px-2 text-left text-sm font-medium text-(--navy-900) hover:border-input hover:bg-(--slate-100) focus:outline-none focus:border-input",
          className
        )}
      >
        <span className="flex-1 truncate">
          {value || <span className="font-normal text-muted-foreground">—</span>}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={4}>
        <div className="border-b border-border px-3 py-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tribunal o región…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {grouped.size === 0 && (
            <p className="px-3 py-4 text-center text-sm text-(--ink-600)">
              Sin resultados
            </p>
          )}
          {[...grouped.entries()].map(([region, courts]) => (
            <div key={region}>
              <div className="sticky top-0 bg-(--slate-100)/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--ink-600) backdrop-blur-sm">
                {region}
              </div>
              {courts.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-(--slate-100) text-(--navy-900)"
                >
                  <Check
                    className={cn(
                      "size-3 shrink-0 text-(--navy-700)",
                      value === t.nombre ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{t.nombre}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
