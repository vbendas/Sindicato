import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-sindicato-bordeaux">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-base sm:text-lg font-bold tracking-widest text-white uppercase font-[family-name:var(--font-barlow)]">
              SINDICATO
            </span>
            <p className="text-white/50 text-xs mt-1 max-w-xs">
              A public record of worker exploitation. Free to use. Worker-owned.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/manifesto" className="text-white/60 hover:text-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold">
              Manifesto
            </Link>
            <Link href="/cases" className="text-white/60 hover:text-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold">
              Cases
            </Link>
            <span className="text-white/40 text-xs font-[family-name:var(--font-jetbrains)]">
              CASE #001 IS LIVE
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-[10px] sm:text-xs text-center sm:text-left">
            &copy; 2026 Sindicato. Workers own their claims. We provide the platform, not the verdict.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-[10px] font-[family-name:var(--font-jetbrains)]">
              BUILT IN PUBLIC
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/30 text-[10px] max-w-2xl mx-auto leading-relaxed">
            Disclaimer: All cases are self-reported by individual workers. Sindicato is a reporting
            and aggregation platform, not a legal entity making these claims. We do not verify,
            endorse, or assert individual claims.
          </p>
        </div>
      </div>
    </footer>
  );
}
