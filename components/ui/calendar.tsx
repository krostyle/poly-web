"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-(--navy-900)",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1",
        button_previous: cn(
          "h-7 w-7 flex items-center justify-center rounded-md text-(--ink-600)",
          "hover:bg-(--slate-100) transition-colors disabled:opacity-30"
        ),
        button_next: cn(
          "h-7 w-7 flex items-center justify-center rounded-md text-(--ink-600)",
          "hover:bg-(--slate-100) transition-colors disabled:opacity-30"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-xs font-medium text-(--ink-600) w-9 text-center",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-(--slate-100)",
          "[&:has([aria-selected].day-outside)]:bg-(--slate-100)/50"
        ),
        day_button: cn(
          "h-9 w-9 text-sm rounded-md font-normal transition-colors",
          "hover:bg-(--slate-100) hover:text-(--navy-900)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "aria-selected:bg-(--navy-900) aria-selected:text-white aria-selected:hover:bg-(--navy-700)"
        ),
        selected: "[&>button]:bg-(--navy-900) [&>button]:text-white [&>button]:hover:bg-(--navy-700)",
        today: "[&>button]:font-semibold [&>button]:text-(--navy-900)",
        outside: "[&>button]:text-muted-foreground [&>button]:opacity-50",
        disabled: "[&>button]:text-muted-foreground [&>button]:opacity-30 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}
