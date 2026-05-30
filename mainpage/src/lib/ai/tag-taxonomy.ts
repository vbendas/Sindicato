export type TagSeverity = "green" | "yellow" | "orange" | "red";

export interface TagDefinition {
  name: string;
  i18nKey: string;
  description: string;
  examples: string[];
  severity: TagSeverity;
}

export interface TagCategory {
  name: string;
  i18nKey: string;
  tags: TagDefinition[];
}

export const TAG_CATEGORIES = [
  "payment_structure",
  "quality_review",
  "communication",
  "project_lifecycle",
  "worker_action",
  "company_positive",
] as const;

export type TagCategorySlug = (typeof TAG_CATEGORIES)[number];

export const TAG_TAXONOMY: Record<TagCategorySlug, TagCategory> = {
  payment_structure: {
    name: "Payment Issues",
    i18nKey: "tags.categories.payment_structure",
    tags: [
      {
        name: "Retroactive term change",
        i18nKey: "tags.retroactive_term_change",
        severity: "orange",
        description:
          "Payment or work terms CHANGED after work began — requires evidence of a before/after shift. Does NOT apply to pay structures that were always exploitative.",
        examples: [
          "suddenly changed to",
          "now it's",
          "updated to",
          "switched from X to Y",
          "retroactive",
          "changed the terms",
          "changed my rate",
          "reduced hourly rate without notice",
          "reduced per-task rate",
          "now says needs approval",
          "used to be",
          "they changed the policy",
        ],
      },
      {
        name: "Deceptive pay practices",
        i18nKey: "tags.deceptive_pay_practices",
        severity: "red",
        description:
          "Pay structure is misleading or exploitative by design — not a change from previous terms, but the original structure itself is deceptive or hidden",
        examples: [
          "pockets tips",
          "tip subsidizes base pay",
          "advertised rate is misleading",
          "real earnings much lower",
          "hidden deductions",
          "up to £18/hr but actually",
          "up to $22/hr but actually",
          "never actually get that rate",
          "base pay is subsidized by",
        ],
      },
      {
        name: "Payment cap / limit",
        i18nKey: "tags.payment_cap_limit",
        severity: "orange",
        description:
          "Maximum hours, tasks, or earnings imposed without prior notice",
        examples: [
          "max payable",
          "capped at",
          "limit of",
          "only 5 hours paid",
          "maximum hours",
        ],
      },
    ],
  },
  quality_review: {
    name: "Quality / Review",
    i18nKey: "tags.categories.quality_review",
    tags: [
      {
        name: "No feedback provided",
        i18nKey: "tags.no_feedback_provided",
        severity: "yellow",
        description:
          "Rejection or non-payment without explanation or feedback",
        examples: [
          "no feedback",
          "no reason given",
          "without explanation",
          "just rejected",
          "never told me why",
        ],
      },
      {
        name: "Undefined quality standard",
        i18nKey: "tags.undefined_quality_standard",
        severity: "yellow",
        description:
          "Vague or missing criteria for work acceptance",
        examples: [
          "no criteria",
          "unclear what good means",
          "never told us the standard",
          "no guidelines",
          "didn't explain what they wanted",
        ],
      },
      {
        name: "Post-hoc quality claim",
        i18nKey: "tags.post_hoc_quality_claim",
        severity: "orange",
        description:
          "Quality issues raised only after payment dispute or complaint",
        examples: [
          "suddenly said low quality",
          "after I asked for pay, they said substandard",
          "only mentioned quality when I asked for payment",
          "retroactively failed",
        ],
      },
      {
        name: "Tasks removed / deleted",
        i18nKey: "tags.tasks_removed_deleted",
        severity: "orange",
        description:
          "Completed work disappearing from platform or dashboard",
        examples: [
          "removed from dashboard",
          "tasks vanished",
          "project deleted",
          "can't see my work anymore",
          "disappeared",
        ],
      },
    ],
  },
  communication: {
    name: "Communication / Engagement",
    i18nKey: "tags.categories.communication",
    tags: [
      {
        name: "Ignored messages",
        i18nKey: "tags.ignored_messages",
        severity: "yellow",
        description:
          "No response to worker inquiries or messages",
        examples: [
          "ignored",
          "no reply",
          "ghosted",
          "messages unanswered",
          "days without response",
          "stopped responding",
        ],
      },
      {
        name: "Channel lockout",
        i18nKey: "tags.channel_lockout",
        severity: "orange",
        description:
          "Worker removed from Discord, Slack, or project communication channels",
        examples: [
          "kicked from Discord",
          "removed from channel",
          "banned",
          "lost access",
          "removed from Slack",
        ],
      },
      {
        name: "Support deflection",
        i18nKey: "tags.support_deflection",
        severity: "yellow",
        description:
          "Generic or unhelpful support responses that avoid addressing the issue",
        examples: [
          "billing team said",
          "check with my team",
          "standard response",
          "copy-paste answer",
          "canned response",
        ],
      },
      {
        name: "Alias management",
        i18nKey: "tags.alias_management",
        severity: "yellow",
        description:
          "Leaders using pseudonyms, no real names or identifiable contacts",
        examples: [
          "Wesley PL",
          "Amicable-Lead",
          "no real name",
          "only aliases",
          "can't identify who decided",
          "only first name",
        ],
      },
    ],
  },
  project_lifecycle: {
    name: "Project Lifecycle",
    i18nKey: "tags.categories.project_lifecycle",
    tags: [
      {
        name: "Project paused / ended abruptly",
        i18nKey: "tags.project_paused_ended",
        severity: "yellow",
        description:
          "Sudden halt to work availability without notice",
        examples: [
          "project paused",
          "suddenly stopped",
          "no more tasks",
          "project ended without notice",
          "out of nowhere",
        ],
      },
      {
        name: "Project deleted from dashboard",
        i18nKey: "tags.project_deleted_dashboard",
        severity: "orange",
        description:
          "Project no longer visible to worker on the platform",
        examples: [
          "removed from my projects",
          "can't find it anymore",
          "disappeared from platform",
          "no longer on dashboard",
        ],
      },
      {
        name: "Task allocation dropped",
        i18nKey: "tags.task_allocation_dropped",
        severity: "yellow",
        description:
          "Hours or tasks reduced without explanation",
        examples: [
          "tasks dried up",
          "from 40 hours to 10",
          "allocation cut",
          "no more assignments",
          "hours reduced",
        ],
      },
      {
        name: "Constructive termination",
        i18nKey: "tags.constructive_termination",
        severity: "red",
        description:
          "Conditions made impossible to continue working",
        examples: [
          "forced to quit",
          "made it impossible",
          "left with no choice",
          "pushed out",
          "preventing me from taking other contracts",
        ],
      },
      {
        name: "Retaliation",
        i18nKey: "tags.retaliation",
        severity: "red",
        description:
          "Company took adverse action against worker after complaint, filing, or protected activity",
        examples: [
          "fired after complaining",
          "removed from project after asking for pay",
          "hours cut after filing",
          "blacklisted after leaving review",
          "punished for speaking up",
          "retaliated",
        ],
      },
    ],
  },
  worker_action: {
    name: "Worker Action / Remedy",
    i18nKey: "tags.categories.worker_action",
    tags: [
      {
        name: "DLSE filing indicated",
        i18nKey: "tags.dlse_filing_indicated",
        severity: "red",
        description:
          "Worker mentions filing with Labor Commissioner or equivalent agency",
        examples: [
          "filed with DLSE",
          "Labor Commissioner",
          "wage claim filed",
          "state complaint",
          "filed a complaint",
        ],
      },
      {
        name: "Legal counsel sought",
        i18nKey: "tags.legal_counsel_sought",
        severity: "red",
        description:
          "Worker is in contact with or has retained a lawyer, or a lawyer has reached out through the platform",
        examples: [
          "talked to a lawyer",
          "seeking counsel",
          "attorney reviewing",
          "legal advice",
          "hired a lawyer",
        ],
      },
      {
        name: "Open to legal representation",
        i18nKey: "tags.open_to_legal",
        severity: "yellow",
        description:
          "Worker indicated willingness to be contacted by labor lawyers",
        examples: [],
      },
      {
        name: "Collective action interest",
        i18nKey: "tags.collective_action_interest",
        severity: "red",
        description:
          "Worker expresses interest in group legal action",
        examples: [
          "class action",
          "joining others",
          "collective claim",
          "group lawsuit",
          "PAGA",
          "together with other workers",
        ],
      },
      {
        name: "Public documentation",
        i18nKey: "tags.public_documentation",
        severity: "yellow",
        description:
          "Worker posted about case publicly on social media or review sites, or has documented the case in the timeline",
        examples: [
          "posted on Reddit",
          "shared on Twitter",
          "Trustpilot review",
          "Glassdoor",
          "made it public",
        ],
      },
    ],
  },
  company_positive: {
    name: "Company Positive Actions",
    i18nKey: "tags.categories.company_positive",
    tags: [
      {
        name: "Company reached out proactively",
        i18nKey: "tags.company_proactive_outreach",
        severity: "green",
        description:
          "Company initiated contact with the worker to address the issue",
        examples: [
          "company reached out",
          "they contacted me",
          "got a message from them",
          "they initiated",
        ],
      },
      {
        name: "Company provided relevant response",
        i18nKey: "tags.company_relevant_response",
        severity: "green",
        description:
          "Company replied with a substantive, non-canned response addressing the issue",
        examples: [
          "they explained what happened",
          "gave a real answer",
          "addressed my concerns",
          "detailed explanation",
        ],
      },
      {
        name: "Company resolved the issue",
        i18nKey: "tags.company_resolved",
        severity: "green",
        description:
          "Company resolved the dispute — payment made, issue fixed, or case closed positively",
        examples: [
          "they paid me",
          "issue resolved",
          "got my money",
          "case closed",
          "received payment",
        ],
      },
      {
        name: "Company responded quickly",
        i18nKey: "tags.company_quick_response",
        severity: "green",
        description:
          "Company responded to worker communications in a timely manner",
        examples: [
          "quick reply",
          "responded same day",
          "fast response",
          "within hours",
        ],
      },
    ],
  },
};

export function getAllTags(): TagDefinition[] {
  return TAG_CATEGORIES.flatMap(
    (cat) => TAG_TAXONOMY[cat].tags
  );
}

export function getTagByI18nKey(
  i18nKey: string
): TagDefinition | undefined {
  return getAllTags().find((t) => t.i18nKey === i18nKey);
}

export function getTagByName(
  name: string
): TagDefinition | undefined {
  return getAllTags().find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}

export function getTagSeverity(
  tagName: string
): TagSeverity {
  const tag = getTagByName(tagName);
  return tag?.severity ?? "yellow";
}

export function getCategoryForTag(
  tagName: string
): TagCategorySlug | undefined {
  for (const cat of TAG_CATEGORIES) {
    if (
      TAG_TAXONOMY[cat].tags.some(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      )
    ) {
      return cat;
    }
  }
  return undefined;
}
