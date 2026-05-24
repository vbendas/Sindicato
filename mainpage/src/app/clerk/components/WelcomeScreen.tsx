import { motion } from "framer-motion";
import { getSuggestionGroups } from "./suggestions";

interface WelcomeScreenProps {
  onSuggestionClick: (label: string) => void;
  role?: string | null;
}

export default function WelcomeScreen({ onSuggestionClick, role }: WelcomeScreenProps) {
  const suggestionGroups = getSuggestionGroups(role);
  const popularGroup = suggestionGroups.find(g => g.name === "Popular questions");
  const popularSuggestions = popularGroup?.suggestions || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <div className="w-20 h-0.5 bg-sindicato-cream/20 mb-8" />
      
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
        Clerk
      </div>
      
      <p className="text-sindicato-warm-white/40 text-sm font-[family-name:var(--font-jetbrains)] mb-10">
        Ask questions about worker exploitation data
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {popularSuggestions.slice(0, 4).map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.label)}
            className="px-4 py-2 bg-sindicato-smoked-charcoal border border-white/10 rounded-full text-sindicato-warm-white/70 hover:text-sindicato-warm-white hover:bg-white/10 transition-all font-[family-name:var(--font-jetbrains)] text-xs"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
      
      <p className="text-sindicato-warm-white/30 text-xs font-[family-name:var(--font-jetbrains)] max-w-md">
        Try asking about case totals, company statistics, or worker demographics
      </p>
    </motion.div>
  );
}
