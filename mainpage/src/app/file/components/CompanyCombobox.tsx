"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

const KNOWN_COMPANIES = [
  { slug: "uber", name: "Uber", vertical: "gig" },
  { slug: "upwork", name: "Upwork", vertical: "remote" },
  { slug: "fiverr", name: "Fiverr", vertical: "remote" },
  { slug: "alignerr", name: "Alignerr", vertical: "remote" },
  { slug: "doordash", name: "DoorDash", vertical: "gig" },
  { slug: "instacart", name: "Instacart", vertical: "gig" },
  { slug: "lyft", name: "Lyft", vertical: "gig" },
  { slug: "taskrabbit", name: "TaskRabbit", vertical: "gig" },
  { slug: "remotasks", name: "Remotasks", vertical: "remote" },
  { slug: "scale-ai", name: "Scale AI", vertical: "remote" },
  { slug: "appen", name: "Appen", vertical: "remote" },
  { slug: "amazon-mechanical-turk", name: "Amazon Mechanical Turk", vertical: "remote" },
  { slug: "clickworker", name: "Clickworker", vertical: "remote" },
  { slug: "grubhub", name: "Grubhub", vertical: "gig" },
  { slug: "shipt", name: "Shipt", vertical: "gig" },
  { slug: "freelancer", name: "Freelancer.com", vertical: "remote" },
  { slug: "toptal", name: "Toptal", vertical: "remote" },
  { slug: "99designs", name: "99designs", vertical: "remote" },
  { slug: "crowdworks", name: "CrowdWorks", vertical: "remote" },
  { slug: "cloudworkers", name: "CloudWorkers", vertical: "remote" },
  { slug: "spare5", name: "Spare5", vertical: "remote" },
  { slug: "neevo", name: "Neevo", vertical: "remote" },
];

function normalizeToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CompanyComboboxProps {
  value: string;
  displayName: string;
  onChange: (slug: string, displayName: string) => void;
}

export default function CompanyCombobox({ value, displayName, onChange }: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = KNOWN_COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasExactMatch = KNOWN_COMPANIES.some(
    (c) => c.name.toLowerCase() === search.toLowerCase()
  );
  const showCustom = search.trim().length > 0 && !hasExactMatch;

  function handleSelect(slug: string, name: string) {
    onChange(slug, name);
    setOpen(false);
    setSearch("");
  }

  const triggerClass =
    "w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm flex items-center justify-between cursor-pointer hover:border-sindicato-charcoal/40";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClass}
        aria-label="Select company"
      >
        <span className={displayName ? "text-sindicato-charcoal" : "text-sindicato-charcoal/40"}>
          {displayName || "Select company..."}
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
            placeholder="Search companies..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            {filtered.map((company) => (
              <CommandItem
                key={company.slug}
                value={company.slug}
                onSelect={() => handleSelect(company.slug, company.name)}
                data-checked={value === company.slug}
              >
                {company.name}
                <span className="ml-auto text-xs text-sindicato-charcoal/40 capitalize">
                  {company.vertical}
                </span>
              </CommandItem>
            ))}
            {showCustom && (
              <CommandItem
                value={`custom:${search}`}
                onSelect={() =>
                  handleSelect(normalizeToSlug(search), search.trim())
                }
                className="text-sindicato-bordeaux"
              >
                Use &ldquo;{search.trim()}&rdquo;
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
