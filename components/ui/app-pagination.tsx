"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AppPaginationProps extends React.ComponentProps<"div"> {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function AppPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = "results",
  className,
  ...props
}: AppPaginationProps) {
  const pageCount = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, currentPage), pageCount);

  // Calculate visible range numbers
  const maxVisible = 5;
  let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
  let endPage = startPage + maxVisible - 1;

  if (endPage > pageCount) {
    endPage = pageCount;
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // Result bounds calculation if totalCount and pageSize are provided
  const hasRangeInfo = typeof totalCount === "number" && typeof pageSize === "number";
  const startIdx = hasRangeInfo
    ? totalCount === 0
      ? 0
      : (current - 1) * (pageSize as number) + 1
    : null;
  const endIdx = hasRangeInfo
    ? Math.min(current * (pageSize as number), totalCount as number)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3",
        "rounded-2xl border border-slate-200/80 dark:border-zinc-800/80",
        "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm",
        className
      )}
      {...props}
    >
      {/* Left side: Results count & page size selector */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 text-xs text-slate-500 dark:text-zinc-400 font-medium w-full sm:w-auto">
        {hasRangeInfo && (
          <span className="whitespace-nowrap">
            Showing{" "}
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {startIdx}-{endIdx}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {totalCount}
            </span>{" "}
            {itemLabel}
          </span>
        )}

        {onPageSizeChange && typeof pageSize === "number" && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 dark:text-zinc-500 whitespace-nowrap">
              Show
            </span>
            <Select
              value={`${pageSize}`}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[76px] rounded-lg border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80 text-xs font-bold text-slate-800 dark:text-zinc-200 px-2.5 shadow-sm focus:ring-indigo-500/30">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="rounded-xl border-slate-200/80 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 backdrop-blur-xl"
              >
                {pageSizeOptions.map((option) => (
                  <SelectItem
                    key={option}
                    value={`${option}`}
                    className="text-xs font-semibold cursor-pointer rounded-lg"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-slate-400 dark:text-zinc-500 whitespace-nowrap">
              per page
            </span>
          </div>
        )}
      </div>

      {/* Right side: Page navigation controls */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 mr-1 whitespace-nowrap">
          Page{" "}
          <span className="font-bold text-slate-800 dark:text-zinc-200">
            {current}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-800 dark:text-zinc-200">
            {pageCount}
          </span>
        </span>

        <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
          {/* First Page */}
          <button
            type="button"
            aria-label="Go to first page"
            onClick={() => onPageChange(1)}
            disabled={current <= 1}
            className={btnClass}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            aria-label="Go to previous page"
            onClick={() => onPageChange(current - 1)}
            disabled={current <= 1}
            className={btnClass}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Number Pills */}
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 shrink-0",
                current === page
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 border border-indigo-600"
                  : btnClass
              )}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            type="button"
            aria-label="Go to next page"
            onClick={() => onPageChange(current + 1)}
            disabled={current >= pageCount}
            className={btnClass}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            aria-label="Go to last page"
            onClick={() => onPageChange(pageCount)}
            disabled={current >= pageCount}
            className={btnClass}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const btnClass =
  "h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 " +
  "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-zinc-800 disabled:hover:text-slate-600 dark:disabled:hover:text-zinc-400 disabled:hover:border-slate-200/80 " +
  "transition-all duration-150 shadow-sm";

export default AppPagination;
