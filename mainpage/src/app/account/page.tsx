import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { cases, companies, caseTimelineEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Header from "@/app/components/Header";
import WorkerDashboard from "./WorkerDashboard";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/file");
  }

  const workerId = session.user.id;

  const workerCases = await db
    .select({
      id: cases.id,
      caseType: cases.caseType,
      displayName: cases.displayName,
      country: cases.country,
      amountOwed: cases.amountOwed,
      currency: cases.currency,
      resolutionStatus: cases.resolutionStatus,
      status: cases.status,
      createdAt: cases.createdAt,
      companyName: companies.name,
      companySlug: companies.slug,
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .where(eq(cases.workerId, workerId))
    .orderBy(desc(cases.createdAt));

  const timelineByCase = await Promise.all(
    workerCases.map(async (c) => {
      const events = await db
        .select()
        .from(caseTimelineEvents)
        .where(eq(caseTimelineEvents.caseId, c.id))
        .orderBy(desc(caseTimelineEvents.eventDate));
      return { caseId: c.id, events };
    })
  );

  const timelineMap = Object.fromEntries(
    timelineByCase.map(({ caseId, events }) => [caseId, events])
  );

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.04 }} />
      <Header
        scrolledBg="bg-sindicato-charcoal/80 backdrop-blur-md border-white/10"
        clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white"
      />
      <div className="min-h-screen bg-sindicato-charcoal relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
              My Cases
            </h1>
            <p className="text-sindicato-warm-white/60 text-sm">
              {session.user.email}
            </p>
          </div>
          <WorkerDashboard cases={workerCases} timelineMap={timelineMap} workerId={workerId} />
        </div>
      </div>
    </>
  );
}
