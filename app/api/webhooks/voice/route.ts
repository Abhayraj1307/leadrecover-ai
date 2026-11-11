import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { isWebhookAuthorized, ingestCompletedCall } from "@/lib/webhook";
import { completedCallSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  if (!isWebhookAuthorized(request.headers.get("x-leadrecover-webhook-secret"))) {
    return NextResponse.json({ error: "Unauthorized", request_id: requestId }, { status: 401 });
  }
  try {
    const payload: unknown = await request.json();
    const input = completedCallSchema.parse(payload);
    const result = await ingestCompletedCall(input);
    return NextResponse.json({ accepted: true, duplicate: result.duplicate, call_id: result.call.id, lead_id: result.lead?.id ?? null }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid payload", request_id: requestId }, { status: 400 });
    // Never include caller fields, transcripts, or provider payloads in logs.
    console.error("voice_webhook_failed", { requestId, reason: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Unable to process event", request_id: requestId }, { status: 500 });
  }
}
