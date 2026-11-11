import { z } from "zod";

const text = (max: number) => z.string().trim().max(max).optional().nullable();

export const completedCallSchema = z.object({
  business_id: z.string().uuid(),
  call_id: z.string().trim().min(1).max(200),
  caller_name: text(160),
  caller_phone: text(40),
  address: text(300),
  zip_code: z.string().trim().regex(/^[A-Za-z0-9 -]{3,12}$/).optional().nullable(),
  customer_type: z.enum(["new", "existing", "unknown"]).default("unknown"),
  service_type: text(100),
  issue_description: text(2000),
  urgency: z.enum(["low", "normal", "high", "emergency", "unknown"]).default("unknown"),
  preferred_time: text(300),
  booking_status: z.enum(["booked", "callback_needed", "not_booked", "unknown"]).default("unknown"),
  transcript: text(30000),
  call_summary: text(3000),
  call_started_at: z.string().datetime().optional().nullable(),
  call_ended_at: z.string().datetime().optional().nullable(),
});

export type CompletedCallInput = z.infer<typeof completedCallSchema>;

export const onboardingSchema = z.object({
  company_name: z.string().trim().min(2).max(160),
  owner_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(40),
  callback_number: z.string().trim().min(7).max(40),
  timezone: z.string().trim().min(2).max(80),
  services_offered: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
  service_area: z.array(z.string().trim().regex(/^[A-Za-z0-9 -]{3,12}$/)).min(1).max(100),
  business_hours: z.record(z.string().max(60)).default({}),
  emergency_phone: z.string().trim().max(40).optional().or(z.literal("")),
  emergency_rules: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const leadUpdateSchema = z.object({
  status: z.enum(["new", "callback_needed", "booked", "won", "lost"]).optional(),
  internal_notes: z.string().trim().max(5000).nullable().optional(),
}).refine((value) => value.status !== undefined || value.internal_notes !== undefined, "No changes supplied");

export function normalizeCompletedCall(input: CompletedCallInput) {
  const bookingToStatus = {
    booked: "booked",
    callback_needed: "callback_needed",
    not_booked: "new",
    unknown: "new",
  } as const;
  const duration = input.call_started_at && input.call_ended_at
    ? Math.max(0, Math.floor((Date.parse(input.call_ended_at) - Date.parse(input.call_started_at)) / 1000))
    : null;
  return { ...input, status: bookingToStatus[input.booking_status], duration };
}
