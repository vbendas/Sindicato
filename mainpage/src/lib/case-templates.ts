export interface CaseTemplate {
  caseType: string;
  title: string;
  scaffold: string;
}

export interface CaseQuestion {
  id: string;
  question: string;
  placeholder: string;
  required?: boolean;
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

const QUESTIONS_BY_TYPE: Record<string, CaseQuestion[]> = {
  unpaid_wages: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Delivery driver, Software developer, Virtual assistant", required: true },
    { id: "period", question: "When did you work? (approximate dates)", placeholder: "e.g. January 2024 – March 2024", required: true },
    { id: "rate", question: "What was your agreed rate of pay?", placeholder: "e.g. €15/hour, €2000/month" },
    { id: "hours_unpaid", question: "How much work went unpaid?", placeholder: "e.g. 40 hours, 3 weeks, entire last month", required: true },
    { id: "contact_attempts", question: "How did you try to resolve this with the company?", placeholder: "e.g. Sent emails on March 5 and 12, called support twice, messaged on WhatsApp" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Ignored my messages, promised to pay but never did, said they'd look into it" },
    { id: "evidence", question: "What evidence do you have? (contracts, messages, screenshots)", placeholder: "e.g. Employment contract, WhatsApp screenshots, invoices, bank statements" },
    { id: "impact", question: "How has this affected you personally?", placeholder: "e.g. Can't pay rent, had to borrow money, had to find a new job" },
  ],
  late_payment: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Freelance designer, Content writer", required: true },
    { id: "period", question: "When did you work? (approximate dates)", placeholder: "e.g. January 2024 – present", required: true },
    { id: "payment_terms", question: "What were your agreed payment terms?", placeholder: "e.g. Net 15, paid weekly, upon milestone completion" },
    { id: "late_pattern", question: "How late were payments typically?", placeholder: "e.g. 2-3 weeks late, sometimes months late" },
    { id: "amount_affected", question: "What is the total amount affected?", placeholder: "e.g. €3,000 in late payments", required: true },
    { id: "contact_attempts", question: "How did you raise this issue?", placeholder: "e.g. Emailed HR, spoke to manager, filed a complaint" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Apologized but continued the pattern, blamed accounting delays" },
    { id: "impact", question: "How has this affected you?", placeholder: "e.g. Couldn't pay bills on time, incurred late fees" },
  ],
  sudden_deactivation: [
    { id: "role", question: "What type of work did you do?", placeholder: "e.g. Uber driver, Amazon delivery, freelance writer on Upwork", required: true },
    { id: "platform_duration", question: "How long were you on the platform?", placeholder: "e.g. 2 years, since March 2022" },
    { id: "deactivation_date", question: "When were you deactivated?", placeholder: "e.g. January 15, 2024", required: true },
    { id: "pending_earnings", question: "Did you have pending earnings at the time?", placeholder: "e.g. €500 pending payout, 3 jobs in progress" },
    { id: "reason_given", question: "What reason (if any) did the company give?", placeholder: "e.g. No reason given, 'violated terms of service', 'quality concerns'" },
    { id: "contact_attempts", question: "How did you try to get your account back?", placeholder: "e.g. Emailed support 5 times, appealed through the app, called helpline" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Generic automated replies, no response, said decision was final" },
    { id: "impact", question: "How has this affected you?", placeholder: "e.g. Lost my main income source, had to find new work quickly" },
  ],
  harassment: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Customer service agent, Warehouse worker", required: true },
    { id: "period", question: "When did this happen?", placeholder: "e.g. March 2024 – June 2024", required: true },
    { id: "who", question: "Who harassed you?", placeholder: "e.g. My direct manager, a colleague, a client" },
    { id: "what_happened", question: "What happened? (specific incidents)", placeholder: "e.g. Received threatening messages, was called derogatory names, was pressured to work unpaid hours", required: true },
    { id: "reported_to", question: "Did you report it? To whom?", placeholder: "e.g. Reported to HR on April 10, told my team lead" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. HR said they'd investigate but nothing happened, I was told to 'toughen up'" },
    { id: "evidence", question: "Do you have any evidence? (screenshots, witnesses)", placeholder: "e.g. Screenshots of messages, coworker witnessed the incident" },
    { id: "impact", question: "How has this affected you?", placeholder: "e.g. Had to leave the job, caused significant stress and anxiety" },
  ],
  retaliation: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Sales representative, Gig worker", required: true },
    { id: "period", question: "When did this happen?", placeholder: "e.g. February 2024 – April 2024", required: true },
    { id: "trigger", question: "What did you do that triggered the retaliation?", placeholder: "e.g. Reported safety concerns, refused to work unpaid overtime, filed a complaint" },
    { id: "retaliation_actions", question: "How did the company retaliate?", placeholder: "e.g. Reduced my hours by 50%, gave me a negative review, deactivated my account", required: true },
    { id: "timeline", question: "How soon after your action did the retaliation start?", placeholder: "e.g. Within a week, the next day" },
    { id: "company_response", question: "What was the company's response when you raised this?", placeholder: "e.g. Denied any connection, said it was performance-related" },
    { id: "evidence", question: "What evidence links the retaliation to your action?", placeholder: "e.g. Good reviews before, negative reviews immediately after complaint" },
    { id: "impact", question: "How has this affected you?", placeholder: "e.g. Lost income, had to find new work" },
  ],
  contract_violation: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Consultant, Freelance developer", required: true },
    { id: "agreement_date", question: "When was the agreement made?", placeholder: "e.g. January 2024", required: true },
    { id: "key_terms", question: "What were the key terms of the agreement?", placeholder: "e.g. €50/hour, paid weekly, remote work only", required: true },
    { id: "violation", question: "How did the company violate the agreement?", placeholder: "e.g. Changed pay rate to €30/hour without notice, stopped paying weekly, demanded on-site work" },
    { id: "specific_example", question: "Give a specific example with dates and amounts", placeholder: "e.g. On March 1, they paid €500 instead of the agreed €1,200 for the week of Feb 20-27" },
    { id: "contact_attempts", question: "How did you try to enforce the agreement?", placeholder: "e.g. Sent formal email, referenced the contract, escalated to management" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Said they had the right to change terms, ignored my emails" },
  ],
  unfair_review: [
    { id: "role", question: "What was your job title or role?", placeholder: "e.g. Freelance designer, Uber driver", required: true },
    { id: "review_date", question: "When did you receive the review?", placeholder: "e.g. March 2024" },
    { id: "review_content", question: "What did the review say?", placeholder: "e.g. 'Worker was unprofessional and delivered poor quality'" },
    { id: "why_unfair", question: "Why do you believe the review is unfair?", placeholder: "e.g. Client approved all deliverables, review came after I asked for payment" },
    { id: "impact_on_work", question: "How has this affected your ability to work?", placeholder: "e.g. Rating dropped from 4.9 to 4.2, getting fewer jobs" },
    { id: "dispute_attempt", question: "Did you try to dispute the review?", placeholder: "e.g. Filed an appeal through the platform, emailed support" },
    { id: "company_response", question: "What was the platform/company's response?", placeholder: "e.g. Said reviews are final, no response" },
  ],
  predatory_practices: [
    { id: "role", question: "What type of work did you do?", placeholder: "e.g. Delivery driver, Content moderator", required: true },
    { id: "period", question: "When did this happen?", placeholder: "e.g. Since January 2024" },
    { id: "practices", question: "What predatory practices did you experience?", placeholder: "e.g. Hidden fees deducted from earnings, deceptive pay structure, impossible quotas" },
    { id: "specific_example", question: "Give a specific example", placeholder: "e.g. Was promised €20/hour but after deductions received only €8/hour" },
    { id: "promises_vs_reality", question: "What were you promised vs what you actually received?", placeholder: "e.g. Promised flexible hours but penalized for not working 60+ hours/week" },
    { id: "amount_affected", question: "How much money have you lost?", placeholder: "e.g. €2,000 in hidden fees over 3 months" },
    { id: "contact_attempts", question: "Did you raise this with the company?", placeholder: "e.g. Asked manager about deductions, filed a complaint" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Said it was in the fine print, threatened to deactivate my account" },
  ],
  data_privacy: [
    { id: "role", question: "What type of work did you do?", placeholder: "e.g. Freelance contractor, Platform worker", required: true },
    { id: "period", question: "When did this happen?", placeholder: "e.g. March 2024" },
    { id: "violation_type", question: "How did the company mishandle your data?", placeholder: "e.g. Shared my personal info with third parties, collected excessive data, didn't delete my data on request" },
    { id: "discovery", question: "How did you discover this?", placeholder: "e.g. Received spam from unknown companies, found my data on a public page" },
    { id: "request_made", question: "What did you request from the company?", placeholder: "e.g. Asked them to delete my data, asked for an explanation" },
    { id: "company_response", question: "What was the company's response?", placeholder: "e.g. No response, said they couldn't delete my data, ignored my request" },
    { id: "impact", question: "How has this affected you?", placeholder: "e.g. Receiving spam, concerned about identity theft" },
  ],
};

const FALLBACK_QUESTIONS: CaseQuestion[] = [
  { id: "role", question: "What was your job title or role?", placeholder: "e.g. Freelance designer, Delivery driver" },
  { id: "period", question: "When did this happen?", placeholder: "e.g. March 2024 – June 2024", required: true },
  { id: "what_happened", question: "What happened?", placeholder: "Describe the situation in your own words", required: true },
  { id: "contact_attempts", question: "How did you try to resolve this?", placeholder: "e.g. Emailed support, called manager" },
  { id: "company_response", question: "What was the company's response?", placeholder: "e.g. Ignored my messages" },
  { id: "evidence", question: "What evidence do you have?", placeholder: "e.g. Screenshots, contracts, messages" },
  { id: "impact", question: "How has this affected you?", placeholder: "e.g. Financial hardship, lost work" },
];

export function getQuestionsForCaseType(caseType: string): CaseQuestion[] {
  return QUESTIONS_BY_TYPE[caseType] || FALLBACK_QUESTIONS;
}

export function buildStoryFromAnswers(answers: Record<string, string>, caseType: string): string {
  const parts: string[] = [];

  const role = answers.role?.trim();
  const period = answers.period?.trim();

  if (role && period) {
    parts.push(`I worked as a ${role} ${period.includes("since") || period.includes("from") ? period : `during ${period}`}.`);
  } else if (role) {
    parts.push(`My role was ${role}.`);
  }

  if (answers.rate?.trim()) {
    parts.push(`My agreed rate of pay was ${answers.rate.trim()}.`);
  }

  if (answers.payment_terms?.trim()) {
    parts.push(`The agreed payment terms were ${answers.payment_terms.trim()}.`);
  }

  if (answers.agreement_date?.trim() && answers.key_terms?.trim()) {
    parts.push(`An agreement was made on ${answers.agreement_date.trim()} with the following key terms: ${answers.key_terms.trim()}.`);
  }

  const incident = answers.what_happened?.trim() || answers.violation?.trim() || answers.violation_type?.trim() || answers.practices?.trim() || answers.review_content?.trim();
  if (incident) {
    parts.push(incident);
  }

  if (answers.specific_example?.trim()) {
    parts.push(`Specifically: ${answers.specific_example.trim()}`);
  }

  if (answers.why_unfair?.trim()) {
    parts.push(`I believe this was unfair because ${answers.why_unfair.trim()}.`);
  }

  if (answers.promises_vs_reality?.trim()) {
    parts.push(`I was promised ${answers.promises_vs_reality.trim()}.`);
  }

  if (answers.late_pattern?.trim()) {
    parts.push(`Payments were typically ${answers.late_pattern.trim()}.`);
  }

  if (answers.pending_earnings?.trim()) {
    parts.push(`At the time of deactivation, I had ${answers.pending_earnings.trim()} in pending earnings.`);
  }

  if (answers.reason_given?.trim()) {
    parts.push(`The reason given was: ${answers.reason_given.trim()}`);
  }

  if (answers.who?.trim() && caseType === "harassment") {
    parts.push(`The harassment came from ${answers.who.trim()}.`);
  }

  if (answers.trigger?.trim() && caseType === "retaliation") {
    parts.push(`This happened after I ${answers.trigger.trim()}.`);
  }

  if (answers.retaliation_actions?.trim()) {
    parts.push(`The retaliation took the form of: ${answers.retaliation_actions.trim()}`);
  }

  if (answers.timeline?.trim() && caseType === "retaliation") {
    parts.push(`The retaliation started ${answers.timeline.trim()}.`);
  }

  if (answers.discovery?.trim()) {
    parts.push(`I became aware of this when ${answers.discovery.trim()}.`);
  }

  if (answers.request_made?.trim()) {
    parts.push(`I requested: ${answers.request_made.trim()}`);
  }

  if (answers.hours_unpaid?.trim()) {
    parts.push(`The amount of work that went unpaid: ${answers.hours_unpaid.trim()}.`);
  }

  if (answers.amount_affected?.trim()) {
    parts.push(`The total amount affected is ${answers.amount_affected.trim()}.`);
  }

  if (answers.platform_duration?.trim()) {
    parts.push(`I had been on the platform for ${answers.platform_duration.trim()}.`);
  }

  if (answers.deactivation_date?.trim()) {
    parts.push(`My account was deactivated on ${answers.deactivation_date.trim()}.`);
  }

  if (answers.impact_on_work?.trim()) {
    parts.push(`Impact on my work: ${answers.impact_on_work.trim()}`);
  }

  if (answers.dispute_attempt?.trim()) {
    parts.push(`I tried to dispute this: ${answers.dispute_attempt.trim()}`);
  }

  if (answers.reported_to?.trim()) {
    parts.push(`I reported this to ${answers.reported_to.trim()}.`);
  }

  if (answers.contact_attempts?.trim()) {
    parts.push(`To resolve this, I ${answers.contact_attempts.trim()}.`);
  }

  if (answers.company_response?.trim()) {
    parts.push(`The company's response was: ${answers.company_response.trim()}`);
  }

  if (answers.evidence?.trim()) {
    parts.push(`Evidence I have: ${answers.evidence.trim()}.`);
  }

  if (answers.impact?.trim()) {
    parts.push(`This has affected me by: ${answers.impact.trim()}`);
  }

  return parts.join("\n\n");
}
