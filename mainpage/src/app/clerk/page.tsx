"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import SuggestionPanel from "./components/SuggestionPanel";
import VariableChipBar from "./components/VariableChipBar";
import { getSuggestionGroups, filterSuggestions, getTemplateDefinition } from "./components/suggestions";
import type { SuggestionItem, Variables } from "./components/suggestions";
import type { TemplateVariable } from "./prompts";

export default function ClerkPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [variablesData, setVariablesData] = useState<Variables | null>(null);
  const [activeVars, setActiveVars] = useState<TemplateVariable[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [varLabels, setVarLabels] = useState<Record<string, string>>({});

  const suggestionGroups = getSuggestionGroups();

  useEffect(() => {
    fetch("/api/clerk/variables")
      .then((r) => r.json())
      .then((d) => setVariablesData(d.data))
      .catch(() => {});
  }, []);

  const hasUnresolvedVars = activeVars.length > 0 && activeVars.some((v) => !varValues[v.name]);

  const sendDisabled = !prompt.trim() || isLoading || hasUnresolvedVars;

  const handleSuggestionSelect = useCallback((suggestion: SuggestionItem) => {
    setPrompt(suggestion.template);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});

    if (suggestion.templatePromptId) {
      const def = getTemplateDefinition(suggestion.templatePromptId);
      if (def) {
        setActiveVars(def.variables);
      } else {
        setActiveVars([]);
      }
    } else {
      setActiveVars([]);
    }
  }, []);

  const handleVariableChange = useCallback((name: string, value: string, label: string) => {
    setVarValues((prev) => ({ ...prev, [name]: value }));
    setVarLabels((prev) => ({ ...prev, [name]: label }));
    setPrompt((prev) => prev.replace(`{${name}}`, label));
  }, []);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    if (activeVars.length > 0) {
      const stillPresent = activeVars.filter((v) => value.includes(`{${v.name}}`));
      if (stillPresent.length !== activeVars.length) {
        setActiveVars(stillPresent);
        if (stillPresent.length === 0) {
          setVarValues({});
          setVarLabels({});
        }
      }
    }
  }, [activeVars]);

  const handleSubmit = useCallback(() => {
    if (sendDisabled) return;
    setIsLoading(true);

    let finalPrompt = prompt;
    for (const [name, label] of Object.entries(varLabels)) {
      finalPrompt = finalPrompt.replace(`{${name}}`, label);
    }

    console.log("Sending:", finalPrompt);
    setTimeout(() => {
      setIsLoading(false);
      setPrompt("");
      setActiveVars([]);
      setVarValues({});
      setVarLabels({});
    }, 1000);
  }, [prompt, sendDisabled, varLabels]);

  const filteredGroups = filterSuggestions(suggestionGroups, prompt);

  const panelVisible = showSuggestions && filteredGroups.some((g) => g.suggestions.length > 0);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header
        scrolledBg="bg-sindicato-smoked-charcoal border-white/10"
        clerkBg="bg-sindicato-cream text-sindicato-charcoal"
        navTextColor="text-sindicato-cream/70"
        navHoverColor="hover:text-sindicato-cream"
      />
      <main className="flex min-h-screen flex-col items-center bg-sindicato-charcoal">
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-12 h-0.5 bg-sindicato-cream/20 mb-6 mx-auto" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-cream uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-2">
              Clerk
            </h1>
            <p className="text-sindicato-cream/40 text-sm font-[family-name:var(--font-jetbrains)]">
              Ask questions about worker exploitation data
            </p>
          </motion.div>
          <div className="mt-auto mb-[10px]">
            <div className="relative">
              {panelVisible && (
                <SuggestionPanel
                  groups={filteredGroups}
                  searchQuery={prompt}
                  onSelect={handleSuggestionSelect}
                  onClose={() => setShowSuggestions(false)}
                />
              )}
              <PromptInput
                value={prompt}
                onValueChange={handlePromptChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full bg-sindicato-smoked-charcoal border-sindicato-smoked-charcoal shadow-lg"
              >
                <PromptInputTextarea
                  placeholder="Ask anything about Sindicato's data..."
                  className="text-sindicato-cream/90 placeholder:text-sindicato-cream/30"
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                />

                {activeVars.length > 0 && variablesData && (
                  <VariableChipBar
                    variables={activeVars}
                    values={varValues}
                    labels={varLabels}
                    data={variablesData}
                    onChange={handleVariableChange}
                  />
                )}

                <PromptInputActions className="justify-end px-2 pb-2">
                  <PromptInputAction>
                    <Button
                      size="icon"
                      disabled={sendDisabled}
                      onClick={handleSubmit}
                      className="size-9 rounded-full bg-sindicato-cream text-sindicato-charcoal hover:bg-sindicato-cream/90"
                    >
                      <ArrowUp size={18} />
                    </Button>
                  </PromptInputAction>
                </PromptInputActions>
              </PromptInput>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
