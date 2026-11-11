// Synthetic fixtures for demonstration. No real caller records.
import type { Business, Call, DashboardData, Followup, Lead } from "@/lib/types";
import type { CompletedCallInput } from "@/lib/validation";
import { normalizeCompletedCall } from "@/lib/validation";

export const DEMO_BUSINESS_ID = "11111111-1111-4111-8111-111111111111";

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();
const business: Business = {
  id: DEMO_BUSINESS_ID, company_name: "Example Service Company", owner_name: "Demo Owner", email: "demo@example.com",
  phone: "+12025550100", callback_number: "+12025550101", timezone: "America/Chicago",
  business_hours: { Mon: "8am–6pm", Tue: "8am–6pm", Wed: "8am–6pm", Thu: "8am–6pm", Fri: "8am–6pm" },
  emergency_phone: "+12025550102", service_area: ["78701", "78702", "78704", "78745"],
  services_offered: ["AC repair", "Heating", "Maintenance", "Installation"], emergency_rules: "Dispatch immediately for no cooling when temperature exceeds 90°F.", created_at: ago(720),
};
const leadId1 = "22222222-2222-4222-8222-222222222222";
const seedLeads: Lead[] = [
  { id: leadId1, business_id: DEMO_BUSINESS_ID, caller_name: "Demo Caller 1", caller_phone: "+12025550103", address: "Example Service Area", zip_code: "00000", customer_type: "new", service_type: "AC repair", issue_description: "Synthetic service request.", urgency: "high", status: "callback_needed", preferred_time: "Today after 4 PM", source: "voice_call", internal_notes: null, created_at: ago(2) },
  { id: "33333333-3333-4333-8333-333333333333", business_id: DEMO_BUSINESS_ID, caller_name: "Demo Caller 2", caller_phone: "+12025550103", address: null, zip_code: "00000", customer_type: "existing", service_type: "Maintenance", issue_description: "Synthetic service request.", urgency: "normal", status: "booked", preferred_time: "Friday morning", source: "voice_call", internal_notes: "Synthetic demonstration note.", created_at: ago(18) },
  { id: "44444444-4444-4444-8444-444444444444", business_id: DEMO_BUSINESS_ID, caller_name: "Demo Caller 3", caller_phone: "+12025550103", address: "Example Service Area", zip_code: "00000", customer_type: "new", service_type: "Heating", issue_description: "Synthetic service request.", urgency: "normal", status: "new", preferred_time: "Tomorrow, flexible", source: "voice_call", internal_notes: null, created_at: ago(30) },
];
const seedCalls: Call[] = [
  { id: "55555555-5555-4555-8555-555555555555", business_id: DEMO_BUSINESS_ID, lead_id: leadId1, provider_call_id: "demo-call-sarah", caller_phone: "+12025550103", transcript: "Synthetic demo call about a service appointment.", summary: "Synthetic service inquiry.", duration: 172, outcome: "Callback requested", call_started_at: ago(2.2), call_ended_at: ago(2.15), created_at: ago(2.15) },
  { id: "66666666-6666-4666-8666-666666666666", business_id: DEMO_BUSINESS_ID, lead_id: "33333333-3333-4333-8333-333333333333", provider_call_id: "demo-call-mike", caller_phone: "+12025550103", transcript: "Synthetic demo call about a service appointment.", summary: "Synthetic service inquiry.", duration: 96, outcome: "Booked", call_started_at: ago(18.1), call_ended_at: ago(18), created_at: ago(18) },
];
const seedFollowups: Followup[] = [
  { id: "77777777-7777-4777-8777-777777777777", lead_id: leadId1, type: "sms", status: "queued", scheduled_at: ago(1.9), completed_at: null, message: "Hi Sarah, this is Summit Comfort HVAC. You called us earlier about your AC. Would you like us to find an appointment time for you?" },
];

type DemoState = { business: Business; leads: Lead[]; calls: Call[]; followups: Followup[] };
const globalStore = globalThis as typeof globalThis & { __leadRecoverDemo?: DemoState };
function state(): DemoState { return (globalStore.__leadRecoverDemo ??= { business, leads: seedLeads, calls: seedCalls, followups: seedFollowups }); }
export function getDemoDashboard(): DashboardData { const s = state(); return { business: s.business, leads: [...s.leads], calls: [...s.calls], followups: [...s.followups] }; }
export function updateDemoBusiness(patch: Partial<Business>) { Object.assign(state().business, patch); return state().business; }
export function updateDemoLead(id: string, patch: Partial<Pick<Lead, "status" | "internal_notes">>) { const lead = state().leads.find((item) => item.id === id); if (!lead) return null; Object.assign(lead, patch); return lead; }
export function ingestDemoCall(input: CompletedCallInput) {
  const s = state();
  const duplicate = s.calls.find((call) => call.provider_call_id === input.call_id && call.business_id === input.business_id);
  if (duplicate) return { call: duplicate, lead: s.leads.find((lead) => lead.id === duplicate.lead_id) ?? null, duplicate: true };
  const normalized = normalizeCompletedCall(input);
  const lead: Lead = { id: crypto.randomUUID(), business_id: input.business_id, caller_name: input.caller_name ?? null, caller_phone: input.caller_phone ?? null, address: input.address ?? null, zip_code: input.zip_code ?? null, customer_type: input.customer_type, service_type: input.service_type ?? null, issue_description: input.issue_description ?? null, urgency: input.urgency, status: normalized.status, preferred_time: input.preferred_time ?? null, source: "voice_call", internal_notes: null, created_at: new Date().toISOString() };
  const call: Call = { id: crypto.randomUUID(), business_id: input.business_id, lead_id: lead.id, provider_call_id: input.call_id, caller_phone: input.caller_phone ?? null, transcript: input.transcript ?? null, summary: input.call_summary ?? null, duration: normalized.duration, outcome: input.booking_status, call_started_at: input.call_started_at ?? null, call_ended_at: input.call_ended_at ?? null, created_at: new Date().toISOString() };
  s.leads.unshift(lead); s.calls.unshift(call);
  if (lead.caller_phone && lead.status !== "booked") {
    s.followups.unshift({ id: crypto.randomUUID(), lead_id: lead.id, type: "sms", status: "queued", scheduled_at: new Date().toISOString(), completed_at: null, message: recoveryMessage(s.business.company_name, lead) });
  }
  return { call, lead, duplicate: false };
}
export function recoveryMessage(company: string, lead: Lead) { const first = lead.caller_name?.split(" ")[0] || "there"; const issue = lead.service_type || "your HVAC system"; return `Hi ${first}, this is ${company}. You called us earlier about ${issue}. Would you like us to find an appointment time for you?`; }
export function validDemoBusiness(id: string) { return id === DEMO_BUSINESS_ID; }
export function resetDemoData() { globalStore.__leadRecoverDemo = { business, leads: seedLeads, calls: seedCalls, followups: seedFollowups }; }
