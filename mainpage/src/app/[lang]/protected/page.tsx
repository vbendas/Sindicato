"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

export default function ProtectedPage() {
  const { locale } = useLocale();
  const fears = [
    {
      question: "Will anyone know it was me?",
      answer:
        "No. Your real name and email are never displayed publicly. We generate an anonymous alias (case-0000@sindicato.report) that is the only contact point ever shared. Your identity stays with us, encrypted.",
    },
    {
      question: "Can the company find out who I am?",
      answer:
        "Only if they pay the access fee. Every access is logged and you are notified immediately. Your real contact information is never shared without your explicit consent. You are never forced to respond.",
    },
    {
      question: "Can immigration authorities access my information?",
      answer:
        "No. Sindicato operates under Portuguese law and EU GDPR. We do not share data with any government authority unless legally compelled by a Portuguese court order. We have no connection to immigration enforcement.",
    },
    {
      question: "What if I used someone else's account?",
      answer:
        "Your identity is protected regardless. We only verify that you are a real person — not who you are, where you live, or what account you used. Your case stands on its own merit.",
    },
    {
      question: "What if my English isn't good?",
      answer:
        "Submit in any language. Our AI translates your case for the public wall. Use the 'Help me express this clearly' button if you want, or use Clerk AI to file in a conversation. Your words, your language.",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header />
      <div className="relative pt-24 pb-16 bg-sindicato-charcoal">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white mb-4">
                Your Safety Comes First
              </h1>
              <p className="text-sindicato-warm-white/60 text-lg max-w-2xl mx-auto">
                We built this platform so no worker has to choose between reporting
                exploitation and protecting themselves.
              </p>
            </div>

            <div className="space-y-6 mb-12">
              {fears.map((fear, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-sindicato-warm-white/5 border border-sindicato-warm-white/10 p-6"
                >
                  <h3 className="text-sindicato-warm-white font-bold text-lg mb-3">
                    {fear.question}
                  </h3>
                  <p className="text-sindicato-warm-white/60 leading-relaxed">
                    {fear.answer}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/file`}
                className="inline-block bg-sindicato-red text-sindicato-warm-white px-10 py-4 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors text-lg"
              >
                File your case — it&apos;s safe
              </Link>
              <p className="text-sindicato-warm-white/30 text-xs mt-4">
                No account needed. No personal details required beyond what you choose to share.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
