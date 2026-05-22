import { db } from "../src/lib/db/client";
import { cases, companies, caseTimelineEvents } from "../src/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

async function main() {
  console.log("Backfilling timeline events for existing cases...");

  const allCases = await db
    .select({
      id: cases.id,
      dateRange: cases.dateRange,
      createdAt: cases.createdAt,
      amountOwed: cases.amountOwed,
      currency: cases.currency,
      companyName: companies.name,
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .where(eq(cases.status, "active"))
    .orderBy(asc(cases.createdAt));

  console.log(`Found ${allCases.length} active cases.`);

  let created = 0;
  let skipped = 0;

  for (const c of allCases) {
    const existing = await db
      .select({ id: caseTimelineEvents.id })
      .from(caseTimelineEvents)
      .where(
        and(
          eq(caseTimelineEvents.caseId, c.id),
          eq(caseTimelineEvents.isAutomatic, true)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(caseTimelineEvents).values({
      caseId: c.id,
      eventType: "case_updated",
      eventDate: c.createdAt,
      title: `Started working on ${c.companyName}`,
      description: `Case filed against ${c.companyName}. Work period reported: ${c.dateRange}. Amount owed: ${c.currency} ${c.amountOwed}.`,
      direction: "system",
      labels: ["CASE FILED"],
      isAutomatic: true,
    });

    created++;
    if (created % 10 === 0) {
      console.log(`  ... ${created} events created so far`);
    }
  }

  console.log(`\nDone! Created ${created} events, skipped ${skipped} cases (already have events).`);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
