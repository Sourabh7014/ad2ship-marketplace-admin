"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export const PRESET_OPTIONS = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 15 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
];

export function presetToDateRange(label: string): DateRange | undefined {
  if (label === "All Time" || label === "All" || label === "all") {
    return undefined;
  }
  const now = new Date();
  if (label === "Today") {
    return { from: now, to: now };
  }
  if (label === "Yesterday") {
    const yest = subDays(now, 1);
    return { from: yest, to: yest };
  }
  if (label === "Last 7 Days" || label === "7D" || label === "7d") {
    return { from: subDays(now, 6), to: now };
  }
  if (label === "Last 15 Days" || label === "15D" || label === "15d") {
    return { from: subDays(now, 14), to: now };
  }
  if (label === "Last 30 Days" || label === "30D" || label === "30d") {
    return { from: subDays(now, 29), to: now };
  }
  if (label === "This Month") {
    return { from: startOfMonth(now), to: now };
  }
  if (label === "Last Month") {
    const lastMonthDate = subMonths(now, 1);
    return { from: startOfMonth(lastMonthDate), to: endOfMonth(lastMonthDate) };
  }
  return { from: subDays(now, 6), to: now };
}

export interface DateRangePickerProps {
  value?: DateRange;
  preset?: string;
  allowAll?: boolean;
  onChange?: (range: DateRange | undefined, presetLabel?: string) => void;
  className?: string;
  buttonClassName?: string;
  align?: "start" | "end" | "center";
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  preset = "Last 7 Days",
  allowAll = false,
  onChange,
  className,
  buttonClassName,
  align = "start",
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<string>(preset);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value || presetToDateRange(preset));

  const availablePresets = allowAll ? ["All Time", ...PRESET_OPTIONS] : PRESET_OPTIONS;

  const defaultCalMonth = useMemo(() => {
    if (value?.from) {
      return subMonths(value.to || value.from, 1);
    }
    return subMonths(new Date(), 1);
  }, [value]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftPreset(preset);
      setTempRange(value || presetToDateRange(preset));
    }
    setOpen(nextOpen);
  };

  const displayText = useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, "yyyy-MM-dd")} to ${format(value.to, "yyyy-MM-dd")}`;
    }
    if (value?.from) {
      return `${format(value.from, "yyyy-MM-dd")} to ...`;
    }
    if (preset === "All Time" || preset === "All") {
      return "All Time";
    }
    return preset || "Select Date Range";
  }, [value, preset]);

  const handleApply = () => {
    if (!tempRange?.from) {
      if (draftPreset === "All Time" || draftPreset === "All" || allowAll) {
        onChange?.(undefined, "All Time");
        setOpen(false);
        return;
      }
      const def = presetToDateRange("Last 7 Days");
      onChange?.(def, "Last 7 Days");
      setOpen(false);
    } else {
      const finalRange: DateRange = tempRange.to
        ? tempRange
        : { from: tempRange.from, to: tempRange.from };
      onChange?.(finalRange, draftPreset);
      setOpen(false);
    }
  };

  return (
    <div className={cn("inline-flex shrink-0", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
              buttonClassName
            )}
          >
            <CalendarIcon size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
              {displayText}
            </span>
            <ChevronDown size={13} className="text-slate-400 shrink-0 ml-0.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          className="w-auto p-4 shadow-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl z-50 flex flex-col md:flex-row gap-4 max-w-[95vw] overflow-x-auto"
        >
          {/* Left Sidebar: Presets & Apply Button */}
          <div className="w-full md:w-44 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 pr-0 md:pr-4 pb-3 md:pb-0">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
              Presets
            </div>
            <div className="space-y-1 flex-1">
              {availablePresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setDraftPreset(p);
                    setTempRange(presetToDateRange(p));
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-between",
                    draftPreset === p
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <span>{p}</span>
                  {draftPreset === p && <Check size={12} className="text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Right Panel: Selected Date Range Header & 2-Month Calendar */}
          <div className="flex-1 min-w-0">
            <div className="mb-2 px-3.5 py-2 bg-slate-100/80 dark:bg-zinc-800/80 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {tempRange?.from && tempRange?.to
                  ? `${format(tempRange.from, "yyyy-MM-dd")} to ${format(tempRange.to, "yyyy-MM-dd")}`
                  : tempRange?.from
                    ? `${format(tempRange.from, "yyyy-MM-dd")} to ...`
                    : "Select Date Range"}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-400 font-normal shrink-0">
                {tempRange?.from && tempRange?.to
                  ? `${Math.round((tempRange.to.getTime() - tempRange.from.getTime()) / (1000 * 3600 * 24)) + 1} Days`
                  : "Pick dates"}
              </span>
            </div>

            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={2}
              defaultMonth={defaultCalMonth}
              selected={tempRange}
              onSelect={(range) => {
                setTempRange(range);
                setDraftPreset("Custom");
              }}
              disabled={{ after: new Date() }}
              className="rounded-xl border border-slate-100 dark:border-zinc-800 p-2"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
