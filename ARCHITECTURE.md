# LeadRecover AI — MVP architecture

## Purpose

LeadRecover AI is a multi-tenant SaaS for HVAC companies that turns completed AI phone calls into actionable leads, calls, and optional recovery follow-ups. It intentionally stops short of CRM features, scheduling integrations, and billing.

## Application shape

- **Next.js App Router + TypeScript** renders the authenticated owner dashboard, onboarding, lead detail, and calls views.
- **Supabase Auth** identifies the signed-in business owner. A `business_members` table maps users to businesses.
- **Postgres + Row Level Security** holds tenant-scoped operational data. Browser queries use the authenticated Supabase client; webhook ingestion uses the service role only after authenticating the provider request.
- **Webhook adapter** accepts a provider-neutral completed-call payload, verifies a shared secret or provider signature, validates and normalizes the event, writes one `calls` row and one upserted `leads` row, then schedules a recovery follow-up when appropriate.
- **SMS provider boundary** exposes a small `SmsProvider` interface. V1 uses a safe mock provider that marks follow-ups as queued without sending a message. A Twilio-compatible adapter can be added using server-only environment variables.

## Tenant isolation

Each business-owned row has a `business_id`. RLS derives permitted businesses from `business_members` and applies it to `businesses`, `leads`, `calls`, and `followups`. Users can only read or update their own business data. The service role is restricted to trusted server routes.

## Webhook flow

1. Voice provider posts a completed-call event with `x-leadrecover-webhook-secret` (or a provider adapter verifies its signature).
2. The route validates the payload with Zod, resolves the business from a stable external `business_id`, and normalizes fields.
3. An idempotency key (`provider_call_id`) is inserted into `calls`; duplicate events return success without creating another lead.
4. The route creates a lead for actionable calls, links the call to it, and adds a recovery follow-up for unbooked leads.
5. Sensitive data is never emitted to logs; errors receive a request ID only.

## Assumptions

- A hosted Supabase project will be provisioned by the deployer; SQL migrations are included but cannot create the project itself.
- One user may belong to more than one business, though onboarding creates the first business for a new user.
- The voice provider sends a completed-call payload after the conversation. Retell/Vapi-specific signature parsing is isolated for later configuration.
- Estimated recovered revenue is a configurable dashboard constant for the MVP ($350 per booked or won lead); it is not invoicing or revenue recognition.
- Demo mode is enabled only when Supabase environment variables are absent, or via the seed script. Production always uses Supabase.
