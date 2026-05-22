"use client";

import { useState, useRef } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface VariableSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string, label: string) => void;
}

export default function VariableSelector({ label, options, value, onChange }: VariableSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(val: string, lab: string) {
    onChange(val, lab);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 bg-white/10 text-sindicato-cream/80 hover:bg-white/20 hover:text-sindicato-cream cursor-pointer transition-colors rounded-[0.375rem]"
        aria-label={`Select ${label}`}
      >
        <span className={selected ? "text-sindicato-cream" : "text-sindicato-cream/50"}>
          {selected ? `${label}: ${selected.label}` : label}
        </span>
        <ChevronDownIcon className="size-3 text-sindicato-cream/40" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--anchor-width] min-w-48 bg-sindicato-smoked-charcoal"
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Command shouldFilter={false} className="bg-sindicato-smoked-charcoal">
          <CommandInput
            ref={inputRef}
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            {filtered.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.value}
                onSelect={() => handleSelect(opt.value, opt.label)}
                data-checked={value === opt.value}
              >
                <span className="flex-1">{opt.label}</span>
                {value === opt.value && (
                  <CheckIcon className="size-3.5 text-sindicato-cream" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
