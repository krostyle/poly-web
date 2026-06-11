"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const selected = value ? new Date(value + "T12:00:00") : undefined;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input",
          "bg-transparent px-3 py-2 text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className
        )}
      >
        <span className="tabular-nums">
          {selected
            ? format(selected, "dd/MM/yyyy", { locale: es })
            : placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-(--ink-600)" />
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
  );
}
