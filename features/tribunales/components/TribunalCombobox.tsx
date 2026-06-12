"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: tribunales = [] } = useTribunales();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between gap-1 rounded border border-border/60 bg-(--slate-100)/60 px-2 text-left text-sm font-medium text-(--navy-900) hover:border-input hover:bg-(--slate-100) focus:outline-none focus:border-input"
      >
        <span className="flex-1 truncate">
          {value || (
            <span className="font-normal text-muted-foreground">—</span>
          )}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-80 rounded-lg border border-border bg-(--paper) shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <input
              ref={inputRef}
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
                    onMouseDown={(e) => e.preventDefault()}
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
        </div>
      )}
    </div>
  );
}
