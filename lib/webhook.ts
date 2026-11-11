import { timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient, hasSupabase } from "@/lib/supabase/server";
import { ingestDemoCall, recoveryMessage, validDemoBusiness } from "@/lib/demo-store";
import type { CompletedCallInput } from "@/lib/validation";
import { normalizeCompletedCall } from "@/lib/validation";
import type { Lead } from "@/lib/types";

export function isWebhookAuthorized(provided: string | null) {
  const expected = process.env.VOICE_WEBHOOK_SECRET;
  if (!expected) return !hasSupabase; // local demo only; production must supply a secret.
  if (!provided) return false;
  const a = Buffer.from(provided); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function ingestCompletedCall(input: CompletedCallInput) {
  if (!hasSupabase) {
    if (!validDemoBusiness(input.business_id)) throw new Error("Unknown business");
    return ingestDemoCall(input);
  }
  const db = createSupabaseAdminClient();
  const normalized = normalizeCompletedCall(input);
  const { data: business, error: businessError } = await db.from("businesses").select("id, company_name").eq("id", input.business_id).maybeSingle();
  if (businessError || !business) throw new Error("Unknown business");

  const { data: existing, error: existingError } = await db.from("calls").select("id, lead_id").eq("business_id", input.business_id).eq("provider_call_id", input.call_id).maybeSingle();
  if (existingError) throw new Error("Unable to check call idempotency");
  if (existing) return { call: existing, lead: null, duplicate: true };

  const leadRow = { business_id: input.business_id, caller_name: input.caller_name, caller_phone: input.caller_phone, address: input.address, zip_code: input.zip_code, customer_type: input.customer_type, service_type: input.service_type, issue_description: input.issue_description, urgency: input.urgency, status: normalized.status, preferred_time: input.preferred_time, source: "voice_call" };
  const { data: lead, error: leadError } = await db.from("leads").insert(leadRow).select().single();
  if (leadError || !lead) throw new Error("Unable to create lead");
  const { data: call, error: callError } = await db.from("calls").insert({ business_id: input.business_id, lead_id: lead.id, provider_call_id: input.call_id, caller_phone: input.caller_phone, transcript: input.transcript, summary: input.call_summary, duration: normalized.duration, outcome: input.booking_status, call_started_at: input.call_started_at, call_ended_at: input.call_ended_at }).select().single();
  if (callError) { await db.from("leads").delete().eq("id", lead.id); throw new Error("Unable to create call"); }

  if (input.caller_phone && normalized.status !== "booked") {
    const typedLead = lead as Lead;
    await db.from("followups").insert({ lead_id: lead.id, type: "sms", status: "queued", scheduled_at: new Date().toISOString(), message: recoveryMessage(business.company_name, typedLead) });
  }
  return { call, lead, duplicate: false };
}
