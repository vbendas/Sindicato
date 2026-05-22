"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { motion } from "framer-motion";

const informacoes = [
  {
    pergunta: "Alguém vai saber que fui eu?",
    resposta: "Não. Seu nome real e email nunca são exibidos publicamente. Nós geramos um alias anônimo (caso-0000@sindicato.report) que é o único ponto de contato compartilhado. Sua identidade fica conosco, criptografada.",
  },
  {
    pergunta: "A empresa pode descobrir quem eu sou?",
    resposta: "Somente se pagarem a taxa de acesso e assinarem um acordo legal de não retaliação. Cada acesso é registrado e você é notificado imediatamente. Você nunca é obrigado a responder.",
  },
  {
    pergunta: "As autoridades de imigração podem acessar minhas informações?",
    resposta: "Não. O Sindicato opera sob a lei portuguesa e o GDPR da UE. Não compartilhamos dados com nenhuma autoridade governamental, a menos que sejamos legalmente obrigados por uma ordem judicial portuguesa. Não temos nenhuma conexão com a aplicação da lei de imigração.",
  },
  {
    pergunta: "E se eu usei a conta de outra pessoa?",
    resposta: "Sua identidade está protegida independentemente. Nós apenas verificamos que você é uma pessoa real — não quem você é, onde você mora ou qual conta você usou. Seu caso é válido por si só.",
  },
  {
    pergunta: "E se meu inglês não for bom?",
    resposta: "Envie em qualquer idioma. Nossa IA traduz seu caso para o mural público. Use o botão 'Help me express this clearly' se quiser, ou use o Clerk AI para registrar em uma conversa. Suas palavras, seu idioma.",
  },
];

export default function SeguroPage() {
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-cream mb-4">
                Sua Segurança Vem Primeiro
              </h1>
              <p className="text-sindicato-cream/60 text-lg max-w-2xl mx-auto">
                Construímos esta plataforma para que nenhum trabalhador tenha que
                escolher entre denunciar a exploração e se proteger.
              </p>
            </div>

            <div className="space-y-6 mb-12">
              {informacoes.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-6"
                >
                  <h3 className="text-sindicato-cream font-bold text-lg mb-3">
                    {item.pergunta}
                  </h3>
                  <p className="text-sindicato-cream/60 leading-relaxed">
                    {item.resposta}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/file"
                className="inline-block bg-sindicato-red text-sindicato-cream px-10 py-4 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors text-lg"
              >
                Registre seu caso — é seguro
              </Link>
              <p className="text-sindicato-cream/30 text-xs mt-4">
                Sem necessidade de conta. Nenhum dado pessoal além do que você escolher compartilhar.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
