export type DownloadInput = {
  content: string;
  queryResultsJson?: string;
  reportTitle: string;
  reportFullCases: string;
  reportCasesCountTemplate: string;
  reportCompany: string;
  reportCountry: string;
  reportCaseType: string;
  reportAmount: string;
  reportDateRange: string;
  reportStatus: string;
  reportContact: string;
  reportStory: string;
  downloadError: string;
  filenamePrefix?: string;
  onParseError?: () => void;
};

export function buildMarkdownReport(input: DownloadInput): { markdown: string; ok: boolean } {
  const date = new Date().toISOString().split("T")[0];
  let fullContent = input.content;

  if (input.queryResultsJson) {
    try {
      const results = JSON.parse(input.queryResultsJson);
      if (results.rows && results.rows.length > 0) {
        fullContent += `\n\n---\n\n${input.reportFullCases}\n\n`;
        fullContent += `*${input.reportCasesCountTemplate.replace("{count}", String(results.rows.length))}*\n\n`;
        for (const row of results.rows) {
          const r = row as Record<string, unknown>;
          fullContent += `### Case ${r.id ?? "?"}\n\n`;
          fullContent += `${input.reportCompany} ${r.companyName ?? ""}\n\n`;
          fullContent += `${input.reportCountry} ${r.country ?? ""}\n\n`;
          fullContent += `${input.reportCaseType} ${r.caseType ?? ""}\n\n`;
          fullContent += `${input.reportAmount} ${r.currency ?? ""} ${r.amountOwed ?? ""}\n\n`;
          fullContent += `${input.reportDateRange} ${r.dateRange ?? ""}\n\n`;
          fullContent += `${input.reportStatus} ${r.resolutionStatus ?? ""}\n\n`;
          if (r.contactAlias) {
            fullContent += `${input.reportContact} ${r.contactAlias}\n\n`;
          }
          if (r.story) {
            fullContent += `${input.reportStory}\n\n${r.story}\n\n`;
          }
          fullContent += "---\n\n";
        }
      }
    } catch {
      if (input.onParseError) input.onParseError();
      return { markdown: "", ok: false };
    }
  }

  const markdown = `# ${input.reportTitle}\n\n${date}\n\n---\n\n${fullContent}`;
  return { markdown, ok: true };
}

export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
