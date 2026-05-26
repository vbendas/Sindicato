import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendTemplateEmail } from "@/lib/email/send";
import ContactNotification from "@/lib/email/templates/contact-notification";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.RESEND_SANDBOX_RECIPIENT || "admin@sindicato.report";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfterMs } = await rateLimit(`contact_${ip}`, 3, 60 * 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        { error: `Too many submissions. Try again in ${Math.ceil(retryAfterMs / 60000)} minutes.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name")?.toString()?.trim();
    const email = formData.get("email")?.toString()?.trim();
    const category = formData.get("category")?.toString()?.trim();
    const caseRef = formData.get("caseRef")?.toString()?.trim() || "";
    const message = formData.get("message")?.toString()?.trim();
    const file = formData.get("file") as File | null;

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: "Name, email, category, and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: PDF, DOC, DOCX, PNG, JPG." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size: 5MB." },
          { status: 400 }
        );
      }
    }

    await sendTemplateEmail(
      ADMIN_EMAIL,
      `[Contact] ${category}: ${name} — Sindicato`,
      ContactNotification,
      {
        name,
        email,
        category,
        caseRef,
        message,
        hasAttachment: !!(file && file.size > 0),
        submittedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Message sent successfully. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
