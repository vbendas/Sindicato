export interface SuggestionGroup {
  id: string;
  name: string;
  suggestions: SuggestionItem[];
}

export interface SuggestionItem {
  id: string;
  i18nKey: string;
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

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const STATIC_SUGGESTIONS: { id: string; i18nKey: string; template: string; templatePromptId?: string }[] = [
  { id: "all-unresolved", i18nKey: "clerk.suggestions.allUnresolved", template: "Show all unresolved cases" },
  { id: "common-violations", i18nKey: "clerk.suggestions.commonViolations", template: "What are the most common types of violations reported?" },
  { id: "total-unpaid", i18nKey: "clerk.suggestions.totalUnpaid", template: "What is the total amount of unpaid wages reported across all cases?" },
  { id: "repeat-offenders", i18nKey: "clerk.suggestions.repeatOffenders", template: "Which companies have the most cases filed against them?" },
  { id: "cases-by-vertical", i18nKey: "clerk.suggestions.casesByVertical", template: "Compare the number of cases between remote and gig workers" },
  { id: "top-countries", i18nKey: "clerk.suggestions.topCountries", template: "Which countries have the most reported cases?" },
  { id: "recent-cases-30-days", i18nKey: "clerk.suggestions.recentCases30Days", template: "Show me cases filed in the last 30 days" },
  { id: "recent-cases-this-month", i18nKey: "clerk.suggestions.recentCasesThisMonth", template: "Show me cases filed this month" },
  { id: "cases-by-date-range", i18nKey: "clerk.suggestions.casesByDateRange", template: "Show me cases filed between {date_from} and {date_to}", templatePromptId: "cases-by-date-range" },
];

const LAWYER_SUGGESTIONS: { id: string; i18nKey: string; template: string; templatePromptId?: string }[] = [
  { id: "lawyer-solicitor-optin", i18nKey: "clerk.suggestions.lawyerSolicitorOptin", template: "List all cases with solicitor opt-in for {company}", templatePromptId: "lawyer-solicitor-optin" },
  { id: "lawyer-solicitor-grouped", i18nKey: "clerk.suggestions.lawyerSolicitorGrouped", template: "Cases with solicitor opt-in grouped by case type" },
  { id: "lawyer-unresolved-contacts", i18nKey: "clerk.suggestions.lawyerUnresolvedContacts", template: "Show case numbers and aliased contacts for {company} unresolved cases", templatePromptId: "lawyer-unresolved-contacts" },
  { id: "lawyer-collective-action", i18nKey: "clerk.suggestions.lawyerCollectiveAction", template: "Collective action candidates: cases against {company} with same case type", templatePromptId: "lawyer-collective-action" },
  { id: "lawyer-high-value", i18nKey: "clerk.suggestions.lawyerHighValue", template: "What are the highest value unresolved cases with solicitor opt-in?" },
  { id: "lawyer-recent", i18nKey: "clerk.suggestions.lawyerRecent", template: "Show recent cases filed this month with solicitor opt-in" },
  { id: "lawyer-recent-30-days", i18nKey: "clerk.suggestions.lawyerRecent30Days", template: "Show cases with solicitor opt-in from the last 30 days" },
  { id: "lawyer-date-range", i18nKey: "clerk.suggestions.lawyerDateRange", template: "Show cases with solicitor opt-in between {date_from} and {date_to}", templatePromptId: "lawyer-date-range" },
  { id: "lawyer-contact-unresolved", i18nKey: "clerk.suggestions.lawyerContactUnresolved", template: "Show contact information for unresolved cases against {company}", templatePromptId: "lawyer-contact-unresolved" },
];

const COMPANY_SUGGESTIONS: { id: string; i18nKey: string; template: string; templatePromptId?: string }[] = [
  { id: "company-my-cases", i18nKey: "clerk.suggestions.companyMyCases", template: "List all cases filed against {company}", templatePromptId: "company-my-cases" },
  { id: "company-unresolved-contacts", i18nKey: "clerk.suggestions.companyUnresolvedContacts", template: "Show unresolved cases with contact aliases for {company}", templatePromptId: "company-unresolved-contacts" },
  { id: "company-grouped-type", i18nKey: "clerk.suggestions.companyGroupedType", template: "Cases grouped by type for {company}", templatePromptId: "company-grouped-type" },
  { id: "company-total-claimed", i18nKey: "clerk.suggestions.companyTotalClaimed", template: "Total amount claimed against {company}", templatePromptId: "company-total-claimed" },
  { id: "company-resolution-status", i18nKey: "clerk.suggestions.companyResolutionStatus", template: "How many cases against {company} have been resolved?", templatePromptId: "company-resolution-status" },
  { id: "company-timeline", i18nKey: "clerk.suggestions.companyTimeline", template: "Show recent cases filed against {company} this month", templatePromptId: "company-timeline" },
  { id: "company-recent-30-days", i18nKey: "clerk.suggestions.companyRecent30Days", template: "Show cases filed against {company} in the last 30 days", templatePromptId: "company-recent-30-days" },
  { id: "company-date-range", i18nKey: "clerk.suggestions.companyDateRange", template: "Show cases filed against {company} between {date_from} and {date_to}", templatePromptId: "company-date-range" },
  { id: "company-contact-unresolved", i18nKey: "clerk.suggestions.companyContactUnresolved", template: "Show contact information for unresolved cases against {company}", templatePromptId: "company-contact-unresolved" },
];

const MEDIA_SUGGESTIONS: { id: string; i18nKey: string; template: string; templatePromptId?: string }[] = [
  { id: "media-all-contacts", i18nKey: "clerk.suggestions.mediaAllContacts", template: "All cases with contact aliases for {company}", templatePromptId: "media-all-contacts" },
  { id: "media-by-country-type", i18nKey: "clerk.suggestions.mediaByCountryType", template: "Cases by country and case type" },
  { id: "media-high-value", i18nKey: "clerk.suggestions.mediaHighValue", template: "What are the highest value unresolved cases?" },
  { id: "media-recent-filed", i18nKey: "clerk.suggestions.mediaRecentFiled", template: "Recent cases filed this month" },
  { id: "media-company-trends", i18nKey: "clerk.suggestions.mediaCompanyTrends", template: "Which companies have the most cases this month?" },
  { id: "media-demographics", i18nKey: "clerk.suggestions.mediaDemographics", template: "Demographic breakdown of workers filing cases" },
  { id: "media-recent-30-days", i18nKey: "clerk.suggestions.mediaRecent30Days", template: "Show cases filed in the last 30 days" },
  { id: "media-date-range", i18nKey: "clerk.suggestions.mediaDateRange", template: "Show cases filed between {date_from} and {date_to}", templatePromptId: "media-date-range" },
  { id: "media-contact-all", i18nKey: "clerk.suggestions.mediaContactAll", template: "Show contact information for cases against {company}", templatePromptId: "media-contact-all" },
];

export const TEMPLATE_MAP: Record<string, { template: string; variables: { name: string; label: string; i18nKey: string; dataSource: keyof Variables }[] }> = {
  "cases-by-company": {
    template: "How many cases have been filed against {company}?",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "total-unpaid-company": {
    template: "What is the total amount of unpaid wages reported against {company}?",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "cases-by-country": {
    template: "What are the most common types of cases reported in {country}?",
    variables: [{ name: "country", label: "Country", i18nKey: "clerk.suggestions.varCountry", dataSource: "countries" }],
  },
  "total-unpaid-by-vertical": {
    template: "What is the total amount of unpaid wages for {vertical} workers?",
    variables: [{ name: "vertical", label: "Vertical", i18nKey: "clerk.suggestions.varVertical", dataSource: "verticals" }],
  },
  "resolution-status": {
    template: "How many cases against {company} have been resolved?",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "cases-by-company-country": {
    template: "How many cases against {company} are from {country}?",
    variables: [
      { name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" },
      { name: "country", label: "Country", i18nKey: "clerk.suggestions.varCountry", dataSource: "countries" },
    ],
  },
  "cases-by-demographic": {
    template: "How many {sex} workers between {age_from} and {age_to} have reported cases?",
    variables: [
      { name: "sex", label: "Sex", i18nKey: "clerk.suggestions.varSex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", i18nKey: "clerk.suggestions.varAgeFrom", dataSource: "age_from" },
      { name: "age_to", label: "Age to", i18nKey: "clerk.suggestions.varAgeTo", dataSource: "age_to" },
    ],
  },
  "cases-by-company-demographic": {
    template: "What is the total number of {sex} workers between {age_from} and {age_to} reporting cases against {company} in {country}?",
    variables: [
      { name: "sex", label: "Sex", i18nKey: "clerk.suggestions.varSex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", i18nKey: "clerk.suggestions.varAgeFrom", dataSource: "age_from" },
      { name: "age_to", label: "Age to", i18nKey: "clerk.suggestions.varAgeTo", dataSource: "age_to" },
      { name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" },
      { name: "country", label: "Country", i18nKey: "clerk.suggestions.varCountry", dataSource: "countries" },
    ],
  },
  "lawyer-solicitor-optin": {
    template: "List all cases with solicitor opt-in for {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "lawyer-unresolved-contacts": {
    template: "Show case numbers and aliased contacts for {company} unresolved cases",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "lawyer-collective-action": {
    template: "Collective action candidates: cases against {company} with same case type",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-my-cases": {
    template: "List all cases filed against {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-unresolved-contacts": {
    template: "Show unresolved cases with contact aliases for {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-grouped-type": {
    template: "Cases grouped by type for {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-total-claimed": {
    template: "Total amount claimed against {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-resolution-status": {
    template: "How many cases against {company} have been resolved?",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-timeline": {
    template: "Show recent cases filed against {company} this month",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "media-all-contacts": {
    template: "All cases with contact aliases for {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "cases-by-date-range": {
    template: "Show me cases filed between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", i18nKey: "clerk.suggestions.varDateFrom", dataSource: "date_from" },
      { name: "date_to", label: "To date", i18nKey: "clerk.suggestions.varDateTo", dataSource: "date_to" },
    ],
  },
  "lawyer-date-range": {
    template: "Show cases with solicitor opt-in between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", i18nKey: "clerk.suggestions.varDateFrom", dataSource: "date_from" },
      { name: "date_to", label: "To date", i18nKey: "clerk.suggestions.varDateTo", dataSource: "date_to" },
    ],
  },
  "company-recent-30-days": {
    template: "Show cases filed against {company} in the last 30 days",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-date-range": {
    template: "Show cases filed against {company} between {date_from} and {date_to}",
    variables: [
      { name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" },
      { name: "date_from", label: "From date", i18nKey: "clerk.suggestions.varDateFrom", dataSource: "date_from" },
      { name: "date_to", label: "To date", i18nKey: "clerk.suggestions.varDateTo", dataSource: "date_to" },
    ],
  },
  "media-date-range": {
    template: "Show cases filed between {date_from} and {date_to}",
    variables: [
      { name: "date_from", label: "From date", i18nKey: "clerk.suggestions.varDateFrom", dataSource: "date_from" },
      { name: "date_to", label: "To date", i18nKey: "clerk.suggestions.varDateTo", dataSource: "date_to" },
    ],
  },
  "lawyer-contact-unresolved": {
    template: "Show contact information for unresolved cases against {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "company-contact-unresolved": {
    template: "Show contact information for unresolved cases against {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
  "media-contact-all": {
    template: "Show contact information for cases against {company}",
    variables: [{ name: "company", label: "Company", i18nKey: "clerk.suggestions.varCompany", dataSource: "companies" }],
  },
};

const TEMPLATE_SUGGESTIONS: { id: string; i18nKey: string; template: string; templatePromptId?: string }[] = [
  { id: "cases-by-company", i18nKey: "clerk.suggestions.tplCasesByCompany", template: TEMPLATE_MAP["cases-by-company"].template, templatePromptId: "cases-by-company" },
  { id: "total-unpaid-company", i18nKey: "clerk.suggestions.tplTotalUnpaidCompany", template: TEMPLATE_MAP["total-unpaid-company"].template, templatePromptId: "total-unpaid-company" },
  { id: "cases-by-country", i18nKey: "clerk.suggestions.tplCasesByCountry", template: TEMPLATE_MAP["cases-by-country"].template, templatePromptId: "cases-by-country" },
  { id: "total-unpaid-by-vertical", i18nKey: "clerk.suggestions.tplTotalUnpaidByVertical", template: TEMPLATE_MAP["total-unpaid-by-vertical"].template, templatePromptId: "total-unpaid-by-vertical" },
  { id: "resolution-status", i18nKey: "clerk.suggestions.tplResolutionStatus", template: TEMPLATE_MAP["resolution-status"].template, templatePromptId: "resolution-status" },
  { id: "cases-by-company-country", i18nKey: "clerk.suggestions.tplCasesByCompanyCountry", template: TEMPLATE_MAP["cases-by-company-country"].template, templatePromptId: "cases-by-company-country" },
  { id: "cases-by-demographic", i18nKey: "clerk.suggestions.tplCasesByDemographic", template: TEMPLATE_MAP["cases-by-demographic"].template, templatePromptId: "cases-by-demographic" },
  { id: "cases-by-company-demographic", i18nKey: "clerk.suggestions.tplCasesByCompanyDemographic", template: TEMPLATE_MAP["cases-by-company-demographic"].template, templatePromptId: "cases-by-company-demographic" },
  { id: "cases-by-date-range", i18nKey: "clerk.suggestions.tplCasesByDateRange", template: TEMPLATE_MAP["cases-by-date-range"].template, templatePromptId: "cases-by-date-range" },
];

export function getTemplateDefinition(id: string) {
  return TEMPLATE_MAP[id] || null;
}

function resolveSuggestions(
  items: { id: string; i18nKey: string; template: string; templatePromptId?: string }[],
  t: TFunction
): SuggestionItem[] {
  return items.map((s) => ({
    ...s,
    label: t(s.i18nKey),
  }));
}

export function getSuggestionGroups(role?: string | null, t?: TFunction): SuggestionGroup[] {
  const translate = t ?? ((key: string) => key);

  const groups: SuggestionGroup[] = [
    { id: "popular", name: translate("clerk.suggestions.groupPopular"), suggestions: resolveSuggestions(STATIC_SUGGESTIONS, translate) },
    { id: "templates", name: translate("clerk.suggestions.groupTemplates"), suggestions: resolveSuggestions(TEMPLATE_SUGGESTIONS, translate) },
  ];

  if (role === "lawyer") {
    groups.unshift({ id: "legal", name: translate("clerk.suggestions.groupLegal"), suggestions: resolveSuggestions(LAWYER_SUGGESTIONS, translate) });
  } else if (role === "company") {
    groups.unshift({ id: "company", name: translate("clerk.suggestions.groupCompany"), suggestions: resolveSuggestions(COMPANY_SUGGESTIONS, translate) });
  } else if (role === "media") {
    groups.unshift({ id: "media", name: translate("clerk.suggestions.groupMedia"), suggestions: resolveSuggestions(MEDIA_SUGGESTIONS, translate) });
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
