import { db } from "@/lib/db/client";
import { workers, companies, cases } from "@/lib/db/schema";

const remoteCompanies = [
  { slug: "alignerr", name: "Alignerr", website: "https://alignerr.com" },
  { slug: "labelbox", name: "Labelbox", website: "https://labelbox.com" },
  { slug: "appen", name: "Appen", website: "https://appen.com" },
  { slug: "scale-ai", name: "Scale AI", website: "https://scale.com" },
  { slug: "toloka", name: "Toloka", website: "https://toloka.ai" },
];

const gigCompanies = [
  { slug: "uber", name: "Uber", website: "https://uber.com" },
  { slug: "glovo", name: "Glovo", website: "https://glovoapp.com" },
  { slug: "doordash", name: "DoorDash", website: "https://doordash.com" },
  { slug: "just-eat", name: "Just Eat", website: "https://just-eat.com" },
  { slug: "gigable", name: "Gigable", website: "https://gigable.com" },
];

type CaseInput = {
  displayName: string;
  country: string;
  project: string;
  dateRange: string;
  amountOwed: string;
  currency: string;
  contactAttempts: number;
  story: string;
  email: string;
  companySlug: string;
};

const remoteCases: CaseInput[] = [
  {
    displayName: "Victor B",
    country: "Brazil",
    project: "Alignerr projects (AI training data, multiple pipelines)",
    dateRange: "Apr 9 2026 - May 18 2026",
    amountOwed: "2432.00",
    currency: "USD",
    contactAttempts: 7,
    email: "victor@example.com",
    story: "I worked as an ML engineer on several Alignerr projects spanning AI training data pipelines. Over the course of five weeks, I completed all assigned tasks, consistently meeting quality benchmarks and deadlines. Despite this, the platform stopped responding to my communications after I raised concerns about payment processing delays. My account was eventually locked with 2432 USD in completed work remaining unpaid. Multiple emails to support went unanswered, and the platform's dispute system appears designed to automatically reject appeals without human review. Other workers on the same platform report identical experiences, suggesting this is not an isolated incident but a systematic practice.",
    companySlug: "alignerr",
  },
  {
    displayName: "Ana P",
    country: "Portugal",
    project: "Alignerr AI training validation project",
    dateRange: "Mar 2026 - May 2026",
    amountOwed: "1850.00",
    currency: "EUR",
    contactAttempts: 4,
    email: "anap@example.com",
    story: "I was hired as a quality validator on Alignerr's AI training pipeline, responsible for reviewing and verifying the work of junior annotators. I worked for three months and received positive feedback from my team lead. When the project ended, I was promised payment within 15 business days. After 30 days with no payment, I started contacting support. I was told there was a 'processing delay' and to wait another two weeks. After two months of this cycle, I was finally told that my work was being audited for quality and payment would be released after the audit. Three weeks later, I received a termination email citing 'quality concerns' that were never raised during my employment. I have 1850 euros in unpaid wages and no way to appeal the decision.",
    companySlug: "alignerr",
  },
  {
    displayName: "Ahmed K",
    country: "Egypt",
    project: "Speech recognition data collection and validation",
    dateRange: "Nov 2024 - Jul 2025",
    amountOwed: "9200.00",
    currency: "USD",
    contactAttempts: 12,
    email: "ahmedk@example.com",
    story: "I worked for Appen as a speech recognition data validator for nine months, consistently ranking in the top 15 percent of performers on their quality metrics. In July 2025, I logged into my account to find it had been locked due to 'suspicious activity,' which they refused to explain despite multiple requests. At the time of the lockout, I had 9200 USD in completed but unpaid work sitting in my account. I have submitted over twelve support tickets, each time receiving a generic automated response that my case was being 'reviewed.' It has now been three months without any meaningful communication. Other workers in online forums report identical experiences with the same company. The platform appears to use account locks as a way to avoid paying workers after they have accumulated significant balances. I suspect this is a deliberate practice rather than an isolated technical issue.",
    companySlug: "appen",
  },
  {
    displayName: "Sarah L",
    country: "Philippines",
    project: "3D point cloud annotation for LiDAR training (5 projects)",
    dateRange: "Feb 2025 - Sep 2025",
    amountOwed: "15700.00",
    currency: "USD",
    contactAttempts: 6,
    email: "sarahl@example.com",
    story: "I was contracted by Scale AI through their Remo platform to perform 3D point cloud annotation for LiDAR training data. Over eight months, I completed work on five major projects, consistently maintaining a quality score above 95 percent. In September, I organized a group of fifteen workers to collectively request a rate increase from 22 dollars per hour to 30 dollars per hour, citing the technical complexity of the work and industry standards. Within 48 hours, all fifteen of us had our project access revoked with a generic message about 'project completion.' However, the same projects were immediately reopened and offered to new workers at even lower rates. This is textbook retaliation against collective bargaining. I was left with 15700 dollars in completed work that the company has refused to pay, claiming that the work was 'below quality standards' despite no prior quality complaints.",
    companySlug: "scale-ai",
  },
  {
    displayName: "Carlos M",
    country: "Venezuela",
    project: "Search relevance evaluation and data categorization",
    dateRange: "Apr 2025 - Oct 2025",
    amountOwed: "3400.00",
    currency: "USD",
    contactAttempts: 4,
    email: "carlosm@example.com",
    story: "I worked for Toloka as a search relevance evaluator, where I was tasked with rating search engine results for quality and relevance. The task instructions kept changing without notice, and the built-in quality checks were contradictory. Despite passing all onboarding tests and maintaining my quality scores, I received a sudden termination notice stating that my work failed automated quality checks. The company refused to provide specific examples of the alleged quality failures. I had completed tasks worth 3400 dollars in my account at the time of termination, none of which was paid out. My attempts to appeal through the platform's dispute system were automatically rejected within minutes, suggesting the system is designed to deny appeals without actual human review. The project guidelines explicitly state that completed tasks are paid only if the account remains active, creating a perverse incentive for the company to terminate workers near payment thresholds.",
    companySlug: "toloka",
  },
];

