import { db } from "@/lib/db/client";
import { companySummaries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function invalidateCompanySummary(companyId: string) {
  await db
    .delete(companySummaries)
    .where(eq(companySummaries.companyId, companyId));
}
