"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled,
  className,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? new Date(value + "T12:00:00") : undefined;
  const showClear = !!selected && !disabled;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative rounded-md border border-input", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "flex h-full w-full items-center justify-between",
            "bg-transparent px-3 py-2 text-sm outline-none transition-colors",
            "focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showClear ? "pr-8" : "",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="tabular-nums">
            {selected
              ? format(selected, "dd/MM/yyyy", { locale: es })
              : placeholder}
          </span>
          {!showClear && (
            <CalendarIcon className="size-4 shrink-0 text-(--ink-600)" />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={toDate ? { after: toDate } : undefined}
            defaultMonth={selected ?? new Date()}
            locale={es}
          />
        </PopoverContent>
      </Popover>
      {showClear && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-(--navy-900) transition-colors"
          tabIndex={-1}
          aria-label="Borrar fecha"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
