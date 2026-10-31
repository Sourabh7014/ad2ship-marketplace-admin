"use client";

import * as React from "react";
import { endOfMonth, format, isValid, parseISO, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * The seller panel's one date-range filter — presets on the left, a two-month
 * calendar on the right, nothing applied until "Apply". Same design as the admin
 * dashboard's picker.
 *
 * The value is always a concrete `{ from, to }` (or `undefined` while none is picked), so
 * what the calendar highlights is exactly the range the caller queries — presets are
 * just shortcuts that fill the calendar.
 */

export interface DateRangeValue {
  from: Date;
  to: Date;
}

const PLACEHOLDER = "Select Date Range";
const CUSTOM = "Custom";

const PRESETS: { label: string; range: () => DateRangeValue }[] = [
  { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", range: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 Days", range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 15 Days", range: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
  { label: "Last 30 Days", range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Last 90 Days", range: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: "This Month", range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  {
    label: "Last Month",
    range: () => {
      const d = subMonths(new Date(), 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    },
  },
  { label: "This Year", range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

/** For callers that hold the range as `yyyy-MM-dd` strings (filter forms, query params). */
export const toYmd = ymd;

export function rangeFromYmd(start?: string, end?: string): DateRangeValue | undefined {
  if (!start) return undefined;
  // date-fns parses a bare date as local midnight, matching how `toYmd` wrote it.
  const from = parseISO(start);
  const to = parseISO(end || start);
  return isValid(from) && isValid(to) ? { from, to } : undefined;
}

/** Preset whose range matches `value` today, so the trigger can say "Last 7 Days". */
function presetFor(value: DateRangeValue | undefined): string | undefined {
  if (!value) return undefined;
  const hit = PRESETS.find((p) => {
    const r = p.range();
    return ymd(r.from) === ymd(value.from) && ymd(r.to) === ymd(value.to);
  });
  return hit ? hit.label : CUSTOM;
}

/** Newest dates sit in the right-hand month, so a range in the current month opens one month back. */
function defaultMonth(from: Date | undefined, twoMonths: boolean): Date {
  const base = from ?? subDays(new Date(), 6);
  const now = new Date();
  if (twoMonths && base.getMonth() === now.getMonth() && base.getFullYear() === now.getFullYear()) {
    return subMonths(base, 1);
  }
  return base;
}

export function DateRangePicker({
  value,
  onChange,
  align = "end",
  className,
}: {
  /** `undefined` = no range picked yet (the caller applies no date filter). */
  value: DateRangeValue | undefined;
  onChange: (value: DateRangeValue) => void;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [draftPreset, setDraftPreset] = React.useState<string | undefined>();
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);

  const presets = PRESETS.map((p) => p.label);
  const current = presetFor(value);

  const handleOpenChange = (next: boolean) => {
    // Every open starts from what's applied — an abandoned draft never leaks into the next one.
    if (next) {
      setDraft(value);
      setDraftPreset(current);
    }
    setOpen(next);
  };

  const pickPreset = (label: string) => {
    setDraftPreset(label);
    setDraft(PRESETS.find((p) => p.label === label)?.range());
  };

  const apply = () => {
    if (!draft?.from) return; // Nothing picked yet — keep the popover open.
    onChange({ from: draft.from, to: draft.to ?? draft.from });
    setOpen(false);
  };

  const triggerLabel = !value
    ? PLACEHOLDER
    : current === CUSTOM
      ? `${ymd(value.from)} to ${ymd(value.to)}`
      : current;

  const days =
    draft?.from && draft?.to
      ? Math.round((draft.to.getTime() - draft.from.getTime()) / 86_400_000) + 1
      : null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50",
            "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
            className
          )}
        >
          <CalendarIcon size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className={cn("flex-1 truncate text-left", !value && "text-slate-400 dark:text-zinc-500")}>{triggerLabel}</span>
          <ChevronDown size={13} className="shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        // Day cells can re-render mid-click; don't let that read as an outside click.
        onInteractOutside={(e) => {
          if (e.target instanceof Element && e.target.closest(".rdp, [data-slot='calendar']")) {
            e.preventDefault();
          }
        }}
        className="z-50 flex w-auto max-w-[95vw] flex-col gap-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl md:flex-row dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Presets + Apply */}
        <div className="flex w-full shrink-0 flex-col border-b border-slate-100 pb-3 md:w-44 md:border-r md:border-b-0 md:pr-4 md:pb-0 dark:border-zinc-800">
          <div className="grid flex-1 grid-cols-2 gap-1 md:flex md:flex-col">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => pickPreset(p)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                  draftPreset === p
                    ? "bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                <span>{p}</span>
                {draftPreset === p && <Check size={12} className="text-indigo-600 dark:text-indigo-400" />}
              </button>
            ))}
          </div>
          <div className="mt-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={apply}
              disabled={!draft?.from}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Selected range + calendar */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-slate-100/80 px-3.5 py-2 text-xs font-bold text-slate-800 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-100">
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {draft?.from && draft?.to
                ? `${ymd(draft.from)} to ${ymd(draft.to)}`
                : draft?.from
                  ? `${ymd(draft.from)} to ...`
                  : PLACEHOLDER}
            </span>
            <span className="shrink-0 text-[11px] font-normal text-slate-400 dark:text-zinc-400">
              {days ? `${days} ${days === 1 ? "Day" : "Days"}` : "Pick dates"}
            </span>
          </div>

          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : 2}
            defaultMonth={defaultMonth(draft?.from, !isMobile)}
            selected={draft}
            onSelect={(range) => {
              setDraft(range);
              setDraftPreset(CUSTOM);
            }}
            disabled={{ after: new Date() }}
            className="rounded-xl border border-slate-100 p-2 dark:border-zinc-800"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
