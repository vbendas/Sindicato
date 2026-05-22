"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface WorkDatePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function WorkDatePicker({ from, to, onChange }: WorkDatePickerProps) {
  const [open, setOpen] = useState(false);

  const range: DateRange = { from, to };

  function handleSelect(selected: DateRange | undefined) {
    onChange({ from: selected?.from, to: selected?.to });
    if (selected?.from && selected?.to) {
      setOpen(false);
    }
  }

  let displayText = "Select work period";
  if (from && to) {
    displayText = `${format(from, "MMM yyyy")} – ${format(to, "MMM yyyy")}`;
  } else if (from) {
    displayText = `${format(from, "MMM yyyy")} – ...`;
  }

  const triggerClass =
    "w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-sindicato-charcoal/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={triggerClass} aria-label="Select work period">
        <span className={from ? "text-sindicato-charcoal" : "text-sindicato-charcoal/40"}>
          {displayText}
        </span>
        <CalendarIcon className="w-4 h-4 text-sindicato-charcoal/40 flex-shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto"
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={(date) => date > new Date()}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}
