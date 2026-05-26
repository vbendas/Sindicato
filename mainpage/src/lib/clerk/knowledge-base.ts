export type KBEntry = {
  question: string;
  answer: string;
  keywords: string[];
};

export const KB_ENTRIES: KBEntry[] = [
  {
    question: "What is Sindicato?",
    answer:
      "Sindicato is a platform that documents and tracks worker exploitation cases — wage theft, unpaid work, and contractor exploitation. Workers file reports, and the platform aggregates them into a public database that legal professionals, media, and researchers can query. The goal is to make exploitation patterns visible and actionable, so companies can no longer treat wage theft as a cost of doing business.",
    keywords: ["what", "sindicato", "platform", "about", "is"],
  },
  {
    question: "Why was Sindicato created?",
    answer:
      "Sindicato was created after a machine learning engineer had wages stolen by a company called Alignerr (operated by Labelbox Inc). After documenting and escalating the case with no resolution, they discovered the same pattern had affected hundreds of workers across multiple platforms. Each worker was told they were alone. Sindicato exists to ensure that never happens again — by making exploitation patterns visible, documented, and impossible to ignore.",
    keywords: ["why", "created", "started", "founded", "origin", "reason", "purpose"],
  },
  {
    question: "How do I file a case?",
    answer:
      'Click the "File a case" option in the quick actions, or go to sindicato.report/file. You\'ll be guided through a form where you provide details about the exploitation: the company, what happened, dates, amounts owed, and any evidence you have. Your identity is protected — contact information is aliased and only shared with approved legal professionals or media under strict conditions.',
    keywords: ["file", "case", "report", "submit", "how", "exploitation", "complaint"],
  },
  {
    question: "Who can access the data?",
    answer:
      "The database has different access levels:\n\n- **Everyone** can query aggregated public data (counts, totals, trends)\n- **Lawyers** (approved) can access contact aliases for unresolved cases to reach workers\n- **Companies** (approved) can see their own unresolved cases with contact aliases\n- **Media & researchers** (approved) can access contact aliases for any company's cases\n\nAll data access is logged and audited. Contact queries are rate-limited to prevent abuse.",
    keywords: ["access", "data", "who", "see", "view", "permission", "lawyer", "company", "media"],
  },
  {
    question: "How is my privacy protected?",
    answer:
      "Worker privacy is central to Sindicato's design:\n\n- Your real email is never shown. Instead, an aliased email (e.g., case-abc123@sindicato.report) forwards messages to you\n- Contact information is only accessible by approved lawyers, companies, and media accounts\n- All data access is logged to audit tables\n- Contact queries are rate-limited (1 per 24 hours per user)\n- Companies can only see cases filed against their own company\n- Individual worker names are never revealed in query results",
    keywords: ["privacy", "protect", "anonymous", "identity", "safe", "email", "alias"],
  },
  {
    question: "What is the manifesto about?",
    answer:
      "The Sindicato manifesto declares that exploitation is not an accident — it's a business model. The uberization model classifies workers as contractors, sources from countries with weaker legal protections, and makes dispute resolution a black box controlled by the same party that owes you money. Sindicato's position: workers' labor is not a discretionary expense. The platform exists to make exploitation expensive — visible, documented, and legally actionable.",
    keywords: ["manifesto", "mission", "belief", "values", "declaration"],
  },
  {
    question: "How does the data query work?",
    answer:
      'Use the "Query Data" option to ask questions in natural language about the exploitation database. For example:\n\n- "How many cases against Company X?"\n- "What are the most common violations?"\n- "Total unpaid wages across all cases"\n\nThe AI translates your question into a database query, executes it, and returns a concise summary. For full case details, individual IDs, and complete stories, you can download a .md report file.',
    keywords: ["query", "data", "search", "ask", "database", "how", "work"],
  },
  {
    question: "What types of cases are tracked?",
    answer:
      "Sindicato tracks worker exploitation cases including:\n\n- **Unpaid wages** — work completed but payment withheld\n- **Retaliation** — account deactivation, project removal, or lockout after raising payment concerns\n- **Retroactive rejection** — completed work retroactively marked as failed to avoid payment\n- **Contract exploitation** — terms changed unilaterally after work was done\n\nCases span remote work (AI training, annotation, freelancing) and gig work (delivery, rideshare, etc.).",
    keywords: ["types", "cases", "tracked", "categories", "violations", "exploitation"],
  },
  {
    question: "How do I register as a lawyer, company, or media?",
    answer:
      'Go to sindicato.report/register and select your role (lawyer, company, or media). You\'ll need to:\n\n1. Provide your email and professional details\n2. Accept the Terms of Service\n3. Wait for admin approval\n\nOnce approved, you can log in and access additional data (contact aliases, company-specific views, etc.). Pending accounts can still browse public data.',
    keywords: ["register", "sign up", "lawyer", "company", "media", "account", "approval"],
  },
  {
    question: "Is Sindicato free to use?",
    answer:
      "Yes. Sindicato is free for workers to file cases and for anyone to browse public data. The platform is funded through donations. If you'd like to support the project, you can donate at sindicato.report/donate.",
    keywords: ["free", "cost", "price", "pay", "donate", "funding", "money"],
  },
  {
    question: "What happens after I file a case?",
    answer:
      "After filing:\n\n1. Your case is added to the database with a unique ID\n2. An aliased contact email is created for your case\n3. Your case becomes visible in public queries (aggregated data)\n4. Approved lawyers, media, or your company may see your case details and reach out via the alias\n5. You can track your case status at sindicato.report/account\n\nYou remain anonymous throughout the process.",
    keywords: ["after", "file", "happens", "next", "process", "status", "track"],
  },
  {
    question: "How can I contact Sindicato?",
    answer:
      'You can use the "Contact Sindicato" option right here in the chat widget. Select a category (General, Legal, Press, Partnership, Bug Report, or Other), fill in your details, and send your message. You can also attach files if needed. The team will get back to you as soon as possible.',
    keywords: ["contact", "reach", "email", "talk", "support", "help", "message"],
  },
  {
    question: "What countries does Sindicato cover?",
    answer:
      "Sindicato tracks cases globally. Workers from any country can file reports. The database includes cases from multiple continents, reflecting the global nature of remote and gig work exploitation. You can query cases by country using the data query feature.",
    keywords: ["countries", "global", "international", "where", "location", "region"],
  },
  {
    question: "How do I download data or reports?",
    answer:
      "When you query data using the chat, responses include a summary in the chat window. For full details — individual case IDs, complete stories, contact information — click the 'Download full report (.md)' button that appears after data responses. This generates a Markdown file with all case details.",
    keywords: ["download", "report", "export", "md", "markdown", "file", "data"],
  },
  {
    question: "What is the transparency page?",
    answer:
      "The transparency page at sindicato.report/transparency shows Sindicato's financial information — how donations are received and spent. It's part of the platform's commitment to operating openly and accountably.",
    keywords: ["transparency", "financial", "donations", "spending", "open"],
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreEntry(entry: KBEntry, question: string): number {
  const tokens = tokenize(question);
  let score = 0;

  for (const keyword of entry.keywords) {
    for (const token of tokens) {
      if (token === keyword) score += 3;
      else if (token.includes(keyword) || keyword.includes(token)) score += 1;
    }
  }

  const entryTokens = tokenize(entry.question);
  for (const et of entryTokens) {
    for (const qt of tokens) {
      if (et === qt) score += 2;
    }
  }

  return score;
}

export function findKBMatch(question: string): { answer: string; confidence: "high" | "low" | "none" } {
  let bestScore = 0;
  let bestEntry: KBEntry | null = null;

  for (const entry of KB_ENTRIES) {
    const s = scoreEntry(entry, question);
    if (s > bestScore) {
      bestScore = s;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore < 3) return { answer: "", confidence: "none" };
  if (bestScore >= 5) return { answer: bestEntry.answer, confidence: "high" };
  return { answer: bestEntry.answer, confidence: "low" };
}
