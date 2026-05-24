"use client";

import { useEffect, useState } from "react";
import { Eye, Users, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EntityReachStatsProps {
  entityType: "company" | "case" | "timeline_event";
  entityId: string;
  showVisitors?: boolean;
  variant?: "default" | "compact";
}

interface MetricsData {
  viewsTotal: number;
  views24h: number;
  views7d: number;
  sharesTotal: number;
  visitorsTotal: number;
  visitors24h: number;
  visitors7d: number;
  lastUpdatedAt: string | null;
}

const VALID_ENTITY_TYPES = ["company", "case", "timeline_event"] as const;

export default function EntityReachStats({ entityType, entityId, showVisitors = true, variant = "default" }: EntityReachStatsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!VALID_ENTITY_TYPES.includes(entityType)) {
        setError("Invalid entity type");
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/metrics?type=${entityType}&id=${entityId}`);
        if (res.ok) {
          const json = await res.json();
          setMetrics(json.data);
        } else {
          throw new Error(`HTTP error: ${res.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [entityType, entityId]);

  if (error) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className={`${variant === "compact" ? "h-3 w-16" : "h-4 w-20"}`} />
        {showVisitors && <Skeleton className={`${variant === "compact" ? "h-3 w-12" : "h-4 w-16"}`} />}
        {variant !== "compact" && <Skeleton className="h-4 w-20" />}
      </div>
    );
  }

  if (!metrics) return null;

  const fmt = (n: number) => n.toLocaleString();
  const isCompact = variant === "compact";
  const iconSize = isCompact ? "size-2.5" : "size-3";

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${isCompact ? "text-[10px]" : "text-xs"} text-sindicato-warm-white/60`}>
      <span className="inline-flex items-center gap-1">
        <Eye className={iconSize} />
        {fmt(metrics.viewsTotal)} views
      </span>
      {showVisitors && metrics.visitorsTotal > 0 && (
        <span className="inline-flex items-center gap-1">
          <Users className={iconSize} />
          {fmt(metrics.visitorsTotal)} visitors
        </span>
      )}
      {metrics.sharesTotal > 0 && (
        <span className="inline-flex items-center gap-1">
          <Share2 className={iconSize} />
          {fmt(metrics.sharesTotal)} shares
        </span>
      )}
    </div>
  );
}
