export function getStatuteDeadline(
  workDateEnd: Date | null,
  country?: string | null,
  caseType?: string
): { deadline: Date; label: string; urgent: boolean } | null {
  if (!workDateEnd) return null;

  const deadlines: Record<string, number> = {
    unpaid_wages: 365 * 2,
    late_payment: 365 * 2,
    sudden_deactivation: 365,
    harassment: 365 * 3,
    contract_violation: 365 * 6,
    retaliation: 365 * 3,
    data_privacy: 365 * 4,
  };

  const days = deadlines[caseType || "unpaid_wages"] || 365 * 2;

  const deadline = new Date(workDateEnd);
  deadline.setDate(deadline.getDate() + days);

  const now = new Date();
  const daysRemaining = Math.floor(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const urgent = daysRemaining < 90;

  return {
    deadline,
    label: `${daysRemaining} days remaining`,
    urgent,
  };
}
