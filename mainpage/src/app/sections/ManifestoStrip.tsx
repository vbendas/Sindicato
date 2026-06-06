"use client";

import { useT } from "@/lib/i18n";

export default function ManifestoStrip() {
  const t = useT();

  const items = [
    t("manifestoStrip.item1"),
    t("manifestoStrip.item2"),
    t("manifestoStrip.item3"),
    t("manifestoStrip.item4"),
    t("manifestoStrip.item5"),
    t("manifestoStrip.item6"),
    t("manifestoStrip.item7"),
    t("manifestoStrip.item8"),
    t("manifestoStrip.item9"),
  ];

  const flatItems = [...Array(3)].flatMap((_, groupIndex) =>
    items.map((text) => ({ text, key: `${groupIndex}-${text}` }))
  );

  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-white/10 border-b border-white/10 overflow-hidden px-4">
      <div className="marquee-track gap-x-6 py-5 sm:py-6">
        {flatItems.map((item, i) => (
          <span key={item.key} className="flex items-center gap-x-6 whitespace-nowrap">
            {i > 0 && (
              <span className="w-1 h-1 bg-white/30 rounded-full inline-block shrink-0" />
            )}
            <span className="text-sindicato-warm-white/70 text-xs sm:text-sm font-bold uppercase tracking-widest font-[family-name:var(--font-barlow)]">
              {item.text}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
