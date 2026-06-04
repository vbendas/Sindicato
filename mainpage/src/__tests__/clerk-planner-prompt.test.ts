import { describe, it, expect } from "vitest";
import {
  CLERK_VALIDATION_SYSTEM,
  CLERK_QUERY_PLANNER_SYSTEM,
  CLERK_RESPONSE_SYSTEM,
  CLERK_RESPONSE_CONCISE,
} from "@/lib/ai/prompts";

describe("CLERK_VALIDATION_SYSTEM — chart commands", () => {
  it("explicitly lists chart commands as valid (when about data)", () => {
    expect(CLERK_VALIDATION_SYSTEM.toLowerCase()).toContain("create a chart of cases by country");
    expect(CLERK_VALIDATION_SYSTEM.toLowerCase()).toContain("plot unpaid wages over time");
  });

  it("no longer rejects chart commands as 'not related to querying data'", () => {
    expect(CLERK_VALIDATION_SYSTEM).not.toMatch(/is a command not related to querying data/);
  });

  it("still rejects visualization commands about non-data topics", () => {
    expect(CLERK_VALIDATION_SYSTEM.toLowerCase()).toContain("draw me a pie chart of the weather");
    expect(CLERK_VALIDATION_SYSTEM.toLowerCase()).toContain("graph last quarter's stock prices");
  });
});

describe("CLERK_QUERY_PLANNER_SYSTEM — chart-aware rules", () => {
  it("defines a CHART / VISUALIZATION REQUESTS section", () => {
    expect(CLERK_QUERY_PLANNER_SYSTEM).toContain("CHART / VISUALIZATION REQUESTS:");
  });

  it("instructs the planner to use group_by with a single dimension by default for chart requests", () => {
    const section = CLERK_QUERY_PLANNER_SYSTEM.split("CHART / VISUALIZATION REQUESTS:")[1] || "";
    expect(section.toLowerCase()).toContain("treat it as a \"group_by\" query");
  });

  it("gives an explicit dimension preference order", () => {
    const section = CLERK_QUERY_PLANNER_SYSTEM.split("CHART / VISUALIZATION REQUESTS:")[1] || "";
    expect(section).toContain("Preferences, in order");
  });

  it("forbids grouping by numeric fields", () => {
    const section = CLERK_QUERY_PLANNER_SYSTEM.split("CHART / VISUALIZATION REQUESTS:")[1] || "";
    expect(section).toContain("NEVER group by numeric fields");
  });

  it("provides a Portuguese example for chart requests", () => {
    expect(CLERK_QUERY_PLANNER_SYSTEM).toContain("Cria um gráfico dos casos por tipo");
  });
});

describe("CLERK_RESPONSE_SYSTEM — chart-aware formatting", () => {
  it("defines a CHART-AWARE FORMATTING section", () => {
    expect(CLERK_RESPONSE_SYSTEM).toContain("CHART-AWARE FORMATTING:");
  });

  it("tells the model to skip the markdown table when a chart is rendered", () => {
    const section = CLERK_RESPONSE_SYSTEM.split("CHART-AWARE FORMATTING:")[1] || "";
    expect(section.toLowerCase()).toContain("skip the markdown table");
  });

  it("tells the model to use a stat-card for count/sum", () => {
    const section = CLERK_RESPONSE_SYSTEM.split("CHART-AWARE FORMATTING:")[1] || "";
    expect(section).toContain("stat card");
  });
});

describe("CLERK_RESPONSE_CONCISE — chart-aware rules", () => {
  it("defines a CHART-AWARE CONCISE RULES section", () => {
    expect(CLERK_RESPONSE_CONCISE).toContain("CHART-AWARE CONCISE RULES:");
  });

  it("still requires the .md download call to action for list results", () => {
    expect(CLERK_RESPONSE_CONCISE).toContain("Download the .md report");
  });
});
