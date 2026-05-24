type EntityType = "company" | "case" | "timeline_event";

interface ShareClickProps {
  entityType: EntityType;
  entityId: string;
  companyId?: string;
  caseId?: string;
  eventId?: string;
  platform: "x" | "linkedin" | "whatsapp" | "facebook" | "copy_link" | "instagram";
  isAuth?: boolean;
}

let umamiReady: Promise<void>;
let resolveUmami: (() => void) | null = null;

function initUmamiReady() {
  if (typeof window === "undefined") {
    umamiReady = Promise.resolve();
    return;
  }

  if (window.umami) {
    umamiReady = Promise.resolve();
    return;
  }

  umamiReady = new Promise((resolve) => {
    resolveUmami = resolve;
    setTimeout(() => {
      resolveUmami = null;
      resolve();
    }, 3000);
  });
}

initUmamiReady();

export function onUmamiLoaded() {
  if (resolveUmami) {
    resolveUmami();
    resolveUmami = null;
  }
}

export async function trackPageview(path: string, entityType?: EntityType, entityId?: string) {
  if (typeof window === "undefined") return;

  await umamiReady;

  if (!window.umami) return;

  const payload: Record<string, string> = {};
  if (entityType) payload.entity_type = entityType;
  if (entityId) payload.entity_id = entityId;

  window.umami.track(path, payload);
}

export async function trackShareClick({
  entityType,
  entityId,
  companyId,
  caseId,
  eventId,
  platform,
  isAuth = false,
}: ShareClickProps) {
  if (typeof window === "undefined") return;

  // Record locally
  fetch("/api/track/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entityType,
      entityId,
      platform,
      isAuthenticated: isAuth,
      companyId,
      caseId,
      eventId,
    }),
  }).catch(() => {});

  // Also track via Umami if available
  await umamiReady;
  if (!window.umami) return;

  window.umami.track("share_click", {
    entity_type: entityType,
    entity_id: entityId,
    ...(companyId && { company_id: companyId }),
    ...(caseId && { case_id: caseId }),
    ...(eventId && { event_id: eventId }),
    platform,
    is_authenticated: isAuth ? "true" : "false",
  });
}

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string>) => void;
    };
  }
}