const gigCases: CaseInput[] = [
  {
    displayName: "Carlos R",
    country: "Spain",
    project: "Food delivery (Uber Eats) in Barcelona, 8 months",
    dateRange: "Jan 2025 - Aug 2025",
    amountOwed: "4200.00",
    currency: "EUR",
    contactAttempts: 7,
    email: "carlosr@example.com",
    story: "I worked as a delivery driver for Uber Eats in Barcelona for eight months, making deliveries six days a week. Throughout this period, the algorithm consistently assigned me longer-distance deliveries with lower base pay compared to newer drivers in my zone. When I questioned this with support, they claimed it was based on 'performance metrics' but refused to share my actual metrics. In June, a new payment structure was implemented without any prior notification, reducing per-kilometer pay by 30 percent and introducing an opaque 'demand multiplier' that was always set to the minimum. I calculated that I was effectively making 4.50 euros per hour after expenses, well below the Spanish minimum wage of 8.87 euros per hour. When I joined other drivers in a collective complaint to the platform, my account was restricted to one delivery slot per day. Uber claims drivers are independent contractors, but they control every aspect of our work.",
    companySlug: "uber",
  },
  {
    displayName: "Ana S",
    country: "Portugal",
    project: "Grocery delivery (Glovo) in Lisbon, 6 months",
    dateRange: "Mar 2025 - Aug 2025",
    amountOwed: "2800.00",
    currency: "EUR",
    contactAttempts: 5,
    email: "anas@example.com",
    story: "I was a Glovo courier in Lisbon delivering groceries and restaurant orders. The platform advertised a minimum guaranteed hourly rate of 8.50 euros, but my actual earnings after expenses rarely exceeded 6 euros per hour. The application required me to accept a certain percentage of orders to maintain my 'courier status,' but many offered orders were clearly unprofitable with distances exceeding 8 kilometers for a 3 euro base fee. When I organized with other couriers through WhatsApp group chats to coordinate rejecting unprofitable orders, Glovo sent me a warning email threatening deactivation for 'gaming the system.' Two days later, my account was deactivated without further explanation. I had 2800 euros in pending payments that had not been processed. When I visited their office in Lisbon, security refused me entry and directed me to submit a ticket online. The ticket was closed within an hour with a generic response citing 'terms of service violations.'",
    companySlug: "glovo",
  },
  {
    displayName: "Mike T",
    country: "United Kingdom",
    project: "Food delivery (DoorDash) in London, 5 months",
    dateRange: "Apr 2025 - Aug 2025",
    amountOwed: "3600.00",
    currency: "GBP",
    contactAttempts: 3,
    email: "miket@example.com",
    story: "I started delivering for DoorDash in London in April 2025 as a way to supplement my income while looking for full-time work. The onboarding process was quick, but the reality of the work was very different from what was advertised. The 'up to 18 pounds per hour' estimate assumes back-to-back deliveries with zero wait time, which never happens. My actual earnings averaged 8.50 pounds per hour before expenses. The biggest issue was the tipping system DoorDash uses. Customers are shown a default tip recommendation based on order value, but DoorDash pockets tips above a certain threshold to subsidize their base pay. I confirmed this through side-by-side comparisons with other drivers. When I posted about this on social media, my account was flagged for 'violating community guidelines,' and my delivery zone was restricted to less desirable areas. I was also forced to accept stacked orders where the second delivery subsidizes the first, effectively paying me below minimum wage for the additional time and distance.",
    companySlug: "doordash",
  },
  {
    displayName: "Elena V",
    country: "Netherlands",
    project: "Food delivery (Just Eat Takeaway) in Amsterdam, 4 months",
    dateRange: "May 2025 - Aug 2025",
    amountOwed: "1900.00",
    currency: "EUR",
    contactAttempts: 4,
    email: "elenav@example.com",
    story: "I worked for Just Eat in Amsterdam delivering orders by bicycle. The company classified me as an independent contractor, but I was required to wear their uniform, use their branded equipment, follow a fixed schedule provided by the platform, and could not reject more than 10 percent of assigned orders. This clearly meets the criteria for employment under Dutch law, but the company refuses to recognize it. Beyond the misclassification issue, I discovered the company was making deductions from my pay for 'equipment maintenance' that were not disclosed in the contract. These deductions amounted to approximately 15 percent of my earnings each week. When I requested an itemized breakdown of these charges, customer service told me it was a 'standard fee' and refused to provide further details. I also experienced unexplained gaps in my payment logs where deliveries I clearly completed were missing from my earnings history. The platform offered no effective way to dispute missing payments.",
    companySlug: "just-eat",
  },
  {
    displayName: "David O",
    country: "Nigeria",
    project: "Food and grocery delivery across multiple apps, 6 months",
    dateRange: "Feb 2025 - Jul 2025",
    amountOwed: "1500.00",
    currency: "USD",
    contactAttempts: 9,
    email: "davido@example.com",
    story: "I worked as a delivery driver for Gigable in Lagos for six months. The company promised weekly payouts, but from the second month onward, payments became increasingly delayed. By July, I was owed 1500 dollars for six weeks of work with no payment received. When I visited their office, I found a group of over forty drivers in the same situation. Gigable managers told us there was a 'cash flow problem' and asked us to continue working for 'promised future payment.' Those of us who refused were immediately removed from the platform and told we would be paid when the company could 'process our account closures.' I have sent multiple emails and made several calls without resolution. The company continues to advertise for new drivers on social media, attracting workers who do not know about the unpaid debts. This creates a cycle where new workers subsidize the wages that should have been paid to previous workers. When I shared my experience in a Facebook group for gig workers, Gigable threatened me with legal action for defamation.",
    companySlug: "gigable",
  },
];

