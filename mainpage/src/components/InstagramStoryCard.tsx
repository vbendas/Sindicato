"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toBlob, toPng } from "html-to-image";

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
  onImageGenerated?: (blob: Blob) => void;
}

export default function InstagramStoryCard({
  variant,
  url,
  title,
  description,
  companyName,
  stats,
  onImageGenerated,
}: InstagramStoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 180,
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

    try {
      const blob = await toBlob(cardRef.current, {
        width: 1080,
        height: 1920,
        quality: 1,
        pixelRatio: 1,
        cacheBust: true,
      });
      if (blob) {
        onImageGenerated?.(blob);
      }
    } catch (err) {
      console.error("Failed to generate Instagram story image:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className="fixed pointer-events-none"
        style={{ width: 1080, height: 1920, left: 0, top: 0, visibility: "hidden" }}
      >
        <div
          className="relative w-full h-full flex flex-col items-center justify-between p-16 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #1a1a1a 0%, #12261c 50%, #1a1a1a 100%)",
          }}
        >
          {/* Grain overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Top branding */}
          <div className="relative z-10 w-full text-center mt-8">
            <p
              className="text-white font-bold uppercase tracking-[0.3em]"
              style={{
                fontSize: 28,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Sindicato
            </p>
            <p
              className="text-white/40 uppercase tracking-[0.2em] mt-2"
              style={{
                fontSize: 14,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Make Exploitation Expensive
            </p>
          </div>

          {/* Center content */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 px-4">
            {/* Variant badge */}
            <div
              className="border border-white/30 px-6 py-2 mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <p
                className="text-white/60 font-bold uppercase tracking-[0.3em]"
                style={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {variant === "company"
                  ? "Company Report"
                  : variant === "case"
                    ? "Case Record"
                    : "Timeline Event"}
              </p>
            </div>

            {/* Title */}
            <p
              className="text-white font-bold uppercase text-center leading-tight mb-6"
              style={{
                fontSize: variant === "event" ? 40 : 48,
                fontFamily: "'Barlow Condensed', sans-serif",
                lineHeight: 1.1,
                maxWidth: 900,
              }}
            >
              {title}
            </p>

            {/* Description */}
            {description && (
              <p
                className="text-white/60 text-center leading-relaxed mb-8"
                style={{
                  fontSize: 20,
                  fontFamily: "'Inter', sans-serif",
                  maxWidth: 800,
                  lineHeight: 1.6,
                }}
              >
                {description.length > 200
                  ? description.slice(0, 200) + "..."
                  : description}
              </p>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
                {stats.cases !== undefined && (
                  <div className="text-center">
                    <p
                      className="text-white/40 uppercase tracking-[0.2em] mb-1"
                      style={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Cases
                    </p>
                    <p
                      className="text-white font-bold"
                      style={{
                        fontSize: 48,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {stats.cases}
                    </p>
                  </div>
                )}
                {stats.totalOwed && (
                  <div className="text-center">
                    <p
                      className="text-white/40 uppercase tracking-[0.2em] mb-1"
                      style={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Total Unpaid
                    </p>
                    <p
                      className="text-white font-bold"
                      style={{
                        fontSize: 48,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      ${stats.totalOwed}
                    </p>
                  </div>
                )}
                {stats.amount && (
                  <div className="text-center">
                    <p
                      className="text-white/40 uppercase tracking-[0.2em] mb-1"
                      style={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Amount Owed
                    </p>
                    <p
                      className="text-white font-bold"
                      style={{
                        fontSize: 48,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {stats.amount}
                    </p>
                  </div>
                )}
                {stats.country && (
                  <div className="text-center">
                    <p
                      className="text-white/40 uppercase tracking-[0.2em] mb-1"
                      style={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Country
                    </p>
                    <p
                      className="text-white font-bold"
                      style={{
                        fontSize: 32,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {stats.country}
                    </p>
                  </div>
                )}
                {stats.date && (
                  <div className="text-center">
                    <p
                      className="text-white/40 uppercase tracking-[0.2em] mb-1"
                      style={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Date
                    </p>
                    <p
                      className="text-white font-bold"
                      style={{
                        fontSize: 28,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {stats.date}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Company name */}
            {companyName && (
              <p
                className="text-white/50 uppercase tracking-[0.15em] mt-2"
                style={{
                  fontSize: 18,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
              >
                {companyName}
              </p>
            )}
          </div>

          {/* Bottom: QR + CTA */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center mb-8">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: 180, height: 180 }}
                className="mb-6"
              />
            )}
            <p
              className="text-white/40 uppercase tracking-[0.2em] text-center"
              style={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Scan to view on Sindicato
            </p>
            <p
              className="text-white/30 uppercase tracking-[0.15em] text-center mt-2"
              style={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
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
              background: "linear-gradient(90deg, #c41e3a, #6b0f1a, #c41e3a)",
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
