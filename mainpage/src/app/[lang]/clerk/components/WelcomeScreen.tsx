import { motion } from "framer-motion";
import Image from "next/image";
import { getSuggestionGroups } from "./suggestions";
import { useT } from "@/lib/i18n";

interface WelcomeScreenProps {
  onSuggestionClick: (label: string) => void;
  role?: string | null;
}

export default function WelcomeScreen({ onSuggestionClick, role }: WelcomeScreenProps) {
  const t = useT();
  const suggestionGroups = getSuggestionGroups(role, t);
  const popularGroup = suggestionGroups.find(g => g.id === "popular");
  const popularSuggestions = popularGroup?.suggestions || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <div className="w-16 h-1 bg-sindicato-cream/10 rounded-full mb-8" />
      
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
        {t("clerk.name")}
      </div>
      
      <p className="text-sindicato-warm-white/40 text-sm font-[family-name:var(--font-jetbrains)] mb-10">
        {t("clerk.welcome.subtitle")}
      </p>
      
      <div className="relative size-[125px] rounded-full overflow-hidden border-2 border-black bg-sindicato-bordeaux mb-10">
        <Image
          src="/clerk.png"
          alt={t("clerk.name")}
          fill
          className="object-cover"
          sizes="125px"
        />
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {popularSuggestions.slice(0, 4).map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.label)}
            className="px-5 py-2.5 bg-sindicato-smoked-charcoal/60 backdrop-blur-xl border border-white/10 rounded-full text-sindicato-warm-white/70 hover:text-sindicato-warm-white hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 font-[family-name:var(--font-jetbrains)] text-xs"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
      
      <p className="text-sindicato-warm-white/30 text-xs font-[family-name:var(--font-jetbrains)] max-w-md">
        {t("clerk.welcome.hint")}
      </p>
    </motion.div>
  );
}
