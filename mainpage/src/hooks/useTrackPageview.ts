import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/umami";

type EntityType = "company" | "case" | "timeline_event";

export function useTrackPageview(entityType?: EntityType, entityId?: string) {
  const pathname = usePathname();
  const hasTrackedRef = useRef(false);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      hasTrackedRef.current = false;
      prevPathRef.current = pathname;
    }

    if (!entityType || !entityId || hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    trackPageview(pathname, entityType, entityId);
  }, [pathname, entityType, entityId]);
}
