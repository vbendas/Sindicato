"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import {
  fileDropdownCommandClass,
  fileDropdownContentClass,
  fileDropdownItemClass,
} from "../fileFormStyles";
import { useT } from "@/lib/i18n";

function normalizeToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CompanyOption {
  slug: string;
  name: string;
  vertical: string;
  caseCount: number;
}

interface CompanyComboboxProps {
  value: string;
  displayName: string;
  onChange: (slug: string, displayName: string) => void;
}

export default function CompanyCombobox({ value, displayName, onChange }: CompanyComboboxProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/companies?limit=200")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.ok && Array.isArray(json.data?.companies)) {
          setCompanies(json.data.companies);
        } else {
          setLoadError("loadFailed");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("loadFailed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = search.trim();
  const filtered = trimmed
    ? companies.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
    : companies;

  const hasExactMatch = filtered.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  const showAdd = trimmed.length > 0 && !hasExactMatch;

  function handleSelect(slug: string, name: string) {
    onChange(slug, name);
    setOpen(false);
    setSearch("");
  }

  function handleAdd() {
    handleSelect(normalizeToSlug(trimmed), trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && showAdd) {
      e.preventDefault();
      handleAdd();
    }
  }

  const triggerClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-white/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClass}
        aria-label="Select company"
      >
        <span className={displayName ? "text-sindicato-warm-white" : "text-sindicato-warm-white/40"}>
          {displayName || t("fileCase.company") + "..."}
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
            placeholder={t("fileCase.searchCompanies")}
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
            className="text-sindicato-warm-white placeholder:text-sindicato-warm-white/30"
          />
          <CommandList>
            {loading && (
              <CommandEmpty className="text-sindicato-warm-white/60 py-4 text-center text-sm">
                {t("fileCase.loadingCompanies")}
              </CommandEmpty>
            )}
            {!loading && loadError && (
              <CommandEmpty className="text-sindicato-warm-white/60 py-4 text-center text-sm">
                {t("fileCase.companiesLoadFailed")}
              </CommandEmpty>
            )}
            {!loading && !loadError && filtered.length === 0 && !showAdd && (
              <CommandEmpty className="text-sindicato-warm-white/60 py-4 text-center text-sm">
                {t("fileCase.noCompaniesFound")}
              </CommandEmpty>
            )}
            {!loading && !loadError && filtered.length > 0 && (
              <CommandGroup heading={t("fileCase.existingCompanies")}>
                {filtered.map((company) => (
                  <CommandItem
                    key={company.slug}
                    value={company.slug}
                    onSelect={() => handleSelect(company.slug, company.name)}
                    data-checked={value === company.slug}
                    className={`${fileDropdownItemClass} data-[checked=true]:bg-sindicato-bordeaux/30`}
                  >
                    {company.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showAdd && (
              <>
                {filtered.length > 0 && <CommandSeparator />}
                <CommandItem
                  value="__add__"
                  onSelect={handleAdd}
                  className={`text-sindicato-bordeaux ${fileDropdownItemClass}`}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {t("fileCase.addCompanyNamed", { name: trimmed })}
                </CommandItem>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
