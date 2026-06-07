import { db } from "@/lib/db/client";
import { entityMetricsSnapshots, shareClickEvents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
const UMAMI_URL = process.env.UMAMI_URL || "https://api.umami.is/v1";

interface UmamiStatsResponse {
  pageviews: number;
  sessions: number;
  visitors: number;
}

interface UmamiEventResponse {
  events: Array<{ eventName: string; count: number }>;
}

class UmamiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = UMAMI_API_KEY || "";
    this.baseUrl = UMAMI_URL;

    if (!this.apiKey) {
      console.error("[Umami] UMAMI_API_KEY not set — API calls will fail");
    }
    if (!WEBSITE_ID) {
      console.error("[Umami] No WEBSITE_ID found (checked UMAMI_WEBSITE_ID, NEXT_PUBLIC_UMAMI_WEBSITE_ID)");
    }
  }

  private get isConfigured(): boolean {
    return !!this.apiKey && !!WEBSITE_ID;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { "x-umami-api-key": this.apiKey },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Umami API ${res.status}: ${body.slice(0, 200)}`);
    }
    return res.json();
  }

  async getStats(path?: string, startAt?: number, endAt?: number): Promise<{ pageviews: number; sessions: number; visitors: number }> {
    if (!this.isConfigured) {
      console.error("[Umami] getStats called but client not configured — skipping");
      return { pageviews: 0, sessions: 0, visitors: 0 };
    }

    const params = new URLSearchParams({
      startAt: String(startAt || Date.now() - 30 * 24 * 60 * 60 * 1000),
      endAt: String(endAt || Date.now()),
    });
    if (path) params.set("url", path);

    try {
      const data = await this.request<UmamiStatsResponse>(`/websites/${WEBSITE_ID}/stats?${params.toString()}`);
      return {
        pageviews: data.pageviews,
        sessions: data.sessions,
        visitors: data.visitors,
      };
    } catch (err) {
      console.error(`[Umami] getStats failed for path="${path}":`, err);
      return { pageviews: 0, sessions: 0, visitors: 0 };
    }
  }

  async getEventCount(eventName: string, startAt?: number, endAt?: number): Promise<number> {
    if (!this.isConfigured) return 0;

    const params = new URLSearchParams({
      startAt: String(startAt || Date.now() - 30 * 24 * 60 * 60 * 1000),
      endAt: String(endAt || Date.now()),
    });

    try {
      const data = await this.request<UmamiEventResponse>(`/websites/${WEBSITE_ID}/events?${params.toString()}`);
      return data.events.find((e) => e.eventName === eventName)?.count || 0;
    } catch (err) {
      console.error(`[Umami] getEventCount failed for "${eventName}":`, err);
      return 0;
    }
  }

  async recordShareClick(params: {
    entityType: string;
    entityId: string;
    platform: string;
    isAuthenticated: boolean;
    companyId?: string;
    caseId?: string;
    eventId?: string;
  }): Promise<void> {
    await db.insert(shareClickEvents).values({
      entityType: params.entityType,
      entityId: params.entityId,
      platform: params.platform,
      isAuthenticated: params.isAuthenticated,
      companyId: params.companyId || null,
      caseId: params.caseId || null,
      eventId: params.eventId || null,
    });
  }

  async updateMetricsSnapshot(
    entityType: string,
    entityId: string,
    viewsTotal: number,
    views24h: number,
    views7d: number,
    visitorsTotal: number,
    visitors24h: number,
    visitors7d: number,
    sharesTotal: number,
  ): Promise<void> {
    const existing = await db
      .select()
      .from(entityMetricsSnapshots)
      .where(and(eq(entityMetricsSnapshots.entityType, entityType), eq(entityMetricsSnapshots.entityId, entityId)))
      .limit(1);

    const values = {
      viewsTotal,
      views24h,
      views7d,
      visitorsTotal,
      visitors24h,
      visitors7d,
      sharesTotal,
      lastSyncedAt: new Date(),
    };

    if (existing.length > 0) {
      await db
        .update(entityMetricsSnapshots)
        .set(values)
        .where(and(eq(entityMetricsSnapshots.entityType, entityType), eq(entityMetricsSnapshots.entityId, entityId)));
    } else {
      await db.insert(entityMetricsSnapshots).values({ entityType, entityId, ...values });
    }
  }
}

export const umamiClient = new UmamiClient();
