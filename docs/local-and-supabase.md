# LeadRecover AI

LeadRecover AI is a focused MVP for small HVAC companies. It receives completed AI voice calls, creates tenant-isolated leads, queues recovery follow-ups for unbooked callers, and gives owners a fast dashboard for following up.

## What is included

- Multi-tenant Supabase schema with Row Level Security.
- Business onboarding, dashboard metrics, lead details, lead status changes, internal notes, calls, and transcripts.
- Secure completed-call webhook with Zod validation, duplicate-event protection, and safe error logging.
- Mock Twilio-compatible SMS boundary and queued recovery follow-ups.
- Demo mode with a seeded HVAC business, leads, calls, and transcripts. No provider credentials are required to evaluate the MVP.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no Supabase variables configured, the app uses its built-in demo business automatically. It is safe for product walkthroughs; data resets when the development server restarts.

## Commands

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

`npm run seed` confirms that the built-in demo data is available. Production data is stored in Supabase, not through the local demo seed command.

## Environment variables

Copy `.env.example` to `.env.local` for a Supabase-backed environment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Public browser key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production webhook/onboarding | Server-only key. Never expose it to the browser. |
| `VOICE_WEBHOOK_SECRET` | Production webhook | Shared secret sent as `x-leadrecover-webhook-secret`. |
| `VOICE_PROVIDER` | Optional | Provider adapter selection (`generic` by default). |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Future SMS | Reserved for a Twilio-compatible provider; V1 stays mocked. |

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/202608190001_initial_schema.sql`](supabase/migrations/202608190001_initial_schema.sql).
3. Add the URL, anon key, and service-role key to `.env.local` and to Vercel project environment variables.
4. In Supabase Auth, enable email magic links and add `http://localhost:3000/auth/callback` plus your Vercel URL with `/auth/callback` to the redirect allow-list.
5. Start the app, use `/login`, and complete `/onboarding` after signing in.

The migration enforces tenant separation with `business_members` and RLS. Browser access is constrained to the owner’s business; service-role access is used only in trusted server routes.
