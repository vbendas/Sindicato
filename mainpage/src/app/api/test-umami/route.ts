import { NextRequest } from "next/server";
import { umamiClient } from "@/lib/umami/client";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  const websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiUrl = process.env.UMAMI_URL || "https://api.umami.is/v1";
  const hasApiKey = !!process.env.UMAMI_API_KEY;

  const stats = await umamiClient.getStats(
    "/en/cases/dc7f1a76-48a6-44dc-bd9e-05bca6b0721e",
    now - THIRTY_DAYS,
    now
  );

  const totalStats = await umamiClient.getStats(
    undefined,
    now - THIRTY_DAYS,
    now
  );

  return Response.json({
    env: {
      websiteId,
      umamiUrl,
      hasApiKey,
    },
    caseStats: stats,
    totalStats: totalStats,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
