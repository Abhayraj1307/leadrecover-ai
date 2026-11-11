from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "leadrecover-ai-project-status-report.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleClean", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=colors.HexColor("#0F172A"), spaceAfter=8))
styles.add(ParagraphStyle(name="Subtle", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=colors.HexColor("#64748B")))
styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=colors.HexColor("#0F4C6E"), spaceBefore=14, spaceAfter=7))
styles.add(ParagraphStyle(name="BodyClean", parent=styles["BodyText"], fontName="Helvetica", fontSize=10, leading=15, textColor=colors.HexColor("#334155"), spaceAfter=5))
styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#475569")))
styles.add(ParagraphStyle(name="TableHeader", parent=styles["Small"], textColor=colors.white, fontName="Helvetica-Bold"))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#E2E8F0")); canvas.line(doc.leftMargin, 0.55*inch, letter[0]-doc.rightMargin, 0.55*inch)
    canvas.setFillColor(colors.HexColor("#64748B")); canvas.setFont("Helvetica", 8)
    canvas.drawString(doc.leftMargin, 0.35*inch, "LeadRecover AI | Project status report")
    canvas.drawRightString(letter[0]-doc.rightMargin, 0.35*inch, f"Page {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=0.7*inch, leftMargin=0.7*inch, topMargin=0.65*inch, bottomMargin=0.75*inch)
story = []
story += [Paragraph("LeadRecover AI", styles["TitleClean"]), Paragraph("MVP project status report", styles["Subtle"]), Spacer(1, 0.14*inch)]

summary = Table([[Paragraph("Overall implementation status", styles["Small"]), Paragraph("Core MVP implemented; final handoff verification and README remain", styles["Small"])], [Paragraph("Product goal", styles["Small"]), Paragraph("Convert missed and after-hours HVAC calls into actionable leads, bookings, and follow-up requests", styles["Small"])], [Paragraph("Current delivery posture", styles["Small"]), Paragraph("Demo-ready application with a production-oriented Supabase and provider integration foundation", styles["Small"])]], colWidths=[1.7*inch, 4.85*inch])
summary.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")), ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9), ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8), ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#EAF6FC"))]))
story += [summary, Spacer(1, 0.1*inch)]

story += [Paragraph("Executive summary", styles["Section"]), Paragraph("LeadRecover AI has been built as a focused SaaS MVP for small HVAC businesses. The application captures normalized completed-call data, creates tenant-scoped leads, queues recovery follow-ups for unbooked callers, and presents the outcome in a clear owner dashboard. The scope intentionally excludes a full CRM, calendar synchronization, live SMS delivery, billing, and provider-specific production adapters.", styles["BodyClean"])]

story += [Paragraph("Completed deliverables", styles["Section"])]
completed = [
    ["Application foundation", "Next.js App Router, TypeScript, Tailwind styling, production-compatible project configuration, and environment templates."],
    ["Architecture and planning", "Architecture document, explicit assumptions, and an implementation checklist created before development."],
    ["Multi-tenant data model", "Supabase migration for businesses, business members, leads, calls, and follow-ups, with foreign keys, indexes, enums, and row-level security policies."],
    ["Secure call ingestion", "Validated completed-call webhook with normalized fields, request secret verification, safe error logging, duration calculation, and duplicate-event protection using provider call IDs."],
    ["Dashboard experience", "Responsive overview metrics, recent leads, recovery queue, leads table, calls table, full transcript access, and lead detail views."],
    ["Lead operations", "Business users can update lead status (New, Callback Needed, Booked, Won, Lost) and add internal notes."],
    ["Recovery architecture", "Follow-up persistence plus a server-only SMS provider boundary; V1 uses a mock provider and shows queued messages safely in the UI."],
    ["Demo path", "A representative HVAC business, leads, calls, transcripts, and queued SMS follow-ups are available without connecting Supabase, Retell/Vapi, Twilio, or Stripe."],
]
table = Table([[Paragraph("Area", styles["TableHeader"]), Paragraph("Delivered", styles["TableHeader"])] ] + [[Paragraph(a, styles["Small"]), Paragraph(b, styles["Small"])] for a,b in completed], colWidths=[1.5*inch, 5.05*inch], repeatRows=1)
table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0F4C6E")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#CBD5E1")), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])]))
story += [table, PageBreak()]

story += [Paragraph("Quality and security posture", styles["Section"]), Paragraph("The application separates browser-facing access from server-only admin access. Tenant access is designed around a business membership model, and RLS prevents businesses from reading each other’s leads, calls, and transcripts. The webhook validates every incoming field with Zod, keeps secrets in environment variables, requires a secret outside demo mode, and avoids logging sensitive caller data or transcripts.", styles["BodyClean"])]
quality = Table([[Paragraph("Verification", styles["TableHeader"]), Paragraph("Result", styles["TableHeader"])], [Paragraph("TypeScript", styles["Small"]), Paragraph("Passed: <font name='Helvetica-Bold'>npm run typecheck</font>", styles["Small"])], [Paragraph("Unit tests", styles["Small"]), Paragraph("Passed: call payload validation and normalization tests", styles["Small"])], [Paragraph("Lint", styles["Small"]), Paragraph("Passed: no ESLint warnings or errors", styles["Small"])], [Paragraph("Production build", styles["Small"]), Paragraph("Passed: Next.js production build completed successfully", styles["Small"])], [Paragraph("Outstanding verification", styles["Small"]), Paragraph("Re-run the suite after final documentation/configuration additions and perform a live local webhook smoke test.", styles["Small"])]] , colWidths=[1.7*inch, 4.85*inch])
quality.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0F4C6E")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#CBD5E1")), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 8), ("RIGHTPADDING", (0,0), (-1,-1), 8), ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])]))
story += [quality]

story += [Paragraph("Remaining tasks before final handoff", styles["Section"])]
remaining = [
    "Create the repository README with local setup, environment variables, Supabase migration instructions, demo mode guidance, webhook example, and Retell/Vapi connection guidance.",
    "Start the local application and post a fake completed-call payload to confirm that a new call, lead, and queued mock follow-up appear in the dashboard.",
    "Re-run type checking, unit tests, linting, and production build after the final files are added.",
    "For production: provision Supabase, apply the migration, configure magic-link redirect URLs, set Vercel environment variables, and configure the voice provider’s webhook secret.",
    "Optional post-MVP: implement a Retell or Vapi signature adapter, add a Twilio-compatible provider, and connect booking/calendar availability. Stripe scaffolding is deliberately deferred.",
]
for i, item in enumerate(remaining, 1): story.append(Paragraph(f"<b>{i}.</b> {item}", styles["BodyClean"]))

story += [Paragraph("Recommended acceptance test", styles["Section"]), Paragraph("Open the demo dashboard, complete or revise onboarding, POST the documented sample call to <font name='Helvetica-Bold'>/api/webhooks/voice</font>, confirm the newly created lead and call are visible, open the lead’s transcript, change its status, and confirm a queued SMS follow-up is shown when the lead is not booked. This directly maps to the agreed MVP success criteria.", styles["BodyClean"]), Spacer(1, 0.08*inch), Paragraph("Prepared for product handoff. This report reflects the current implementation state and explicitly separates completed application work from final verification and deployment setup.", styles["Subtle"])]

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
