"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const parseYmd = (str?: string) => {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const formatYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export interface DatePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const dateVal = parseYmd(value);
  const minVal = parseYmd(minDate);
  const maxVal = parseYmd(maxDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 dark:text-zinc-100 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer",
            className
          )}
        >
          <span className="truncate">
            {dateVal ? format(dateVal, "dd-MM-yyyy") : placeholder}
          </span>
          <CalendarIcon className="h-3.5 w-3.5 opacity-60 shrink-0 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="bottom"
        className="w-auto p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl z-50 max-w-[85vw]"
      >
        <Calendar
          mode="single"
          selected={dateVal}
          onSelect={(d) => {
            if (d) {
              onChange(formatYmd(d));
              setOpen(false);
            }
          }}
          disabled={(d) => {
            if (minVal && d < minVal) return true;
            if (maxVal && d > maxVal) return true;
            return false;
          }}
          initialFocus
          className="p-1 scale-90 origin-top"
        />
      </PopoverContent>
    </Popover>
  );
}
