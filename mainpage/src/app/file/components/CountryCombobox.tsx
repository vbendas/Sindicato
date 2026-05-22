"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "HT", name: "Haiti", flag: "🇭🇹" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "YE", name: "Yemen", flag: "🇾🇪" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
];

interface CountryComboboxProps {
  value: string;
  onChange: (code: string) => void;
}

export default function CountryCombobox({ value, onChange }: CountryComboboxProps) {
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
    "w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-sindicato-charcoal/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClass}
        aria-label="Select country"
      >
        <span className={selectedCountry ? "text-sindicato-charcoal" : "text-sindicato-charcoal/40"}>
          {selectedCountry
            ? `${selectedCountry.flag} ${selectedCountry.name}`
            : "Select country..."}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-sindicato-charcoal/40 flex-shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--anchor-width] min-w-64"
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search countries..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No countries found.</CommandEmpty>
            {filtered.map((country) => (
              <CommandItem
                key={country.code}
                value={country.code}
                onSelect={() => handleSelect(country.code)}
                data-checked={value === country.code}
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
