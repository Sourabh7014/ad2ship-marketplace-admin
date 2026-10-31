import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { PAGE_SIZE_OPTIONS } from "@/config/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const current = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const totalCount = typeof table.getRowCount === "function" ? table.getRowCount() : table.getFilteredRowModel().rows.length;

  const startIdx = totalCount === 0 ? 0 : current * pageSize + 1;
  const endIdx = Math.min((current + 1) * pageSize, totalCount);

  // Build page pills (max 5 visible)
  const visiblePages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
    if (pageCount <= 5) return i;
    if (current < 3) return i;
    if (current >= pageCount - 3) return pageCount - 5 + i;
    return current - 2 + i;
  });

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2",
        "rounded-xl border border-zinc-200/60 dark:border-zinc-800/50",
        "bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xs",
        className
      )}
      {...props}
    >
      {/* ── Left: row selection info + page-size ── */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium w-full sm:w-auto">
        {/* Selection info */}
        <span className="whitespace-nowrap">
          Showing{" "}
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            {startIdx}-{endIdx}
          </span>{" "}
          of{" "}
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            {totalCount}
          </span>{" "}
          results
          {selectedCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/30">
              {selectedCount} selected
            </span>
          )}
        </span>

        {/* Page-size select */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-zinc-400 dark:text-zinc-500 whitespace-nowrap">Show</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-7 w-[70px] rounded-lg border border-zinc-200/70 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/60 text-xs font-bold text-zinc-700 dark:text-zinc-300 px-2 shadow-xs focus:ring-indigo-500/30">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className="rounded-xl border-zinc-200/70 dark:border-zinc-800/60 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl"
            >
              {pageSizeOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-zinc-400 dark:text-zinc-500 whitespace-nowrap">per page</span>
        </div>
      </div>

      {/* ── Right: page controls ── */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
        {/* Page label */}
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1 whitespace-nowrap">
          Page{" "}
          <span className="font-bold text-zinc-700 dark:text-zinc-300">{current + 1}</span>{" "}
          of{" "}
          <span className="font-bold text-zinc-700 dark:text-zinc-300">{Math.max(1, pageCount)}</span>
        </span>

        <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
          {/* First page */}
          <button
            aria-label="Go to first page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={paginationBtnClass}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          {/* Prev page */}
          <button
            aria-label="Go to previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={paginationBtnClass}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page number pills */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => table.setPageIndex(page)}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 shrink-0",
                current === page
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/30 border border-indigo-600"
                  : paginationBtnClass
              )}
            >
              {page + 1}
            </button>
          ))}

          {/* Next page */}
          <button
            aria-label="Go to next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={paginationBtnClass}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Last page */}
          <button
            aria-label="Go to last page"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className={paginationBtnClass}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const paginationBtnClass =
  "h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200/70 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 " +
  "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 dark:disabled:hover:bg-zinc-800/60 disabled:hover:text-zinc-500 disabled:hover:border-zinc-200/70 " +
  "transition-all duration-150 shadow-xs";
