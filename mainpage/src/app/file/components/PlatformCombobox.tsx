"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import {
  fileDropdownCommandClass,
  fileDropdownContentClass,
  fileDropdownItemClass,
} from "../fileFormStyles";

const KNOWN_PLATFORMS = [
  { slug: "remote", name: "Remote Platform" },
  { slug: "gig", name: "Gig Delivery" },
];

function normalizeToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PlatformComboboxProps {
  value: string;
  onChange: (slug: string) => void;
}

export default function PlatformCombobox({ value, onChange }: PlatformComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = KNOWN_PLATFORMS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasExactMatch = KNOWN_PLATFORMS.some(
    (p) => p.name.toLowerCase() === search.toLowerCase() ||
           p.slug.toLowerCase() === search.toLowerCase()
  );
  const showCustom = search.trim().length > 0 && !hasExactMatch;

  function handleSelect(slug: string) {
    onChange(slug);
    setOpen(false);
    setSearch("");
  }

  const displayName = KNOWN_PLATFORMS.find((p) => p.slug === value)?.name || value || "";

  const triggerClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-white/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClass}
        aria-label="Select platform type"
      >
        <span className={displayName ? "text-sindicato-warm-white" : "text-sindicato-warm-white/40"}>
          {displayName || "Select platform type..."}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-sindicato-warm-white/40 flex-shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        className={`p-0 w-[--anchor-width] min-w-64 ${fileDropdownContentClass}`}
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Command shouldFilter={false} className={fileDropdownCommandClass}>
          <CommandInput
            placeholder="Search platform types..."
            value={search}
            onValueChange={setSearch}
            className="text-sindicato-warm-white placeholder:text-sindicato-warm-white/30"
          />
          <CommandList>
            <CommandEmpty className="text-sindicato-warm-white/60 py-4 text-center text-sm">
              No platforms found.
            </CommandEmpty>
            {filtered.map((platform) => (
              <CommandItem
                key={platform.slug}
                value={platform.slug}
                onSelect={() => handleSelect(platform.slug)}
                data-checked={value === platform.slug}
                className={`${fileDropdownItemClass} data-[checked=true]:bg-sindicato-bordeaux/30`}
              >
                {platform.name}
              </CommandItem>
            ))}
            {showCustom && (
              <CommandItem
                value={`custom:${search}`}
                onSelect={() => handleSelect(normalizeToSlug(search))}
                className={`text-sindicato-bordeaux ${fileDropdownItemClass}`}
              >
                Use "{search.trim()}"
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
