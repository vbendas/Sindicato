"use client";

import { useState } from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  fileCalendarClass,
  fileCalendarClassNames,
  fileCalendarDayButtonClass,
  fileDropdownContentClass,
} from "../fileFormStyles";

interface WorkDatePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function WorkDatePicker({ from, to, onChange }: WorkDatePickerProps) {
  const [open, setOpen] = useState(false);

  const range: DateRange = { from, to };

  function handleOpenChange(nextOpen: boolean) {
    // Keep popover open until the range has an end date
    if (!nextOpen && from && !to) return;
    setOpen(nextOpen);
  }

  function handleSelect(selected: DateRange | undefined) {
    if (!selected?.from) return;

    if (selected.from && selected.to) {
      onChange({ from: selected.from, to: selected.to });
      setOpen(false);
      return;
    }

    onChange({ from: selected.from, to: undefined });
  }

  let displayText = "Select work period";
  if (from && to) {
    displayText = `${format(from, "MMM yyyy")} – ${format(to, "MMM yyyy")}`;
  } else if (from) {
    displayText = `${format(from, "MMM yyyy")} – ...`;
  }

  const triggerClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-white/40";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className={triggerClass} aria-label="Select work period">
        <span className={from ? "text-sindicato-warm-white" : "text-sindicato-warm-white/40"}>
          {displayText}
        </span>
        <CalendarIcon className="w-4 h-4 text-sindicato-warm-white/40 flex-shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        className={`p-0 w-auto ${fileDropdownContentClass}`}
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Calendar
          mode="range"
          min={1}
          selected={range}
          onSelect={handleSelect}
          disabled={(date) => date > new Date()}
          numberOfMonths={1}
          className={fileCalendarClass}
          classNames={fileCalendarClassNames}
          components={{
            DayButton: ({ className, ...props }) => (
              <CalendarDayButton
                className={cn(fileCalendarDayButtonClass, className)}
                {...props}
              />
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
