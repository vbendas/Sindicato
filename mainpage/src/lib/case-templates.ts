export interface CaseTemplate {
  caseType: string;
  title: string;
  scaffold: string;
}

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    caseType: "unpaid_wages",
    title: "Unpaid Wages",
    scaffold: `I worked for this company from [start date] to [end date] as a [job title]. During this period, I completed all assigned tasks and met all performance expectations.

Despite fulfilling my work obligations, the company failed to pay me for [number of hours/days/weeks] of work. The total amount owed is [amount] [currency]. I attempted to resolve this by [describe your attempts — emails, messages, phone calls, etc.].

The company [describe their response — ignored your messages, gave excuses, made partial payments, etc.]. This has caused significant financial hardship as I relied on this income for [brief context — living expenses, rent, etc.].`,
  },
  {
    caseType: "late_payment",
    title: "Late Payment",
    scaffold: `I worked for this company from [start date] to [end date] as a [job title]. My agreed payment terms were [describe payment terms — net 15, upon milestone completion, etc.].

The company consistently delayed payments beyond the agreed terms. Payments were typically [number of days/weeks] late. The total amount affected is [amount] [currency].

I raised this issue on [dates] by [describe how you raised it]. The company's response was [describe their response]. This pattern of late payments [describe impact on you — caused financial stress, forced you to take on debt, etc.].`,
  },
  {
    caseType: "sudden_deactivation",
    title: "Sudden Deactivation",
    scaffold: `I had been working with this company since [start date] as a [job title/platform type]. My account was suddenly deactivated on [date] without prior warning.

Before deactivation, I [describe any context — had ongoing work, was in the middle of a project, had pending payments, etc.]. The company did not provide [notice/transition period/opportunity to address concerns].

After deactivation, [describe what happened — lost access to earnings, pending payments, work history, etc.]. The total amount affected is [amount] [currency]. I attempted to contact the company via [methods] but [describe response].`,
  },
  {
    caseType: "unfair_review",
    title: "Unfair Review",
    scaffold: `I worked for this company from [start date] to [end date] as a [job title]. After completing my work, I received a [negative review/unfair rating] that I believe was unjustified.

The review stated [briefly describe the review claims]. I believe this review was unfair because [explain why — completed work met expectations, was retaliatory, based on inaccurate information, etc.].

This unfair review has impacted my ability to [find new work/maintain my rating/stay on the platform]. The company [describe their response when you tried to dispute it].`,
  },
  {
    caseType: "predatory_practices",
    title: "Predatory Practices",
    scaffold: `I engaged with this company from [start date] as a [worker type]. The company engaged in practices that I consider exploitative or predatory.

Specifically, [describe the practices — excessive fees, misleading pay structure, hidden deductions, unrealistic quotas, deceptive onboarding promises, etc.].

For example, [provide a specific instance]. These practices resulted in [describe financial impact, broken promises, etc.]. The total amount affected is [amount] [currency]. When I raised these concerns, the company [describe their response].`,
  },
  {
    caseType: "harassment",
    title: "Harassment",
    scaffold: `I worked for this company from [start date] to [end date] as a [job title]. During this period, I experienced [harassment/bullying/discrimination] from [a manager, colleagues, the company itself].

The behavior included [describe specific incidents — verbal abuse, hostile messages, inappropriate comments, threats, discrimination based on protected characteristics, etc.].

I [describe any attempts to report or address the behavior — reported to HR, told a manager, etc.]. The company's response was [describe — ignored complaint, retaliated, took no action, etc.]. This behavior [describe impact — caused stress, created hostile work environment, etc.].`,
  },
  {
    caseType: "retaliation",
    title: "Retaliation",
    scaffold: `I worked for this company from [start date] to [end date] as a [job title]. After I [describe protected activity — raised a complaint, reported safety concerns, refused to do something illegal, etc.], the company retaliated against me.

The retaliation took the form of [describe — reduced hours, negative review, deactivation, withholding payment, threats, etc.]. This occurred on [date(s)] shortly after I [describe the trigger].

The company [describe their response if any]. This retaliation [describe impact — financial loss, lost work, emotional distress, etc.]. The total amount affected is [amount] [currency].`,
  },
  {
    caseType: "contract_violation",
    title: "Contract Violation",
    scaffold: `I entered into an agreement with this company on [date] as a [job title]. The agreement included terms about [describe key terms — pay rate, payment schedule, deliverables, etc.].

The company violated these terms by [describe how they violated the contract — changed payment terms unilaterally, refused to pay agreed rates, didn't provide agreed benefits, etc.].

Specifically, [provide a concrete example with dates and amounts]. The total financial impact is [amount] [currency]. I attempted to enforce the contract terms by [describe your actions], but the company [describe their response].`,
  },
  {
    caseType: "data_privacy",
    title: "Data Privacy Violation",
    scaffold: `I worked with this company from [start date] to [end date] as a [job title]. The company mishandled my personal data in the following ways:

[Describe the privacy violation — collected excessive personal information, shared data with third parties without consent, failed to secure personal data, didn't honor deletion requests, etc.].

I became aware of this on [date] when [describe how you discovered it]. I requested [describe what you asked for — data deletion, explanation of data use, etc.] but the company [describe their response].

This violation [describe impact — exposed personal information, risk of identity theft, etc.].`,
  },
];

export function getTemplateForCaseType(caseType: string): CaseTemplate | undefined {
  return CASE_TEMPLATES.find((t) => t.caseType === caseType);
}
