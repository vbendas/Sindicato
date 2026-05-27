import { NextResponse } from "next/server";
import { translateStory } from "@/lib/ai/translate";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/utils/api";
import { locales } from "@/lib/i18n/config";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`translate:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { text, targetLang } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { ok: false, error: "Text is required" },
        { status: 400 }
      );
    }

    if (!targetLang || !locales.includes(targetLang)) {
      return NextResponse.json(
        { ok: false, error: "Invalid target language" },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Text too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const translated = await translateStory(text, "auto", targetLang);

    return NextResponse.json({
      ok: true,
      data: { translated },
    });
  } catch (err) {
    console.error("Translation API error:", err);
    return NextResponse.json(
      { ok: false, error: "Translation failed" },
      { status: 500 }
    );
  }
}
