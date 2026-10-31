"use client";

import { cn } from "@/lib/utils";
import {
  LucideIcon,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
  isLive?: boolean;
  className?: string;
  symbol?: string;
  statusText?: string;
  statusColor?: string;
  footer?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendUp,
  isLive = true,
  className,
  symbol,
  statusText,
  statusColor = "text-emerald-500",
  footer,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 xl:p-8 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 group",
        className,
      )}
    >
      {}
      <div
        className={cn(
          "absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-5 blur-[100px] transition-opacity group-hover:opacity-10",
          iconColor.replace("text-", "bg-"),
        )}
      />

      <div className="flex flex-col h-full justify-between">
        {}
        <div className="flex items-start justify-between mb-8 xl:mb-12">
          {}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/20 blur-sm" />
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-inner">
              <Icon
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transform transition-transform duration-500 group-hover:scale-110",
                  iconColor,
                )}
              />
            </div>
          </div>

          {}
          {isLive && (
            <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Live
              </span>
            </div>
          )}
        </div>

        {}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase whitespace-nowrap">
            {title}
          </span>
          <div className="h-[1px] w-full bg-gradient-to-r from-zinc-200 dark:from-zinc-800/50 to-transparent" />
        </div>

        {}
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            {symbol && (
              <span className="text-xl sm:text-2xl font-medium text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors uppercase">
                {symbol}
              </span>
            )}
            <span className="text-3xl sm:text-4xl xl:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {value}
            </span>
          </div>

          {}
          {((trend && trend !== "0%" && trend !== "0") || statusText) && (
            <div
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border backdrop-blur-md transition-all duration-300",
                statusText === "Neutral"
                  ? "bg-zinc-500/5 border-zinc-500/20 text-zinc-500 group-hover:bg-zinc-500/10"
                  : trendUp || statusText === "Active" || statusText === "Stable"
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/10"
                    : "bg-rose-500/5 border-rose-500/20 text-rose-500 group-hover:bg-rose-500/10",
              )}
            >
              {trend && (
                <span className="transform transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  {trendUp ? (
                    <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </span>
              )}
              {!trend && statusText !== "Neutral" && statusText !== "Stable" && (
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">
                {trend || statusText}
              </span>
            </div>
          )}
        </div>

        {}
        {footer && (
          <div className="mt-6 xl:mt-8 pt-4 xl:pt-6 border-t border-zinc-100 dark:border-zinc-900/50">
            <p className="text-[9px] sm:text-[10px] font-medium tracking-wider text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors uppercase">
              {footer}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
