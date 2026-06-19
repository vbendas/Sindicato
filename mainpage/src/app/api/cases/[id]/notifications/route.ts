import { NextResponse } from "next/server";
import { subscribe, unsubscribe, getSubscribers } from "@/lib/notifications/subscriptions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subscribers = getSubscribers(id);
  return NextResponse.json({ ok: true, data: { count: subscribers.length } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const email = body?.email;
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }
  const added = subscribe(id, email);
  return NextResponse.json({ ok: true, data: { subscribed: added || true } });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const email = body?.email;
  if (typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }
  const removed = unsubscribe(id, email);
  return NextResponse.json({ ok: true, data: { unsubscribed: removed } });
}
