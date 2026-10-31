import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { Loader2 } from "lucide-react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  isLoading?: boolean;
  /** Loading overlay / empty state ka text — default orders screens wala hai. */
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  isLoading,
  loadingText = "Loading orders…",
  emptyTitle = "No orders found",
  emptyDescription = "Try adjusting your filters or date range",
  className,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-3 overflow-auto", className)}
      {...props}
    >
      {children}

      {/* ── Table wrapper ── */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b-0"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ ...getCommonPinningStyles({ column: header.column }) }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="relative">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIdx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "group/row transition-colors duration-150",
                    rowIdx % 2 !== 0
                      ? "bg-zinc-50/80 dark:bg-zinc-800/20"
                      : "bg-white dark:bg-zinc-900"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ ...getCommonPinningStyles({ column: cell.column }) }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent border-0">
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center py-6"
                >
                  <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{emptyTitle}</p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{emptyDescription}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* ── Loading overlay ── */}
            {isLoading && (
              <TableRow className="absolute inset-0 z-10 border-0 hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
                    <Loader2 className="size-4 animate-spin text-indigo-500" />
                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{loadingText}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer: pagination + action bar ── */}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
