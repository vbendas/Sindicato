"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check } from "lucide-react";
import InstagramStoryCard from "./InstagramStoryCard";
import { trackShareClick } from "@/lib/umami";
import { useT } from "@/lib/i18n";

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "size-3.5"}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "size-3.5"}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "size-3.5"}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "size-3.5"}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "size-3.5"}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

type ShareVariant = "company" | "case" | "event";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  variant: ShareVariant;
  companyName?: string;
  stats?: {
    cases?: number;
    totalOwed?: string;
    amount?: string;
    country?: string;
    date?: string;
  };
  caseType?: string;
  displayName?: string;
  dateRange?: string;
  vertical?: string;
  resolutionStatus?: string;
  className?: string;
  entityType?: "company" | "case" | "timeline_event";
  entityId?: string;
  companyId?: string;
  caseId?: string;
  eventId?: string;
  isAuth?: boolean;
}

function buildShareUrls(
  url: string,
  title: string,
  description?: string
) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(
    description ? `${title}\n\n${description}` : title
  );
  const encodedWhatsApp = encodeURIComponent(
    description ? `${title} — ${description}\n\n${url}` : `${title}\n\n${url}`
  );

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedWhatsApp}`,
  };
}

function openShare(url: string, platform?: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
}

export default function ShareButtons({
  url,
  title,
  description,
  variant,
  companyName,
  stats,
  caseType,
  displayName,
  dateRange,
  vertical,
  resolutionStatus,
  className,
  entityType,
  entityId,
  companyId,
  caseId,
  eventId,
  isAuth,
}: ShareButtonsProps) {
  const [showInstagram, setShowInstagram] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramGenerated, setInstagramGenerated] = useState(false);
  const t = useT();

  // Generate improved text based on variant
  let improvedTitle = title || "";
  let improvedDescription = description || "";

  if (variant === "company" && stats?.cases !== undefined && stats?.totalOwed) {
    improvedTitle = `${stats.cases} cases filed against ${companyName} for over $${stats.totalOwed} in unpaid wages. Help us hold them accountable!`;
    improvedDescription = `${stats.cases} workers have reported $${stats.totalOwed} in stolen wages. Share to demand justice.`;
  } else if (variant === "case" && stats?.amount && stats?.country && companyName) {
    improvedTitle = `A worker from ${stats.country} is owed ${stats.amount} by ${companyName}. Exploitation like this must end. Share to help!`;
    improvedDescription = `Read the full story of wage theft and exploitation. Share to support the worker and hold the company accountable.`;
  } else if (variant === "case" && stats?.country && companyName) {
    improvedTitle = `A worker from ${stats.country} is fighting against ${companyName}. Join the fight for fair treatment!`;
    improvedDescription = `Learn about this case of workplace injustice. Share to spread awareness and support the worker.`;
  } else if (variant === "case" && title) {
    improvedTitle = `Important case: ${title}. Share to follow the story and help the worker get justice!`;
    improvedDescription = `An important update in this case. Share to follow the story and support the worker.`;
  } else if (variant === "event" && title) {
    improvedTitle = `Important update in case #${title.split('-').pop()?.toUpperCase() || 'UNKNOWN'}: ${title}. Share to follow the story!`;
    improvedDescription = `An important update in this case. Share to follow the story and help the worker get justice.`;
  } else if (variant === "company" && companyName) {
    improvedTitle = `${companyName} has multiple cases filed against them. Help us demand accountability!`;
    improvedDescription = `Workers are fighting for justice against ${companyName}. Share to spread awareness and support their cause.`;
  } else if (title) {
    improvedTitle = `${title}. Share to learn more and support the cause!`;
    improvedDescription = `Read about this important issue and share to help make a difference.`;
  }

  const urls = buildShareUrls(url, improvedTitle, improvedDescription);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleInstagramImageGenerated(blob: Blob) {
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "sindicato-story.png";
    a.click();
    URL.revokeObjectURL(downloadUrl);

    setInstagramGenerated(true);
    setTimeout(() => setInstagramGenerated(false), 3000);
  }

  const platforms = [
    {
      name: "X",
      icon: IconX,
      url: urls.twitter,
      color: "hover:bg-white/10",
      platformKey: "x",
    },
    {
      name: "LinkedIn",
      icon: IconLinkedin,
      url: urls.linkedin,
      color: "hover:bg-white/10",
      platformKey: "linkedin",
    },
    {
      name: "Facebook",
      icon: IconFacebook,
      url: urls.facebook,
      color: "hover:bg-white/10",
      platformKey: "facebook",
    },
    {
      name: "WhatsApp",
      icon: IconWhatsApp,
      url: urls.whatsapp,
      color: "hover:bg-white/10",
      platformKey: "whatsapp",
    },
  ];

  const handleShareClick = (platform: string) => {
    if (entityType && entityId) {
      trackShareClick({
        entityType: entityType,
        entityId: entityId,
        companyId: companyId,
        caseId: caseId,
        eventId: eventId,
        platform: platform as any,
        isAuth: isAuth || false,
      });
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Social platform buttons */}
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => {
              handleShareClick(platform.platformKey);
              openShare(platform.url);
            }}
            className={`flex items-center gap-1.5 text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors ${platform.color} px-3 py-1.5 border border-white/10 text-xs uppercase tracking-wider font-bold font-[family-name:var(--font-barlow)]`}
            title={`Share on ${platform.name}`}
          >
            <platform.icon className="size-3.5" />
            <span>{platform.name}</span>
          </button>
        ))}

        {/* Instagram */}
        <button
          onClick={() => {
            handleShareClick("instagram");
            setShowInstagram(true);
          }}
          className="flex items-center gap-1.5 text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors hover:bg-white/10 px-3 py-1.5 border border-white/10 text-xs uppercase tracking-wider font-bold font-[family-name:var(--font-barlow)]"
          title="Download Instagram Story"
        >
          <IconInstagram />
          <span>Instagram</span>
        </button>

        {/* Copy link */}
        <button
          onClick={() => {
            handleShareClick("copy_link");
            handleCopy();
          }}
          className="flex items-center gap-1.5 text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors hover:bg-white/10 px-3 py-1.5 border border-white/10 text-xs uppercase tracking-wider font-bold font-[family-name:var(--font-barlow)]"
          title={t("common.copyLink")}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-400" />
              <span className="text-green-400">{t("common.copied")}</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>{t("common.copyLink")}</span>
            </>
          )}
        </button>
      </div>

      {/* Instagram Story Card Modal */}
      {showInstagram && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-sindicato-charcoal border border-white/10 p-6 max-w-sm w-full mx-4">
            <button
              onClick={() => setShowInstagram(false)}
              className="absolute top-4 right-4 text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <p className="text-sindicato-warm-white font-bold uppercase tracking-wider mb-2 font-[family-name:var(--font-barlow)]">
              Instagram Story
            </p>
            <p className="text-sindicato-warm-white/50 text-xs mb-6">
              Download a story card to share on Instagram. You can add hashtags,
              tag pages, or people before posting.
            </p>

            <InstagramStoryCard
              variant={variant}
              url={url}
              title={title}
              description={description}
              companyName={companyName}
              stats={stats}
              caseType={caseType}
              displayName={displayName}
              dateRange={dateRange}
              vertical={vertical}
              resolutionStatus={resolutionStatus}
              onImageGenerated={handleInstagramImageGenerated}
            />

            {instagramGenerated && (
              <p className="text-green-400 text-xs mt-3 text-center">
                Story card downloaded! Open Instagram to share it.
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
