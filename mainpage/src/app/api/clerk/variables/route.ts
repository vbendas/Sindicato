import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { ne } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

const AGE_RANGES = ["18-25", "26-35", "36-45", "46-55", "55+"];
const VERTICALS = ["remote", "gig"];
const CASE_TYPES = [
  "unpaid_wages",
  "late_payment",
  "sudden_deactivation",
  "unfair_review",
  "predatory_practices",
  "harassment",
  "retaliation",
  "contract_violation",
  "data_privacy",
  "other",
];
const SEXES = ["male", "female", "non-binary", "prefer not to say"];

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return error("Too many requests", 429);
  }

  try {
    const [companyRows, countryRows] = await Promise.all([
      db
        .select({ name: companies.name, slug: companies.slug })
        .from(companies)
        .orderBy(companies.name),
      db
        .select({ country: cases.country })
        .from(cases)
        .where(ne(cases.status, "deleted"))
        .groupBy(cases.country)
        .orderBy(cases.country),
    ]);

    const companiesList = companyRows.map((c) => ({
      label: c.name,
      value: c.slug,
    }));

    const countriesList = countryRows
      .filter((r) => r.country)
      .map((r) => ({
        label: r.country,
        value: r.country,
      }));

    return success({
      companies: companiesList,
      countries: countriesList,
      verticals: VERTICALS.map((v) => ({ label: v, value: v })),
      case_types: CASE_TYPES.map((c) => ({
        label: c.replace(/_/g, " "),
        value: c,
      })),
      age_ranges: AGE_RANGES.map((a) => ({ label: a, value: a })),
      sexes: SEXES.map((s) => ({ label: s, value: s })),
      age_from: AGE_RANGES.map((a) => ({ label: a, value: a.split("-")[0] })),
      age_to: AGE_RANGES.map((a) => ({ label: a, value: a.split("-")[1] })),
    });
  } catch (err) {
    console.error("Error fetching variables:", err);
    return error("Failed to fetch variables", 500);
  }
}
