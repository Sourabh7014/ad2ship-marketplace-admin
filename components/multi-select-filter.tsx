import React from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MultiSelectFilterOption {
  value: string;
  label: string;
}

/**
 * A multi-select list filter shown inline beside a list's search box: a button that drops
 * the options, each tick applied as it is made — there is no Apply step.
 */
export function MultiSelectFilter({
  label,
  icon: Icon,
  options,
  values,
  onChange,
  summary,
  emptyText = "No options available",
  onOpenChange,
  className,
  contentClassName,
}: {
  /** Names the filter — the button text while nothing is picked. */
  label: string;
  icon: LucideIcon;
  options: MultiSelectFilterOption[];
  values: string[];
  onChange: (values: string[]) => void;
  /** Button text once something is picked. Defaults to the picked labels, comma separated. */
  summary?: string;
  /** Shown in place of the list while it has no options. */
  emptyText?: string;
  onOpenChange?: (open: boolean) => void;
  /** For the button — e.g. a height matching the controls it sits beside. */
  className?: string;
  contentClassName?: string;
}) {
  const toggleValue = (value: string, checked: boolean) => {
    onChange(checked ? [...values, value] : values.filter((v) => v !== value));
  };

  const selectedLabels = options.filter((o) => values.includes(o.value)).map((o) => o.label);

  return (
    // Non-modal: the list stays open while options are ticked, and the page behind
    // keeps responding to the first click outside it.
    <DropdownMenu modal={false} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          title={label}
          className={cn(
            "h-9 max-w-56 rounded-xl px-3 gap-2 text-xs font-semibold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xs cursor-pointer justify-between",
            values.length ? "text-slate-700 dark:text-zinc-300" : "text-slate-500 dark:text-zinc-500",
            className,
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <span className="truncate text-left">
            {values.length === 0
              ? label
              : (summary ?? (selectedLabels.join(", ") || `${values.length} selected`))}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "w-56 max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl",
          contentClassName,
        )}
      >
        {options.length === 0 && <div className="px-3 py-2 text-xs text-zinc-400">{emptyText}</div>}
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={values.includes(opt.value)}
            onCheckedChange={(checked) => toggleValue(opt.value, checked === true)}
            onSelect={(e) => e.preventDefault()}
            className="text-xs font-semibold rounded-lg cursor-pointer my-0.5 mx-1 focus:bg-indigo-50 focus:text-indigo-700 dark:focus:bg-indigo-500/10 dark:focus:text-indigo-400"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