async function seed() {
  console.log("Seeding database...");

  const insertedRemoteCompanies = await db
    .insert(companies)
    .values(remoteCompanies.map((c) => ({ ...c, vertical: "remote" as const })))
    .returning({ id: companies.id, slug: companies.slug });

  const insertedGigCompanies = await db
    .insert(companies)
    .values(gigCompanies.map((c) => ({ ...c, vertical: "gig" as const })))
    .returning({ id: companies.id, slug: companies.slug });

  const companyMap = new Map(
    [...insertedRemoteCompanies, ...insertedGigCompanies].map((c) => [c.slug, c.id])
  );

  const allCaseData = [...remoteCases, ...gigCases];

  for (const caseData of allCaseData) {
    const companyId = companyMap.get(caseData.companySlug);
    if (!companyId) {
      console.warn(`Skipping case for ${caseData.companySlug}: missing company`);
      continue;
    }

    const vertical = remoteCases.includes(caseData) ? "remote" as const : "gig" as const;

    await db.insert(cases).values({
      companyId,
      vertical,
      displayName: caseData.displayName,
      country: caseData.country,
      project: caseData.project,
      dateRange: caseData.dateRange,
      amountOwed: caseData.amountOwed,
      currency: caseData.currency,
      contactAttempts: caseData.contactAttempts,
      story: caseData.story,
      email: caseData.email,
      attested: true,
      optInSolicitor: true,
      optInCollective: true,
      optInCompanyNotify: true,
      optInCompanyContact: true,
      status: "active",
    });
  }

  console.log(`Seeded ${allCaseData.length} cases across ${companyMap.size} companies`);
}

seed()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
