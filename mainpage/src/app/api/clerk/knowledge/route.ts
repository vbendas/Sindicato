import { NextRequest, NextResponse } from "next/server";
import { findKBMatch } from "@/lib/clerk/knowledge-base";
import { callOpenRouter, getClerkModel } from "@/lib/ai/openrouter";

const CLERK_KB_SYSTEM = `You are the Sindicato Clerk, a helpful assistant for the Sindicato platform.
You answer questions about what Sindicato is, how it works, its mission, and how to use the platform.

ABOUT SINDICATO:
Sindicato is a platform that documents and tracks worker exploitation cases — wage theft, unpaid work, and contractor exploitation. Workers file reports, and the platform aggregates them into a public database that legal professionals, media, and researchers can query.

HOW IT STARTED:
Sindicato was created after a machine learning engineer had wages stolen by Alignerr (operated by Labelbox Inc). After documenting the case, they discovered the same pattern had affected hundreds of workers. Each worker was told they were alone. Sindicato exists to make exploitation patterns visible and actionable.

HOW TO FILE A CASE:
Go to sindicato.report/file. Fill in details about the exploitation: company, what happened, dates, amounts owed, evidence. Identity is protected via aliased emails.

DATA ACCESS:
- Everyone: aggregated public data (counts, totals, trends)
- Lawyers (approved): contact aliases for unresolved cases
- Companies (approved): their own unresolved cases with contact aliases
- Media & researchers (approved): contact aliases for any company's cases

PRIVACY:
Real emails never shown. Aliased emails (case-abc123@sindicato.report) forward messages. Contact access logged and rate-limited.

MANIFESTO:
Exploitation is not an accident — it's a business model. The uberization model classifies workers as contractors, sources from countries with weaker protections, and controls dispute resolution. Sindicato makes exploitation expensive — visible, documented, and legally actionable.

REGISTRATION:
Go to sindicato.report/register, select role (lawyer/company/media), provide details, accept ToS, wait for admin approval.

FEATURES:
- File cases at /file
- Query data with AI-powered natural language search
- Download .md reports with full case details
- Transparency page at /transparency
- Cases wall at /cases

RULES:
- Be concise (2-4 sentences per answer)
- If the question is about querying data, guide them to use the "Query Data" feature
- If the question requires human help, suggest the "Contact Sindicato" option
- Never make up information not in the provided context
- If unsure, say "I'm not sure about that. Would you like to contact Sindicato directly?"
- Use markdown formatting for readability
- Keep answers friendly but factual`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const match = findKBMatch(question);

    if (match.confidence === "high") {
      return NextResponse.json({ answer: match.answer, source: "static" });
    }

    try {
      const aiAnswer = await callOpenRouter({
        model: getClerkModel(),
        systemPrompt: CLERK_KB_SYSTEM,
        userPrompt: question,
        maxTokens: 512,
        temperature: 0.5,
      });

      if (aiAnswer && aiAnswer.trim()) {
        return NextResponse.json({ answer: aiAnswer, source: "ai" });
      }
    } catch {}

    if (match.confidence === "low") {
      return NextResponse.json({ answer: match.answer, source: "static" });
    }

    return NextResponse.json({
      answer:
        "I'm not sure about that. I can help with questions about Sindicato, how to file cases, data access, privacy, and the platform's mission. For other questions, try the **Contact Sindicato** option to reach the team directly.",
      source: "fallback",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
