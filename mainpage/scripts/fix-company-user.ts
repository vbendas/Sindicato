import { db } from "@/lib/db/client";
import { companies, platformAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function fixCompanyUser() {
  const email = process.argv[2];
  const companyName = process.argv[3];

  if (!email || !companyName) {
    console.error("Usage: npx tsx fix-company-user.ts <email> <company-name>");
    process.exit(1);
  }

  console.log(`\n=== Fixing company user: ${email} ===\n`);

  // Find Alignerr company
  console.log("1. Finding Alignerr company:");
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.name, companyName))
    .limit(1);

  if (!company) {
    console.log("   ✗ Company not found!");
    process.exit(1);
  }

  console.log("   ✓ Company found:");
  console.log("     - ID:", company.id);
  console.log("     - Name:", company.name);
  console.log("     - Slug:", company.slug);

  // Check if platform account already exists
  console.log("\n2. Checking if platform account exists:");
  const [existingAccount] = await db
    .select()
    .from(platformAccounts)
    .where(eq(platformAccounts.email, email))
    .limit(1);

  if (existingAccount) {
    console.log("   ✓ Platform account already exists:");
    console.log("     - ID:", existingAccount.id);
    console.log("     - Role:", existingAccount.role);
    console.log("     - Company ID:", existingAccount.companyId);
    console.log("\n   No action needed.");
    process.exit(0);
  }

  console.log("   ✗ Platform account does not exist");

  // Create platform account
  console.log("\n3. Creating platform account:");
  const [newAccount] = await db
    .insert(platformAccounts)
    .values({
      email: email,
      role: "company",
      displayName: "Victor Bendas (Company)",
      organization: companyName,
      approvalStatus: "approved",
      companyId: company.id,
      emailVerified: true,
      tosAcceptedAt: new Date(),
      tosVersion: "1.0",
      approvedAt: new Date(),
    })
    .returning();

  console.log("   ✓ Platform account created:");
  console.log("     - ID:", newAccount.id);
  console.log("     - Role:", newAccount.role);
  console.log("     - Approval Status:", newAccount.approvalStatus);
  console.log("     - Company ID:", newAccount.companyId);
  console.log("     - Company Name:", companyName);

  console.log("\n=== Fix complete! ===");
  console.log("\nNext steps:");
  console.log("1. Log out of the application");
  console.log("2. Log back in with your email");
  console.log("3. Navigate to /clerk");
  console.log("4. You should now see company templates and 'my company' should work\n");

  process.exit(0);
}

fixCompanyUser()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
