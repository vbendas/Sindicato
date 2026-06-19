import { db } from "@/lib/db/client";
import { cases, companies, caseTags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";

function generateDemandLetterHtml(params: {
  companyName: string;
  caseType: string;
  displayName: string;
  country: string;
  dateRange: string;
  amountOwed: string;
  currency: string;
  story: string;
  tags: string[];
  createdAt: string;
  caseId: string;
}) {
  const {
    companyName,
    caseType,
    displayName,
    country,
    dateRange,
    amountOwed,
    currency,
    story,
    tags,
    createdAt,
    caseId,
  } = params;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const caseTypeLabel = caseType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const tagsHtml =
    tags.length > 0
      ? `<ul>${tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>`
      : "<p>None identified.</p>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demand Letter — ${companyName} — Case ${caseId.slice(-8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      color: #1a1a1a;
      line-height: 1.7;
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 40px;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1a1a1a;
    }
    .header h1 {
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 11px;
      color: #666;
      letter-spacing: 2px;
    }
    .meta {
      font-size: 13px;
      color: #444;
      margin-bottom: 30px;
    }
    .meta p { margin-bottom: 4px; }
    .section { margin-bottom: 24px; }
    .section h2 {
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
      color: #333;
    }
    .section p, .section li {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .section ul {
      padding-left: 20px;
    }
    .section ul li {
      margin-bottom: 4px;
    }
    .story {
      font-style: italic;
      padding: 16px 20px;
      border-left: 3px solid #ccc;
      background: #fafafa;
      margin: 12px 0;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      margin: 12px 0;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 11px;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 40px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Demand for Payment</h1>
    <p class="subtitle">Sindicato Case #${caseId.slice(-8).toUpperCase()}</p>
  </div>

  <div class="meta">
    <p><strong>Date:</strong> ${formattedDate}</p>
    <p><strong>To:</strong> ${companyName}</p>
    <p><strong>From:</strong> ${displayName} (${country})</p>
    <p><strong>Case Filed:</strong> ${new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>

  <div class="section">
    <h2>1. Overview</h2>
    <p>
      This letter serves as a formal demand for payment related to work performed by
      ${displayName} for ${companyName} during the period of ${dateRange}.
    </p>
    <p>
      The matter is classified as: <strong>${caseTypeLabel}</strong>.
    </p>
  </div>

  <div class="section">
    <h2>2. Amount in Dispute</h2>
    <div class="amount">${currency} ${amountOwed}</div>
    <p>This amount represents unpaid compensation for work completed in accordance with the agreed terms.</p>
  </div>

  <div class="section">
    <h2>3. Statement of Facts</h2>
    <div class="story">${story.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>

  ${tags.length > 0 ? `
  <div class="section">
    <h2>4. Key Issues Identified</h2>
    ${tagsHtml}
  </div>
  ` : ""}

  <div class="section">
    <h2>${tags.length > 0 ? "5" : "4"}. Demand</h2>
    <p>
      We respectfully request that ${companyName} resolve this matter by issuing payment of
      <strong>${currency} ${amountOwed}</strong> within 30 days of the date of this letter.
    </p>
    <p>
      Failure to respond or resolve this matter will result in this case remaining on the
      public record at sindicato.report, where it is accessible to workers, legal professionals,
      media, and the public.
    </p>
  </div>

  <div class="section">
    <h2>${tags.length > 0 ? "6" : "5"}. Public Record Notice</h2>
    <p>
      This case has been filed on Sindicato (sindicato.report), a public platform for
      documenting worker exploitation. All case data — including this demand letter — is
      part of the permanent public record. ${companyName} may respond publicly through the
      platform to resolve this matter.
    </p>
  </div>

  <div class="footer">
    <p>Generated via Sindicato — sindicato.report</p>
    <p>Case #${caseId.slice(-8).toUpperCase()} | Filed ${new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #1a1a1a; color: #fff; border: none; cursor: pointer; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Authentication required.", 401);
    }

    const { id } = await params;

    const [row] = await db
      .select({
        id: cases.id,
        workerId: cases.workerId,
        displayName: cases.displayName,
        country: cases.country,
        caseType: cases.caseType,
        dateRange: cases.dateRange,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        story: cases.story,
        createdAt: cases.createdAt,
        status: cases.status,
        companyName: companies.name,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(and(eq(cases.id, id), eq(cases.status, "active")))
      .limit(1);

    if (!row) {
      return error("Case not found", 404);
    }

    if (row.workerId !== session.user.id) {
      return error("Not authorised.", 403);
    }

    const tags = await db
      .select({ tagName: caseTags.tagName })
      .from(caseTags)
      .where(eq(caseTags.caseId, id));

    const tagNames = tags.map((t) => t.tagName);

    const html = generateDemandLetterHtml({
      companyName: row.companyName,
      caseType: row.caseType,
      displayName: row.displayName,
      country: row.country || "Unknown",
      dateRange: row.dateRange,
      amountOwed: row.amountOwed,
      currency: row.currency,
      story: row.story,
      tags: tagNames,
      createdAt: row.createdAt.toISOString(),
      caseId: row.id,
    });

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="demand-letter-${row.id.slice(-8).toUpperCase()}.html"`,
      },
    });
  } catch (err) {
    console.error("Error generating demand letter:", err);
    return error("Failed to generate demand letter", 500);
  }
}
