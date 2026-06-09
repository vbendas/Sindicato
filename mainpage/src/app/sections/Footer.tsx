"use client";

import { useT } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/navigation";
import LanguageSelector from "@/components/LanguageSelector";

interface FooterProps {
  bg?: string;
}

export default function Footer({ bg = "bg-sindicato-bordeaux" }: FooterProps) {
  const t = useT();

  return (
    <footer className={bg}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-base sm:text-lg font-bold tracking-widest text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)]">
              SINDICATO
            </span>
          </div>

          <div className="flex items-center gap-6">
            <LocalizedLink href="/manifesto" className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold">
              {t("common.manifesto")}
            </LocalizedLink>
            <LocalizedLink href="/cases" className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold">
              {t("common.cases")}
            </LocalizedLink>
            <LocalizedLink href="/donate" className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold">
              {t("common.donate")}
            </LocalizedLink>
            <a
              href="https://discord.gg/sindicato"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.1776-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
              </svg>
            </a>
            <a
              href="https://matrix.to/#/#sindicato:matrix.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.732 0h1.534v.534h.535V1.6h-.535v.534H1.732v-.534h-.534V.534h.534V0zm18.534 0h1.535v.534h.534V1.6h-.534v.534h-1.535v-.534h-.534V.534h.534V0zM1.732 22.4h1.534v-.534h.535V20.8h-.535v-.534H1.732v.534h-.534v1.066h.534v.534zm18.534 0h1.535v-.534h.534V20.8h-.534v-.534h-1.535v.534h-.534v1.066h.534v.534zM5.2 5.334h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm12-12.8h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zM8.8 8.534h1.6v1.6H8.8v-1.6zm0 3.2h1.6v1.6H8.8v-1.6zm0 3.2h1.6v1.6H8.8v-1.6zm4.8-6.4h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6zm0 3.2h1.6v1.6h-1.6v-1.6z"/>
              </svg>
            </a>
            <a
              href="https://github.com/vbendas/Sindicato"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sindicato-warm-white/40 text-[10px] sm:text-xs text-center sm:text-left">
            &copy; 2026 Sindicato. {t("footer.tagline")}
          </p>
          <LanguageSelector />
        </div>

      </div>
    </footer>
  );
}
