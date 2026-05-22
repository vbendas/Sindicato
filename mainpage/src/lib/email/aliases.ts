const CF_BASE = "https://api.cloudflare.com/client/v4";

function getCfHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.CF_API_TOKEN || ""}`,
    "Content-Type": "application/json",
  };
}

export async function createCaseAlias(
  caseId: string,
  workerEmail: string
): Promise<string> {
  const alias = `case-${caseId.slice(0, 8)}@sindicato.report`;

  if (!process.env.CF_ZONE_ID || !process.env.CF_API_TOKEN) {
    console.warn(
      "Cloudflare credentials not configured — alias creation skipped. " +
        "Set CF_ZONE_ID and CF_API_TOKEN in env."
    );
    return alias;
  }

  try {
    const response = await fetch(
      `${CF_BASE}/zones/${process.env.CF_ZONE_ID}/email/routing/rules`,
      {
        method: "POST",
        headers: getCfHeaders(),
        body: JSON.stringify({
          actions: [{ type: "forward", value: [workerEmail] }],
          matchers: [
            {
              type: "literal",
              field: "to",
              value: alias,
            },
          ],
          enabled: true,
          name: `Case ${caseId.slice(0, 8)}`,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("Cloudflare alias creation failed:", data.errors);
      return alias;
    }

    return alias;
  } catch (err) {
    console.error("Failed to create Cloudflare alias:", err);
    return alias;
  }
}

export async function disableCaseAlias(aliasRuleId: string): Promise<void> {
  if (!process.env.CF_ZONE_ID || !process.env.CF_API_TOKEN) {
    console.warn("Cloudflare credentials not configured — alias disable skipped.");
    return;
  }

  try {
    await fetch(
      `${CF_BASE}/zones/${process.env.CF_ZONE_ID}/email/routing/rules/${aliasRuleId}`,
      {
        method: "PUT",
        headers: getCfHeaders(),
        body: JSON.stringify({ enabled: false }),
      }
    );
  } catch (err) {
    console.error("Failed to disable Cloudflare alias:", err);
  }
}
