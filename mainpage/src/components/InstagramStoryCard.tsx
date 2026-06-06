"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toBlob } from "html-to-image";

type ShareVariant = "company" | "case" | "event";

interface InstagramStoryCardProps {
  variant: ShareVariant;
  url: string;
  title: string;
  description?: string;
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
  onImageGenerated?: (blob: Blob) => void;
}

const CASE_TYPE_LABELS: Record<string, string> = {
  unpaid_wages: "Unpaid Wages",
  late_payment: "Late Payment",
  sudden_deactivation: "Sudden Deactivation",
  unfair_review: "Unfair Performance Review",
  predatory_practices: "Predatory Practices",
  harassment: "Harassment",
  retaliation: "Retaliation",
  contract_violation: "Contract Violation",
  data_privacy: "Data / Privacy Issue",
  other: "Other",
};

interface CaseTypeVisual {
  impactWord: string;
  gradient: string;
  illustration: string;
  hasAmount: boolean;
  accentColor: string;
}

const CASE_TYPE_VISUALS: Record<string, CaseTypeVisual> = {
  unpaid_wages: {
    impactWord: "STOLEN",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #6b0f1a 40%, #1a1a1a 100%)",
    illustration: "/images/hand_red.webp",
    hasAmount: true,
    accentColor: "#C41E3A",
  },
  late_payment: {
    impactWord: "DELAYED",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #2c2824 40%, #1a1a1a 100%)",
    illustration: "/images/pen.png",
    hasAmount: true,
    accentColor: "#C9A84C",
  },
  sudden_deactivation: {
    impactWord: "SILENCED",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #c45a30 40%, #1a1a1a 100%)",
    illustration: "/images/helmet.png",
    hasAmount: true,
    accentColor: "#F26522",
  },
  unfair_review: {
    impactWord: "GAGGED",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #2c2824 40%, #1a1a1a 100%)",
    illustration: "/images/keyboard.webp",
    hasAmount: false,
    accentColor: "#D4C49F",
  },
  predatory_practices: {
    impactWord: "TRAPPED",
    gradient: "linear-gradient(180deg, #27070b 0%, #4a0a12 40%, #27070b 100%)",
    illustration: "/images/hammer.png",
    hasAmount: false,
    accentColor: "#8B1A2A",
  },
  harassment: {
    impactWord: "ABUSE",
    gradient: "linear-gradient(180deg, #1a1018 0%, #6b0f1a 40%, #1a1018 100%)",
    illustration: "/images/flame.png",
    hasAmount: false,
    accentColor: "#C41E3A",
  },
  retaliation: {
    impactWord: "PUNISHED",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #c41e3a 40%, #1a1a1a 100%)",
    illustration: "/images/megaphone_red.webp",
    hasAmount: false,
    accentColor: "#C41E3A",
  },
  contract_violation: {
    impactWord: "BROKEN",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #12261c 40%, #1a1a1a 100%)",
    illustration: "/images/pen.png",
    hasAmount: true,
    accentColor: "#4A5C3A",
  },
  data_privacy: {
    impactWord: "EXPOSED",
    gradient: "linear-gradient(180deg, #1a2330 0%, #2c2824 40%, #1a2330 100%)",
    illustration: "/images/headset.png",
    hasAmount: false,
    accentColor: "#2C2824",
  },
  other: {
    impactWord: "INJUSTICE",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #12261c 40%, #1a1a1a 100%)",
    illustration: "/images/hand.webp",
    hasAmount: false,
    accentColor: "#C41E3A",
  },
};

const DEFAULT_VISUAL: CaseTypeVisual = {
  impactWord: "INJUSTICE",
  gradient: "linear-gradient(180deg, #1a1a1a 0%, #12261c 40%, #1a1a1a 100%)",
  illustration: "/images/hand.png",
  hasAmount: false,
  accentColor: "#C41E3A",
};

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/\s+\S*$/, "");
}

