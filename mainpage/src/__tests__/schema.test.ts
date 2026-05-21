import { describe, it, expect } from "vitest";
import {
  workers,
  companies,
  cases,
  companyVerifications,
  dataAccessLogs,
  reports,
  verificationTokens,
  caseStatusEnum,
  reportTypeEnum,
} from "@/lib/db/schema";

describe("Database schema structure", () => {
  it("workers table has required columns", () => {
    const cols = Object.keys(workers);
    expect(cols).toContain("id");
    expect(cols).toContain("email");
    expect(cols).toContain("displayName");
    expect(cols).toContain("phone");
    expect(cols).toContain("emailVerified");
    expect(cols).toContain("phoneVerified");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("updatedAt");
  });

  it("companies table has required columns", () => {
    const cols = Object.keys(companies);
    expect(cols).toContain("id");
    expect(cols).toContain("slug");
    expect(cols).toContain("name");
    expect(cols).toContain("website");
    expect(cols).toContain("vertical");
    expect(cols).toContain("contactEmails");
    expect(cols).toContain("resolutionEngaged");
    expect(cols).toContain("createdAt");
  });

  it("cases table has required columns", () => {
    const cols = Object.keys(cases);
    expect(cols).toContain("id");
    expect(cols).toContain("workerId");
    expect(cols).toContain("companyId");
    expect(cols).toContain("vertical");
    expect(cols).toContain("displayName");
    expect(cols).toContain("country");
    expect(cols).toContain("ageRange");
    expect(cols).toContain("sex");
    expect(cols).toContain("project");
    expect(cols).toContain("dateRange");
    expect(cols).toContain("amountOwed");
    expect(cols).toContain("currency");
    expect(cols).toContain("contactAttempts");
    expect(cols).toContain("story");
    expect(cols).toContain("storyTranslated");
    expect(cols).toContain("translationLanguage");
    expect(cols).toContain("contactAlias");
    expect(cols).toContain("aliasRuleId");
    expect(cols).toContain("aliasActive");
    expect(cols).toContain("optInSolicitor");
    expect(cols).toContain("optInCollective");
    expect(cols).toContain("optInCompanyNotify");
    expect(cols).toContain("email");
    expect(cols).toContain("attested");
    expect(cols).toContain("turnstileVerified");
    expect(cols).toContain("status");
    expect(cols).toContain("consentLegal");
    expect(cols).toContain("consentCollective");
    expect(cols).toContain("resolutionStatus");
    expect(cols).toContain("resolutionDate");
    expect(cols).toContain("resolutionFeedback");
    expect(cols).toContain("lastFollowUpSentAt");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("updatedAt");
  });

  it("companyVerifications table has required columns", () => {
    const cols = Object.keys(companyVerifications);
    expect(cols).toContain("id");
    expect(cols).toContain("companyId");
    expect(cols).toContain("employeeName");
    expect(cols).toContain("employeeRole");
    expect(cols).toContain("officialEmail");
    expect(cols).toContain("emailVerified");
    expect(cols).toContain("nonRetaliationSigned");
    expect(cols).toContain("signedAgreementUrl");
    expect(cols).toContain("stripePaymentId");
    expect(cols).toContain("createdAt");
  });

  it("dataAccessLogs table has required columns", () => {
    const cols = Object.keys(dataAccessLogs);
    expect(cols).toContain("id");
    expect(cols).toContain("caseId");
    expect(cols).toContain("accessorId");
    expect(cols).toContain("accessedAt");
    expect(cols).toContain("workerNotified");
  });

  it("reports table has required columns", () => {
    const cols = Object.keys(reports);
    expect(cols).toContain("id");
    expect(cols).toContain("companyId");
    expect(cols).toContain("reportType");
    expect(cols).toContain("content");
    expect(cols).toContain("pdfUrl");
    expect(cols).toContain("generatedAt");
  });

  it("verificationTokens table has required columns", () => {
    const cols = Object.keys(verificationTokens);
    expect(cols).toContain("id");
    expect(cols).toContain("email");
    expect(cols).toContain("code");
    expect(cols).toContain("expiresAt");
    expect(cols).toContain("usedAt");
    expect(cols).toContain("createdAt");
  });

  it("caseStatusEnum has correct values", () => {
    expect(caseStatusEnum.enumValues).toEqual(["active", "resolved", "deleted"]);
  });

  it("reportTypeEnum has correct values", () => {
    expect(reportTypeEnum.enumValues).toEqual(["lawyer", "company"]);
  });
});
