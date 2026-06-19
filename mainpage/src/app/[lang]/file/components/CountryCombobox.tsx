"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useT } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/countries";
import {
  fileDropdownCommandClass,
  fileDropdownContentClass,
  fileDropdownItemClass,
} from "../fileFormStyles";

interface CountryComboboxProps {
  value: string;
  onChange: (code: string) => void;
}

export default function CountryCombobox({ value, onChange }: CountryComboboxProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setSearch("");
  }

  const triggerClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-white/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClass}
        aria-label="Select country"
      >
        <span className={selectedCountry ? "text-sindicato-warm-white" : "text-sindicato-warm-white/40"}>
          {selectedCountry
            ? `${selectedCountry.flag} ${selectedCountry.name}`
            : t("fileCase.selectCountry")}
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
            placeholder={t("fileCase.searchCountries")}
            value={search}
            onValueChange={setSearch}
            className="text-sindicato-warm-white placeholder:text-sindicato-warm-white/30"
          />
          <CommandList>
            <CommandEmpty className="text-sindicato-warm-white/60 py-4 text-center text-sm">{t("fileCase.noCountriesFound")}</CommandEmpty>
            {filtered.map((country) => (
<CommandItem
                 key={country.code}
                 value={country.code}
                 onSelect={() => handleSelect(country.code)}
                 data-checked={value === country.code}
                 className={`${fileDropdownItemClass} data-[checked=true]:bg-sindicato-bordeaux/30`}
               >
                 <span className="mr-2">{country.flag}</span>
                 {country.name}
               </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
