import { callOpenRouter, getScraperModel } from "@/lib/ai/openrouter";
import { isUrlSafe } from "@/lib/utils/url-safety";

const ROLE_BASED_PREFIXES = [
  "info@", "noreply@", "no-reply@", "support@",
  "admin@", "webmaster@", "postmaster@", "hostmaster@",
  "abuse@", "security@", "billing@", "help@",
  "office@", "contact@",
];

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "guerrillamail.com", "mailinator.com", "yopmail.com",
  "trashmail.com", "10minutemail.com", "discard.email", "throwaway.email",
]);

function isRoleBasedEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return ROLE_BASED_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return DISPOSABLE_DOMAINS.has(domain);
}

function isValidEmailFormat(email: string): boolean {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

function filterEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const email of emails) {
    const lower = email.toLowerCase().trim();
    if (
      !isValidEmailFormat(lower) ||
      isRoleBasedEmail(lower) ||
      isDisposableEmail(lower) ||
      seen.has(lower)
    ) {
      continue;
    }
    seen.add(lower);
    result.push(lower);
  }

  return result;
}

function stripHtml(html: string): string {
  let text = html;

  // Remove script, style, nav, footer noise
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");

  // Extract mailto: links before stripping HTML
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  const mailtoEmails: string[] = [];
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    mailtoEmails.push(match[1]);
  }

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&nbsp;/g, " ");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Return text with mailto emails appended for extraction
  return text + " " + mailtoEmails.join(" ");
}

async function fetchPageText(url: string): Promise<string | null> {
  const safety = await isUrlSafe(url);
  if (!safety.safe) {
    console.warn(`Blocked unsafe URL: ${url} — ${safety.reason}`);
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Sindicato/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    const html = await resp.text();
    return stripHtml(html);
  } catch {
    return null;
  }
}

const EXTRACTION_PROMPT = `You are an email extraction tool. Given the text content of a company's webpage, extract all email addresses that could be used to contact the company.

Rules:
- Return ONLY a valid JSON array of email strings: ["email1@example.com", "email2@example.com"]
- Include emails from mailto: links
- Include emails visible in page text
- Do NOT include image filenames, CSS values, or JavaScript patterns that look like emails
- If no emails found, return: []
- Do not include any explanation, only the JSON array`;

export async function scrapeCompanyEmails(
  websiteUrl: string,
  companyName: string,
): Promise<{ emails: string[]; source: string }> {
  const base = websiteUrl.replace(/\/+$/, "");
  const pathsToTry = ["", "/contact", "/contact-us", "/about"];
  const allTexts: string[] = [];

  // Fetch homepage + common contact pages
  for (const path of pathsToTry) {
    const url = path ? `${base}${path}` : base;
    const text = await fetchPageText(url);
    if (text) {
      allTexts.push(text);
    }
    // Stop early if we already have enough content
    if (allTexts.join("").length > 4000) break;
  }

  if (allTexts.length === 0) {
    return { emails: [], source: "website_unreachable" };
  }

  const combinedText = allTexts.join("\n\n").slice(0, 8000);

  try {
    const response = await callOpenRouter({
      model: getScraperModel(),
      systemPrompt: EXTRACTION_PROMPT,
      userPrompt: `Company: ${companyName}\nWebsite: ${base}\n\nPage content:\n${combinedText}`,
      maxTokens: 512,
      temperature: 0.1,
    });

    // Parse LLM response — expect a JSON array
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return { emails: [], source: "llm_parse_error" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      return { emails: [], source: "llm_parse_error" };
    }

    const emails = filterEmails(parsed);
    return { emails, source: "llm_website" };
  } catch (err) {
    console.error("LLM email extraction failed:", err);
    return { emails: [], source: "llm_error" };
  }
}
