export default function ManifestoStrip() {
  const items = [
    "Public Record",
    "Worker-First",
    "Free to Use",
    "No Ads. Ever.",
  ];

  return (
    <section className="bg-sindicato-bordeaux-dark border-t border-white/10 border-b border-white/10 overflow-hidden px-4">
      <div className="marquee-track py-5 sm:py-6">
        {[...Array(2)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-x-6 whitespace-nowrap">
            {items.map((item, i) => (
              <span key={`${groupIndex}-${i}`} className="flex items-center gap-x-6">
                <span className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-widest font-[family-name:var(--font-barlow)]">
                  {item}
                </span>
                <span className="w-1 h-1 bg-white/30 rounded-full inline-block" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
