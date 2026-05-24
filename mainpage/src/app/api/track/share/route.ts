import { umamiClient } from "@/lib/umami/client";
import { error, success } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

const ALLOWED_ENTITY_TYPES = ["company", "case", "timeline_event"];
const ALLOWED_PLATFORMS = ["x", "linkedin", "whatsapp", "facebook", "copy_link", "instagram"];

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(`track:${ip}`, 30, 60_000);
  if (!allowed) return error("Too many requests", 429);

  try {
    const body = await request.json();
    const { entityType, entityId, platform, isAuthenticated, companyId, caseId, eventId } = body;

    if (!entityType || !entityId || !platform) {
      return error("Missing required fields: entityType, entityId, platform", 400);
    }

    if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
      return error("Invalid entityType", 400);
    }

    if (!ALLOWED_PLATFORMS.includes(platform)) {
      return error("Invalid platform", 400);
    }

    await umamiClient.recordShareClick({
      entityType,
      entityId,
      platform,
      isAuthenticated: !!isAuthenticated,
      companyId: companyId || undefined,
      caseId: caseId || undefined,
      eventId: eventId || undefined,
    });

    return success({ recorded: true });
  } catch (err) {
    console.error("Failed to record share click:", err);
    return error("Failed to record share click", 500);
  }
}
