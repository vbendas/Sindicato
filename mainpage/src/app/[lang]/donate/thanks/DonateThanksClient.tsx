"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../sections/Footer";
import { useT } from "@/lib/i18n";

export type DonateStatus = "completed" | "processing" | "missing" | "error";

interface DonateThanksClientProps {
  status: DonateStatus;
  amountFormatted: string | null;
  customerEmail: string | null;
  baseUrl: string;
  returnTo: string | null;
}

export default function DonateThanksClient({
  status,
  amountFormatted,
  customerEmail,
  baseUrl,
  returnTo,
}: DonateThanksClientProps) {
  const t = useT();
  const shareUrl = `${baseUrl}/donate`;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[60] grain-overlay"
        style={{ opacity: 0.45 }}
      />
      <Header />
      <main className="bg-sindicato-bordeaux min-h-screen">
        <section className="pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link
              href="/donate"
              className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors mb-6 inline-block font-[family-name:var(--font-barlow)] font-bold"
            >
              &larr; {t("donate.back")}
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-4">
              {status === "completed"
                ? t("donate.thanks.title")
                : status === "processing"
                  ? t("donate.thanks.processing")
                  : t("donate.thanks.title")}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/10 p-8 sm:p-10"
          >
            {status === "completed" && (
              <>
                <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
                  {t("donate.thanks.body")}
                </p>
                {amountFormatted && (
                  <p className="text-sindicato-warm-white mt-6 text-lg font-[family-name:var(--font-barlow)] font-bold uppercase tracking-wider">
                    {t("donate.thanks.amount").replace(
                      "{amount}",
                      amountFormatted
                    )}
                  </p>
                )}
                {customerEmail && (
                  <p className="text-sindicato-warm-white/50 text-sm leading-relaxed mt-2">
                    {t("donate.thanks.receiptNote")}
                  </p>
                )}
              </>
            )}

            {status === "processing" && (
              <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
                {t("donate.thanks.processingBody")}
              </p>
            )}

            {status === "missing" && (
              <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
                {t("donate.thanks.expiredBody")}
              </p>
            )}

            {status === "error" && (
              <p className="text-sindicato-warm-white/80 text-base sm:text-lg leading-relaxed">
                {t("donate.errorGeneric")}
              </p>
            )}
          </motion.div>

          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-12"
            >
              <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-widest font-[family-name:var(--font-barlow)] font-bold mb-4">
                {t("donate.thanks.share")}
              </p>
              <DonateShareButtons
                message={t("donate.thanks.shareMessage")}
                shareUrl={shareUrl}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            {returnTo && (
              <Link
                href={returnTo}
                className="bg-sindicato-warm-white text-sindicato-bordeaux px-6 py-3 font-bold uppercase tracking-wider text-sm font-[family-name:var(--font-barlow)] hover:bg-white transition-colors inline-block mb-4"
              >
                {t("donate.thanks.fromCasesCta")}
              </Link>
            )}
            <Link
              href="/"
              className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold"
            >
              {t("donate.thanks.homeCta")}
            </Link>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
}

function DonateShareButtons({
  message,
  shareUrl,
}: {
  message: string;
  shareUrl: string;
}) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(message);
  const links = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-10 inline-flex items-center text-sindicato-warm-white/80 hover:text-sindicato-warm-white border border-white/15 hover:border-white/40 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
