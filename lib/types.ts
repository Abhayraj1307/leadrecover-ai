export const leadStatuses = ["new", "callback_needed", "booked", "won", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  business_id: string;
  caller_name: string | null;
  caller_phone: string | null;
  address: string | null;
  zip_code: string | null;
  customer_type: "new" | "existing" | "unknown";
  service_type: string | null;
  issue_description: string | null;
  urgency: "low" | "normal" | "high" | "emergency" | "unknown";
  status: LeadStatus;
  preferred_time: string | null;
  source: string;
  internal_notes: string | null;
  created_at: string;
};

export type Call = {
  id: string;
  business_id: string;
  lead_id: string | null;
  provider_call_id: string;
  caller_phone: string | null;
  transcript: string | null;
  summary: string | null;
  duration: number | null;
  outcome: string | null;
  call_started_at: string | null;
  call_ended_at: string | null;
  created_at: string;
};

export type Followup = {
  id: string;
  lead_id: string;
  type: "sms" | "callback";
  status: "pending" | "queued" | "sent" | "completed" | "cancelled" | "failed";
  scheduled_at: string;
  completed_at: string | null;
  message: string | null;
};

export type Business = {
  id: string;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string | null;
  timezone: string;
  business_hours: Record<string, string>;
  emergency_phone: string | null;
  service_area: string[];
  services_offered: string[];
  emergency_rules: string | null;
  callback_number: string | null;
  created_at: string;
};

export type DashboardData = { business: Business; leads: Lead[]; calls: Call[]; followups: Followup[] };
