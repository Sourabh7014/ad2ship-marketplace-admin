"use client";

import * as React from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DateFilterType = "all" | "today" | "yesterday" | "7days" | "15days" | "30days" | "custom";

export interface DateRangeFilterValue {
  type: DateFilterType;
  range?: DateRange;
  start_date?: string;
  end_date?: string;
}

interface DateRangeFilterProps {
  onFilterChange: (value: DateRangeFilterValue) => void;
  initialType?: DateFilterType;
  initialRange?: DateRange;
  className?: string;
}

export function DateRangeFilter({
  onFilterChange,
  initialType = "7days",
  initialRange = {
    from: subDays(new Date(), 6),
    to: new Date(),
  },
  className,
}: DateRangeFilterProps) {
  const [filterType, setFilterType] = React.useState<DateFilterType>(initialType);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(initialRange);

  const getQueryParams = (type: DateFilterType, range?: DateRange) => {
    const now = new Date();
    let start_date: string | undefined, end_date: string | undefined;

    switch (type) {
      case "all":
        start_date = undefined;
        end_date = undefined;
        break;
      case "today":
        start_date = format(now, "yyyy-MM-dd");
        end_date = format(now, "yyyy-MM-dd");
        break;
      case "yesterday": {
        const yesterday = subDays(now, 1);
        start_date = format(yesterday, "yyyy-MM-dd");
        end_date = format(yesterday, "yyyy-MM-dd");
        break;
      }
      case "7days":
        start_date = format(subDays(now, 6), "yyyy-MM-dd");
        end_date = format(now, "yyyy-MM-dd");
        break;
      case "15days":
        start_date = format(subDays(now, 14), "yyyy-MM-dd");
        end_date = format(now, "yyyy-MM-dd");
        break;
      case "30days":
        start_date = format(subDays(now, 29), "yyyy-MM-dd");
        end_date = format(now, "yyyy-MM-dd");
        break;
      case "custom":
        if (range?.from && range?.to) {
          start_date = format(range.from, "yyyy-MM-dd");
          end_date = format(range.to, "yyyy-MM-dd");
        } else if (range?.from) {
          start_date = format(range.from, "yyyy-MM-dd");
          end_date = start_date;
        }
        break;
    }

    return { start_date, end_date };
  };

  React.useEffect(() => {
    const { start_date, end_date } = getQueryParams(filterType, dateRange);
    if (filterType !== "custom" || (dateRange?.from && dateRange?.to)) {
      onFilterChange({ type: filterType, range: dateRange, start_date, end_date });
    }
  }, [filterType, dateRange]);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800", className)}>
      <Tabs
        value={filterType}
        onValueChange={(v) => setFilterType(v as DateFilterType)}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid grid-cols-7 h-9 p-1 bg-transparent">
          <TabsTrigger value="all" className="text-xs px-2 font-bold">
            All
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs px-2">
            Today
          </TabsTrigger>
          <TabsTrigger value="yesterday" className="text-xs px-2">
            Yesterday
          </TabsTrigger>
          <TabsTrigger value="7days" className="text-xs px-2">
            7D
          </TabsTrigger>
          <TabsTrigger value="15days" className="text-xs px-2">
            15D
          </TabsTrigger>
          <TabsTrigger value="30days" className="text-xs px-2">
            30D
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs px-2">
            Custom
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filterType === "custom" && (
        <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200 px-1 pb-1 sm:pb-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-full sm:w-[220px] justify-start text-left font-normal hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                <span className="truncate text-xs">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd")
                    )
                  ) : (
                    "Pick range"
                  )}
                </span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={
                  dateRange?.from
                    ? (dateRange.from.getMonth() === new Date().getMonth() && dateRange.from.getFullYear() === new Date().getFullYear()
                        ? subDays(dateRange.from, 30)
                        : dateRange.from)
                    : subDays(new Date(), 30)
                }
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
