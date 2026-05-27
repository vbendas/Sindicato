export interface SuggestionGroup {
  name: string;
  suggestions: SuggestionItem[];
}

export interface SuggestionItem {
  id: string;
  label: string;
  template: string;
  templatePromptId?: string;
}

export interface Variables {
  companies: { label: string; value: string }[];
  countries: { label: string; value: string }[];
  verticals: { label: string; value: string }[];
  case_types: { label: string; value: string }[];
  age_ranges: { label: string; value: string }[];
  sexes: { label: string; value: string }[];
  age_from: { label: string; value: string }[];
  age_to: { label: string; value: string }[];
  date_from: { label: string; value: string }[];
  date_to: { label: string; value: string }[];
}

const STATIC_SUGGESTIONS: SuggestionItem[] = [
  { id: "all-unresolved", label: "Show all unresolved cases", template: "Show all unresolved cases" },
  { id: "common-violations", label: "Most common violations reported", template: "What are the most common types of violations reported?" },
  { id: "total-unpaid", label: "Total unpaid wages across all cases", template: "What is the total amount of unpaid wages reported across all cases?" },
  { id: "repeat-offenders", label: "Companies with the most cases", template: "Which companies have the most cases filed against them?" },
  { id: "cases-by-vertical", label: "Remote vs gig worker cases", template: "Compare the number of cases between remote and gig workers" },
  { id: "top-countries", label: "Countries with most cases", template: "Which countries have the most reported cases?" },
  { id: "recent-cases-30-days", label: "Cases from last 30 days", template: "Show me cases filed in the last 30 days" },
  { id: "recent-cases-this-month", label: "Cases from this month", template: "Show me cases filed this month" },
  { id: "cases-by-date-range", label: "Cases in date range", template: "Show me cases filed between {date_from} and {date_to}", templatePromptId: "cases-by-date-range" },
];

const LAWYER_SUGGESTIONS: SuggestionItem[] = [
  { id: "lawyer-solicitor-optin", label: "Cases with solicitor opt-in by company", template: "List all cases with solicitor opt-in for {company}", templatePromptId: "lawyer-solicitor-optin" },
  { id: "lawyer-solicitor-grouped", label: "Solicitor opt-in cases by type", template: "Cases with solicitor opt-in grouped by case type" },
  { id: "lawyer-unresolved-contacts", label: "Unresolved cases with aliased contacts", template: "Show case numbers and aliased contacts for {company} unresolved cases", templatePromptId: "lawyer-unresolved-contacts" },
  { id: "lawyer-collective-action", label: "Collective action candidates", template: "Collective action candidates: cases against {company} with same case type", templatePromptId: "lawyer-collective-action" },
  { id: "lawyer-high-value", label: "Highest value unresolved cases", template: "What are the highest value unresolved cases with solicitor opt-in?" },
  { id: "lawyer-recent", label: "Recent cases filed", template: "Show recent cases filed this month with solicitor opt-in" },
  { id: "lawyer-recent-30-days", label: "Cases from last 30 days", template: "Show cases with solicitor opt-in from the last 30 days" },
  { id: "lawyer-date-range", label: "Cases in date range", template: "Show cases with solicitor opt-in between {date_from} and {date_to}", templatePromptId: "lawyer-date-range" },
  { id: "lawyer-contact-unresolved", label: "Contact info for unresolved cases", template: "Show contact information for unresolved cases against {company}", templatePromptId: "lawyer-contact-unresolved" },
];

const COMPANY_SUGGESTIONS: SuggestionItem[] = [
  { id: "company-my-cases", label: "Cases filed against my company", template: "List all cases filed against {company}", templatePromptId: "company-my-cases" },
  { id: "company-unresolved-contacts", label: "Unresolved cases with contacts", template: "Show unresolved cases with contact aliases for {company}", templatePromptId: "company-unresolved-contacts" },
  { id: "company-grouped-type", label: "Cases grouped by type", template: "Cases grouped by type for {company}", templatePromptId: "company-grouped-type" },
  { id: "company-total-claimed", label: "Total amount claimed", template: "Total amount claimed against {company}", templatePromptId: "company-total-claimed" },
  { id: "company-resolution-status", label: "Resolution status", template: "How many cases against {company} have been resolved?", templatePromptId: "company-resolution-status" },
  { id: "company-timeline", label: "Recent case activity", template: "Show recent cases filed against {company} this month", templatePromptId: "company-timeline" },
  { id: "company-recent-30-days", label: "Recent cases (last 30 days)", template: "Show cases filed against {company} in the last 30 days", templatePromptId: "company-recent-30-days" },
  { id: "company-date-range", label: "Cases in date range", template: "Show cases filed against {company} between {date_from} and {date_to}", templatePromptId: "company-date-range" },
  { id: "company-contact-unresolved", label: "Contact info for unresolved cases", template: "Show contact information for unresolved cases against {company}", templatePromptId: "company-contact-unresolved" },
];

