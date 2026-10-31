"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────────────────────
   Table  –  outer scroll wrapper + <table>
───────────────────────────────────────────────────────────────────────────── */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-xl"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm border-separate border-spacing-0",
          className
        )}
        {...props}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableHeader  –  <thead>
───────────────────────────────────────────────────────────────────────────── */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-zinc-50 dark:bg-zinc-800/60",
        "border-b border-zinc-200 dark:border-zinc-700/60",
        "[&_tr]:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableBody  –  <tbody>
───────────────────────────────────────────────────────────────────────────── */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child>td]:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableFooter  –  <tfoot>
───────────────────────────────────────────────────────────────────────────── */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-gradient-to-r from-slate-50/80 via-white/70 to-slate-50/80",
        "dark:from-zinc-900/70 dark:via-zinc-800/50 dark:to-zinc-900/70",
        "border-t border-zinc-200/60 dark:border-zinc-700/40",
        "font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableRow  –  <tr>
───────────────────────────────────────────────────────────────────────────── */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Border between rows
        "border-b border-zinc-100 dark:border-zinc-800/60",
        // Hover — subtle indigo tint
        "hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10",
        // Selected state
        "data-[state=selected]:bg-indigo-50 dark:data-[state=selected]:bg-indigo-950/20",
        // Smooth transition
        "transition-colors duration-150",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableHead  –  <th>  (column header cell)
───────────────────────────────────────────────────────────────────────────── */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Size & spacing
        "h-7 px-2 text-left align-middle whitespace-nowrap",
        // Typography
        "text-[10.5px] font-black uppercase tracking-widest",
        "text-zinc-500 dark:text-zinc-400",
        // Bottom border separator between header and body
        "border-b border-zinc-200 dark:border-zinc-700/60",
        // Checkbox column tweaks
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // First / last column rounding for a pill-style header feel
        "first:pl-3 last:pr-3",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableCell  –  <td>  (body cell)
───────────────────────────────────────────────────────────────────────────── */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-3.5 align-middle whitespace-nowrap",
        "text-[11.5px] text-zinc-700 dark:text-zinc-300",
        // Checkbox column tweaks
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // First / last column padding
        "first:pl-4 last:pr-4",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableCaption  –  <caption>
───────────────────────────────────────────────────────────────────────────── */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4 text-xs text-zinc-400 dark:text-zinc-500 font-medium",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
