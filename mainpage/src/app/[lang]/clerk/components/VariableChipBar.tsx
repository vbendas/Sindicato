"use client";

import VariableSelector from "./VariableSelector";
import type { Variables } from "./suggestions";
import { useT } from "@/lib/i18n";

interface VariableDef {
  name: string;
  label: string;
  dataSource: keyof Variables;
}

interface VariableChipBarProps {
  variables: VariableDef[];
  values: Record<string, string>;
  labels: Record<string, string>;
  data: Variables;
  onChange: (name: string, value: string, label: string) => void;
}

export default function VariableChipBar({ variables, values, labels, data, onChange }: VariableChipBarProps) {
  const t = useT();
  if (variables.length === 0) return null;

  const allResolved = variables.every((v) => values[v.name]);

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
      {variables.map((v) => (
        <VariableSelector
          key={v.name}
          label={v.label}
          options={data[v.dataSource] || []}
          value={values[v.name] || ""}
          onChange={(val, lab) => onChange(v.name, val, lab)}
        />
      ))}
      {!allResolved && (
        <span className="text-[10px] text-sindicato-warm-white/40 ml-1">
          {t("clerk.page.fillVariables")}
        </span>
      )}
    </div>
  );
}
