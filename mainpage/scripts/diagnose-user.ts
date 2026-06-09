import { db } from "@/lib/db/client";
import { platformAccounts, workers, companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function diagnoseUser(email: string) {
  console.log(`\n=== Diagnosing user: ${email} ===\n`);

  // Check platform_accounts
  console.log("1. Checking platform_accounts:");
  const [platformAccount] = await db
    .select()
    .from(platformAccounts)
    .where(eq(platformAccounts.email, email))
    .limit(1);

  if (platformAccount) {
    console.log("   ✓ Found in platform_accounts:");
    console.log("     - ID:", platformAccount.id);
    console.log("     - Role:", platformAccount.role);
    console.log("     - Approval Status:", platformAccount.approvalStatus);
    console.log("     - Company ID:", platformAccount.companyId);
    console.log("     - Display Name:", platformAccount.displayName);
  } else {
    console.log("   ✗ NOT found in platform_accounts");
  }

  // Check workers
  console.log("\n2. Checking workers:");
  const [worker] = await db
    .select()
    .from(workers)
    .where(eq(workers.email, email))
    .limit(1);

  if (worker) {
    console.log("   ✓ Found in workers:");
    console.log("     - ID:", worker.id);
    console.log("     - Display Name:", worker.displayName);
    console.log("     - Email Verified:", worker.emailVerified);
  } else {
    console.log("   ✗ NOT found in workers");
  }

  // Check company if platform account has company_id
  if (platformAccount?.companyId) {
    console.log("\n3. Checking company:");
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, platformAccount.companyId))
      .limit(1);

    if (company) {
      console.log("   ✓ Company found:");
      console.log("     - ID:", company.id);
      console.log("     - Name:", company.name);
      console.log("     - Slug:", company.slug);
    } else {
      console.log("   ✗ Company NOT found (invalid company_id)");
    }
  }

  console.log("\n=== Diagnosis complete ===\n");
}

// Run diagnosis
const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx diagnose-user.ts <email>");
  process.exit(1);
}
diagnoseUser(email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
