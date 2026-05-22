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
}

const STATIC_SUGGESTIONS: SuggestionItem[] = [
  { id: "all-unresolved", label: "Show all unresolved cases", template: "Show all unresolved cases" },
  { id: "common-violations", label: "Most common violations reported", template: "What are the most common types of violations reported?" },
  { id: "total-unpaid", label: "Total unpaid wages across all cases", template: "What is the total amount of unpaid wages reported across all cases?" },
  { id: "repeat-offenders", label: "Companies with the most cases", template: "Which companies have the most cases filed against them?" },
  { id: "cases-by-vertical", label: "Remote vs gig worker cases", template: "Compare the number of cases between remote and gig workers" },
  { id: "top-countries", label: "Countries with most cases", template: "Which countries have the most reported cases?" },
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
];

export function getTemplateDefinition(id: string) {
  return TEMPLATE_MAP[id] || null;
}

export function getSuggestionGroups(): SuggestionGroup[] {
  return [
    { name: "Popular questions", suggestions: STATIC_SUGGESTIONS },
    { name: "Query templates", suggestions: TEMPLATE_SUGGESTIONS },
  ];
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
