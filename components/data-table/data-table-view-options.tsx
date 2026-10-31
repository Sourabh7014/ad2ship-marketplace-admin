"use client";

import type { Table } from "@tanstack/react-table";
import { Check, SlidersHorizontal } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            column.getCanHide()
        ),
    [table]
  );

  const hiddenCount = columns.filter((col) => !col.getIsVisible()).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          size="sm"
          className={cn(
            "ml-auto flex h-9 rounded-xl gap-2",
            "border-zinc-200/70 dark:border-zinc-700/50",
            "bg-white/80 dark:bg-zinc-800/60 backdrop-blur",
            "font-bold text-xs cursor-pointer shadow-sm",
            "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md",
            "transition-all duration-200"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
          {hiddenCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-black">
              {hiddenCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-52 rounded-2xl p-1.5 shadow-2xl",
          "border border-zinc-200/70 dark:border-zinc-800/60",
          "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl"
        )}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 dark:text-zinc-500 py-2 px-2.5">
          Toggle Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1 bg-zinc-100 dark:bg-zinc-800/60" />

        {columns.map((column) => {
          const isVisible = column.getIsVisible();
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className={cn(
                "text-[13px] font-medium capitalize cursor-pointer rounded-xl mx-0.5 px-3 py-2 transition-colors duration-150",
                "hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-700 dark:hover:text-indigo-400",
                !isVisible && "text-zinc-400 dark:text-zinc-500"
              )}
              checked={isVisible}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <span className="capitalize">
                {(column.columnDef.meta as any)?.label ?? column.id.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
