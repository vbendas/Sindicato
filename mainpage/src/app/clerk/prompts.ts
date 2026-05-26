export interface TemplateVariable {
  name: string;
  label: string;
  dataSource: "companies" | "countries" | "verticals" | "case_types" | "age_ranges" | "sexes" | "age_from" | "age_to" | "date_from" | "date_to";
}

export interface TemplatePrompt {
  id: string;
  template: string;
  description: string;
  variables: TemplateVariable[];
}

export const TEMPLATE_PROMPTS: TemplatePrompt[] = [
  {
    id: "cases-by-company",
    template: "How many cases have been filed against {company}?",
    description: "Total cases for a specific company",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  {
    id: "total-unpaid-company",
    template: "What is the total amount of unpaid wages reported against {company}?",
    description: "Sum of unpaid wages for a company",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
  {
    id: "cases-by-vertical",
    template: "How many {vertical} workers have reported cases?",
    description: "Cases by vertical (remote or gig)",
    variables: [{ name: "vertical", label: "Vertical", dataSource: "verticals" }],
  },
  {
    id: "cases-by-country",
    template: "What are the most common types of cases reported in {country}?",
    description: "Breakdown of case types per country",
    variables: [{ name: "country", label: "Country", dataSource: "countries" }],
  },
  {
    id: "cases-by-demographic",
    template: "How many {sex} workers between {age_from} and {age_to} have reported cases?",
    description: "Cases filtered by sex and age range",
    variables: [
      { name: "sex", label: "Sex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", dataSource: "age_from" },
      { name: "age_to", label: "Age to", dataSource: "age_to" },
    ],
  },
  {
    id: "cases-by-company-demographic",
    template: "What is the total number of {sex} workers between {age_from} and {age_to} reporting cases against {company} in {country}?",
    description: "Cross-reference company, gender, age, and location",
    variables: [
      { name: "sex", label: "Sex", dataSource: "sexes" },
      { name: "age_from", label: "Age from", dataSource: "age_from" },
      { name: "age_to", label: "Age to", dataSource: "age_to" },
      { name: "company", label: "Company", dataSource: "companies" },
      { name: "country", label: "Country", dataSource: "countries" },
    ],
  },
  {
    id: "most-common-case",
    template: "What is the most common type of case reported by {vertical} workers from {company}?",
    description: "Most frequent case type by vertical and company",
    variables: [
      { name: "vertical", label: "Vertical", dataSource: "verticals" },
      { name: "company", label: "Company", dataSource: "companies" },
    ],
  },
  {
    id: "cases-by-company-country",
    template: "How many cases against {company} are from {country}?",
    description: "Cases for a company filtered by country",
    variables: [
      { name: "company", label: "Company", dataSource: "companies" },
      { name: "country", label: "Country", dataSource: "countries" },
    ],
  },
  {
    id: "total-unpaid-by-vertical",
    template: "What is the total amount of unpaid wages for {vertical} workers?",
    description: "Sum of unpaid wages by vertical",
    variables: [{ name: "vertical", label: "Vertical", dataSource: "verticals" }],
  },
  {
    id: "resolution-status",
    template: "How many cases against {company} have been resolved?",
    description: "Resolution status for a company",
    variables: [{ name: "company", label: "Company", dataSource: "companies" }],
  },
];