const MEDIA_SUGGESTIONS: SuggestionItem[] = [
  { id: "media-all-contacts", label: "Cases with aliased contacts", template: "All cases with contact aliases for {company}", templatePromptId: "media-all-contacts" },
  { id: "media-by-country-type", label: "Cases by country and type", template: "Cases by country and case type" },
  { id: "media-high-value", label: "Highest value unresolved cases", template: "What are the highest value unresolved cases?" },
  { id: "media-recent-filed", label: "Recent cases this month", template: "Recent cases filed this month" },
  { id: "media-company-trends", label: "Company case trends", template: "Which companies have the most cases this month?" },
  { id: "media-demographics", label: "Demographic breakdown", template: "Demographic breakdown of workers filing cases" },
  { id: "media-recent-30-days", label: "Recent cases (last 30 days)", template: "Show cases filed in the last 30 days" },
  { id: "media-date-range", label: "Cases in date range", template: "Show cases filed between {date_from} and {date_to}", templatePromptId: "media-date-range" },
  { id: "media-contact-all", label: "Contact info for cases", template: "Show contact information for cases against {company}", templatePromptId: "media-contact-all" },
];

const TEMPLATE_MAP: Record<string, { template: string; variables: { name: string; label: string; dataSource: keyof Variables }[] }> = {
  "cases-by-company": {
    template: "How many cases have been filed against {company}?",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "total-unpaid-company": {
    template: "What is the total amount of unpaid wages reported against {company}?",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "cases-by-country": {
    template: "What are the most common types of cases reported in {country}?",
    variables: [{ name: "country", label: "Country", dataSource: "countries" }],
  },
  "total-unpaid-by-vertical": {
    template: "What is the total amount of unpaid wages for {vertical} workers?",
    variables: [{ name: "vertical", label: "Vertical", dataSource: "verticals" }],
  },
  "resolution-status": {
    template: "How many cases against {company} have been resolved?",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "cases-by-company-country": {
    template: "How many cases against {company} are from {country}?",
    variables: [
      { name: "company", label: "Company", dataSource: "companies" },
      { name: "country", label: "Country", dataSource: "countries" },
    ],
  },
  "cases-by-demographic": {
    template: "How many {sex} workers between {age_from} and {age_to} have reported cases?",
    variables: [
      { name: "sex", label: "Sex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", dataSource: "age_from" },
      { name: "age_to", label: "Age to", dataSource: "age_to" },
    ],
  },
  "cases-by-company-demographic": {
    template: "What is the total number of {sex} workers between {age_from} and {age_to} reporting cases against {company} in {country}?",
    variables: [
      { name: "sex", label: "Sex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", dataSource: "age_from" },
      { name: "age_to", label: "Age to", dataSource: "age_to" },
      { name: "company", label: "Company", dataSource: "companies" },
      { name: "country", label: "Country", dataSource: "countries" },
    ],
  },
  "lawyer-solicitor-optin": {
    template: "List all cases with solicitor opt-in for {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "lawyer-unresolved-contacts": {
    template: "Show case numbers and aliased contacts for {company} unresolved cases",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "lawyer-collective-action": {
    template: "Collective action candidates: cases against {company} with same case type",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-my-cases": {
    template: "List all cases filed against {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-unresolved-contacts": {
    template: "Show unresolved cases with contact aliases for {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-grouped-type": {
    template: "Cases grouped by type for {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-total-claimed": {
    template: "Total amount claimed against {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-resolution-status": {
    template: "How many cases against {company} have been resolved?",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-timeline": {
    template: "Show recent cases filed against {company} this month",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "media-all-contacts": {
    template: "All cases with contact aliases for {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "cases-by-date-range": {
    template: "Show me cases filed between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", dataSource: "date_from" },
      { name: "date_to", label: "To date", dataSource: "date_to" },
    ],
  },
  "lawyer-date-range": {
    template: "Show cases with solicitor opt-in between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", dataSource: "date_from" },
      { name: "date_to", label: "To date", dataSource: "date_to" },
    ],
  },
  "company-recent-30-days": {
    template: "Show cases filed against {company} in the last 30 days",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-date-range": {
    template: "Show cases filed against {company} between {date_from} and {date_to}",
    variables: [
      { name: "company", label: "Company", dataSource: "companies" },
      { name: "date_from", label: "From date", dataSource: "date_from" },
      { name: "date_to", label: "To date", dataSource: "date_to" },
    ],
  },
  "media-date-range": {
    template: "Show cases filed between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", dataSource: "date_from" },
      { name: "date_to", label: "To date", dataSource: "date_to" },
    ],
  },
  "lawyer-contact-unresolved": {
    template: "Show contact information for unresolved cases against {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "company-contact-unresolved": {
    template: "Show contact information for unresolved cases against {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  "media-contact-all": {
    template: "Show contact information for cases against {company}",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
};

const TEMPLATE_SUGGESTIONS: SuggestionItem[] = [
  { id: "cases-by-company", label: "Cases against a specific company", template: TEMPLATE_MAP["cases-by-company"].template, templatePromptId: "cases-by-company" },
  { id: "total-unpaid-company", label: "Unpaid wages for a company", template: TEMPLATE_MAP["total-unpaid-company"].template, templatePromptId: "total-unpaid-company" },
  { id: "cases-by-country", label: "Case types by country", template: TEMPLATE_MAP["cases-by-country"].template, templatePromptId: "cases-by-country" },
  { id: "total-unpaid-by-vertical", label: "Unpaid wages by worker type", template: TEMPLATE_MAP["total-unpaid-by-vertical"].template, templatePromptId: "total-unpaid-by-vertical" },
  { id: "resolution-status", label: "Resolution status for a company", template: TEMPLATE_MAP["resolution-status"].template, templatePromptId: "resolution-status" },
  { id: "cases-by-company-country", label: "Cross-reference company and country", template: TEMPLATE_MAP["cases-by-company-country"].template, templatePromptId: "cases-by-company-country" },
  { id: "cases-by-demographic", label: "Cases by gender and age range", template: TEMPLATE_MAP["cases-by-demographic"].template, templatePromptId: "cases-by-demographic" },
  { id: "cases-by-company-demographic", label: "Deep cross-reference (company, country, gender, age)", template: TEMPLATE_MAP["cases-by-company-demographic"].template, templatePromptId: "cases-by-company-demographic" },
  { id: "cases-by-date-range", label: "Cases in specific date range", template: TEMPLATE_MAP["cases-by-date-range"].template, templatePromptId: "cases-by-date-range" },
];

export function getTemplateDefinition(id: string) {
  return TEMPLATE_MAP[id] || null;
}

export function getSuggestionGroups(role?: string | null): SuggestionGroup[] {
  const groups: SuggestionGroup[] = [
    { name: "Popular questions", suggestions: STATIC_SUGGESTIONS },
    { name: "Query templates", suggestions: TEMPLATE_SUGGESTIONS },
  ];

  if (role === "lawyer") {
    groups.unshift({ name: "Legal resources", suggestions: LAWYER_SUGGESTIONS });
  } else if (role === "company") {
    groups.unshift({ name: "Company resources", suggestions: COMPANY_SUGGESTIONS });
  } else if (role === "media") {
    groups.unshift({ name: "Media & research resources", suggestions: MEDIA_SUGGESTIONS });
  }

  return groups;
}

export function filterSuggestions(groups: SuggestionGroup[], query: string): SuggestionGroup[] {
  if (!query.trim()) return groups;

  const q = query.toLowerCase();
  return groups
    .map((g) => ({
      ...g,
      suggestions: g.suggestions.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.template.toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.suggestions.length > 0);
}
