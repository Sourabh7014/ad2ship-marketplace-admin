"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface DateTimePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: CalendarProps["disabled"];
}

export function DateTimePicker({
  date,
  onChange,
  placeholder = "Select Date and Time",
  disabled,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );
  const [time, setTime] = React.useState<string>(
    date ? format(date, "HH:mm") : "12:00",
  );

  const handleDateSelect = (d: Date | undefined) => {
    setSelectedDate(d);
    if (d) {
      const timeParts = time.split(":");
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const newDate = new Date(d);
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
          onChange?.(newDate);
          return;
        }
      }
      onChange?.(d);
    } else {
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (selectedDate) {
      const timeParts = newTime.split(":");
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const newDate = new Date(selectedDate);
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
          onChange?.(newDate);
        }
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-background border-border text-foreground hover:bg-secondary hover:text-secondary-foreground h-11",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-popover border-border"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="bg-popover"
          disabled={disabled}
        />
        <div className="p-3 border-t border-border flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="flex-1 bg-background border-border text-foreground focus:border-primary/50 h-9"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
