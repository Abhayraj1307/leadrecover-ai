# LeadRecover AI | Service Lead Recovery

A Next.js MVP that turns completed HVAC service calls into leads and tracks follow-ups.

## Run the seeded demo

~~~bash
npm ci
npm run dev
~~~

Open http://localhost:3000, review booking status, and open a lead to add a note or update its status. The demo uses seeded records and mocked follow-up delivery.

- [Dashboard](app/dashboard/): calls, lead status, and follow-up queue.
- [Validation](lib/validation.ts): incoming call data.
- [Database schema](supabase/migrations/202608190001_initial_schema.sql): tenant-aware data model.
- [Deployment notes](docs/local-and-supabase.md): local and optional Supabase setup.

This is a workflow demo; no measured conversion, recovery rate, or revenue impact is claimed.
