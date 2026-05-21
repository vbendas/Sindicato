import { sendTemplateEmail } from "./send";
import NewCaseNotification from "./templates/new-case-notification";
import WorkerDataAccessed from "./templates/worker-data-accessed";

export async function notifyCompanyNewCase(opts: {
  companyEmail: string;
  companyName: string;
  caseSummary: {
    workerName: string;
    country: string;
    amountOwed: string;
    currency: string;
    caseId: string;
  };
}): Promise<void> {
  if (!opts.companyEmail) return;

  try {
    await sendTemplateEmail(
      opts.companyEmail,
      `New case reported against ${opts.companyName} — Sindicato`,
      NewCaseNotification,
      {
        companyName: opts.companyName,
        workerName: opts.caseSummary.workerName,
        country: opts.caseSummary.country,
        amountOwed: opts.caseSummary.amountOwed,
        currency: opts.caseSummary.currency,
        caseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cases/${opts.caseSummary.caseId}`,
      }
    );
  } catch (err) {
    console.error("Failed to send new case notification:", err);
  }
}

export async function notifyWorkerDataAccessed(opts: {
  workerEmail: string;
  companyName: string;
  accessorRole: string;
  caseId: string;
  accessedAt: Date;
}): Promise<void> {
  try {
    await sendTemplateEmail(
      opts.workerEmail,
      `Your case data was accessed by ${opts.companyName} — Sindicato`,
      WorkerDataAccessed,
      {
        companyName: opts.companyName,
        accessorRole: opts.accessorRole,
        caseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cases/${opts.caseId}`,
        accessedAt: opts.accessedAt.toISOString(),
      }
    );
  } catch (err) {
    console.error("Failed to send worker data access notification:", err);
  }
}
