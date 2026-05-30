export interface TagDefinition {
  name: string;
  i18nKey: string;
  description: string;
  examples: string[];
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
] as const;

export type TagCategorySlug = (typeof TAG_CATEGORIES)[number];

export const TAG_TAXONOMY: Record<TagCategorySlug, TagCategory> = {
  payment_structure: {
    name: "Payment Issues",
    i18nKey: "tags.categories.payment_structure",
    tags: [
      {
        name: "Hourly payment terms not honored",
        i18nKey: "tags.hourly_payment_not_honored",
        description:
          "Company did not respect the agreed hourly payment structure — reduced rate, unpaid hours, or added conditions after work began",
        examples: [
          "changed my rate",
          "stopped paying for all hours",
          "reduced hourly rate without notice",
          "only paid for approved hours",
          "hourly rate was cut",
        ],
      },
      {
        name: "Per-task payment terms not honored",
        i18nKey: "tags.pertask_payment_not_honored",
        description:
          "Company did not respect the agreed per-task payment structure — rejected completed tasks, reduced per-task rate, or added approval requirements",
        examples: [
          "rejected completed tasks",
          "reduced per-task rate",
          "tasks marked as failed after completion",
          "stopped paying per task",
        ],
      },
      {
        name: "Completion-based payment not honored",
        i18nKey: "tags.completion_payment_not_honored",
        description:
          "Company promised payment on completion but did not pay after work was finished",
        examples: [
          "didn't pay after completion",
          "promised on completion but never paid",
          "completed the work, no payment",
          "submitted work, payment denied",
        ],
      },
      {
        name: "Approval condition imposed retroactively",
        i18nKey: "tags.approval_condition_retroactive",
        description:
          "Company added an approval or acceptance requirement that was not part of the original payment terms",
        examples: [
          "now says needs approval",
          "changed to approval-based payment",
          "added acceptance criteria after work",
          "payment now depends on review",
        ],
      },
      {
        name: "Retroactive term change",
        i18nKey: "tags.retroactive_term_change",
        description:
          "Payment or work terms changed after work began or was completed",
        examples: [
          "suddenly changed to",
          "now it's",
          "updated to",
          "switched from X to Y",
          "retroactive",
          "changed the terms",
        ],
      },
      {
        name: "Payment cap / limit",
        i18nKey: "tags.payment_cap_limit",
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
    ],
  },
  worker_action: {
    name: "Worker Action / Remedy",
    i18nKey: "tags.categories.worker_action",
    tags: [
      {
        name: "DLSE filing indicated",
        i18nKey: "tags.dlse_filing_indicated",
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
        description:
          "Worker mentions contacting or retaining a lawyer",
        examples: [
          "talked to a lawyer",
          "seeking counsel",
          "attorney reviewing",
          "legal advice",
          "hired a lawyer",
        ],
      },
      {
        name: "Collective action interest",
        i18nKey: "tags.collective_action_interest",
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
        description:
          "Worker posted about case publicly on social media or review sites",
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