export default function InstagramStoryCard({
  variant,
  url,
  title,
  description,
  companyName,
  stats,
  caseType,
  displayName,
  dateRange: _dateRange,
  vertical: _vertical,
  resolutionStatus: _resolutionStatus,
  onImageGenerated,
}: InstagramStoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 628,
      margin: 2,
      color: {
        dark: "#1a1a1a",
        light: "#f5e8e3",
      },
    }).then(setQrDataUrl);
  }, [url]);

  async function generateImage() {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    const el = cardRef.current;
    el.style.visibility = "visible";
    el.style.opacity = "0";

    try {
      const blob = await toBlob(el, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          visibility: "visible",
          position: "relative",
          opacity: "1",
        },
      });
      if (blob) {
        onImageGenerated?.(blob);
      }
    } catch (err) {
      console.error("Failed to generate Instagram story image:", err);
    } finally {
      el.style.visibility = "hidden";
      el.style.opacity = "";
      setGenerating(false);
    }
  }

  const visual = CASE_TYPE_VISUALS[caseType ?? ""] ?? DEFAULT_VISUAL;
  const caseTypeLabel = CASE_TYPE_LABELS[caseType ?? ""] ?? "Case";
  const heroHasAmount = !!(stats?.amount && visual.hasAmount);
  const heroText = heroHasAmount ? stats.amount! : visual.impactWord;
  const heroFontSize = heroHasAmount ? 106 : 120;
  const impactWord = heroHasAmount ? visual.impactWord : null;
  const country = stats?.country ?? "";
  const workerLabel = displayName
    ? `${displayName} from ${country}`
    : country
      ? `A worker from ${country}`
      : null;
  const storyQuote = description ? truncate(description, 600) : null;

  const grainSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`;

  return (
    <>
      <div
        ref={cardRef}
        className="fixed pointer-events-none"
        style={{ width: 1080, height: 1920, left: 0, top: 0, visibility: "hidden" }}
      >
        <div
          className="relative w-full h-full flex flex-col overflow-hidden"
          style={{ background: visual.gradient }}
        >
          {/* Grain overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: grainSvg }}
          />

          {/* Case-type illustration background */}
          {variant === "case" && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${visual.illustration})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.06,
              }}
            />
          )}

          {/* Top branding */}
          <div className="relative z-10" style={{ padding: "50px 60px 0", textAlign: "center" }}>
            <p
              style={{
                fontSize: 38,
                fontFamily: "'Barlow Condensed', sans-serif",
                color: "#FFFFFF",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Sindicato
            </p>
            <div
              style={{
                width: 60,
                height: 2,
                backgroundColor: "rgba(255,255,255,0.2)",
                margin: "12px auto 0",
              }}
            />
          </div>

          {/* Main content */}
          <div
            className="relative z-10"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "40px 60px",
            }}
          >
            {variant === "case" ? (
              <>
                {/* Hero */}
                <p
                  style={{
                    fontSize: heroFontSize,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    lineHeight: 0.9,
                    textAlign: "center",
                    margin: 0,
                    maxWidth: 960,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {heroText}
                </p>

                {/* Impact word */}
                {impactWord && (
                    <p
                      style={{
                        fontSize: 58,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: visual.accentColor,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "0.3em",
                      textAlign: "center",
                      margin: "16px 0 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {impactWord}
                  </p>
                )}

                {/* Case type badge */}
                <div
                  style={{
                    marginTop: 48,
                    border: "1px solid rgba(255,255,255,0.3)",
                    padding: "10px 28px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 24,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 700,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {caseTypeLabel}
                  </p>
                </div>

                {/* Worker vs Company */}
                {workerLabel && companyName && (
                  <>
                    <div style={{ height: 32 }} />
                    <p
                      style={{
                        fontSize: 44,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 400,
                        textAlign: "center",
                        margin: 0,
                      }}
                    >
                      {workerLabel}
                    </p>
                    <p
                      style={{
                        fontSize: 24,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      color: "rgba(255,255,255,0.25)",
                          fontWeight: 400,
                          textAlign: "center",
                          margin: "6px 0",
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                        }}
                      >
                        vs.
                      </p>
                      <p
                        style={{
                          fontSize: 68,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        textAlign: "center",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        maxWidth: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {companyName}
                    </p>
                  </>
                )}

                {/* Story quote */}
                {storyQuote && (
                  <div style={{ marginTop: 48, maxWidth: 860 }}>
                    <p
                      style={{
                        fontSize: 36,
                        fontFamily: "'Inter', sans-serif",
                        color: "rgba(255,255,255,0.6)",
                        fontStyle: "italic",
                        textAlign: "center",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      &ldquo;{storyQuote}&hellip;&rdquo;
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Non-case variants: company / event */}
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.3)",
                    padding: "8px 24px",
                    marginBottom: 32,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 700,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {variant === "company" ? "Company Report" : "Timeline Event"}
                  </p>
                </div>

                <p
                  style={{
                    fontSize: variant === "event" ? 40 : 48,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    textAlign: "center",
                    textTransform: "uppercase",
                    margin: "0 0 24px",
                    maxWidth: 900,
                  }}
                >
                  {title}
                </p>

                {description && (
                  <p
                    style={{
                      fontSize: 20,
                      fontFamily: "'Inter', sans-serif",
                      color: "rgba(255,255,255,0.6)",
                      textAlign: "center",
                      lineHeight: 1.6,
                      margin: "0 0 32px",
                      maxWidth: 800,
                    }}
                  >
                    {description.length > 200
                      ? description.slice(0, 200) + "..."
                      : description}
                  </p>
                )}

                {stats && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 32,
                      marginBottom: 32,
                    }}
                  >
                    {stats.cases !== undefined && (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            margin: "0 0 4px",
                          }}
                        >
                          Cases
                        </p>
                        <p
                          style={{
                            fontSize: 48,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {stats.cases}
                        </p>
                      </div>
                    )}
                    {stats.totalOwed && (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            margin: "0 0 4px",
                          }}
                        >
                          Total Unpaid
                        </p>
                        <p
                          style={{
                            fontSize: 48,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          ${stats.totalOwed}
                        </p>
                      </div>
                    )}
                    {stats.amount && (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            margin: "0 0 4px",
                          }}
                        >
                          Amount Owed
                        </p>
                        <p
                          style={{
                            fontSize: 48,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {stats.amount}
                        </p>
                      </div>
                    )}
                    {stats.country && (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            margin: "0 0 4px",
                          }}
                        >
                          Country
                        </p>
                        <p
                          style={{
                            fontSize: 32,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {stats.country}
                        </p>
                      </div>
                    )}
                    {stats.date && (
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            margin: "0 0 4px",
                          }}
                        >
                          Date
                        </p>
                        <p
                          style={{
                            fontSize: 28,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {stats.date}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {companyName && (
                  <p
                    style={{
                      fontSize: 18,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      margin: "8px 0 0",
                    }}
                  >
                    {companyName}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Bottom: QR + URL */}
          <div
            className="relative z-10"
            style={{
              padding: "0 60px 100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: 314, height: 314, marginBottom: 16 }}
              />
            )}
            <p
              style={{
                fontSize: 21,
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                textAlign: "center",
                margin: 0,
                maxWidth: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {url}
            </p>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 6,
              background: `linear-gradient(90deg, ${visual.accentColor}, #6b0f1a, ${visual.accentColor})`,
            }}
          />
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={generateImage}
        disabled={generating || !qrDataUrl}
        className="flex items-center gap-2 text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-bold font-[family-name:var(--font-barlow)]"
      >
        {generating ? (
          <span>Generating...</span>
        ) : (
          <span>Download Story</span>
        )}
      </button>
    </>
  );
}
