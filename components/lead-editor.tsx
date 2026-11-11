"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/types";
import { leadStatusLabels } from "@/components/status-badge";

export function LeadEditor({ lead }: { lead: Lead }) {
  const router = useRouter(); const [status, setStatus] = useState<LeadStatus>(lead.status); const [notes, setNotes] = useState(lead.internal_notes ?? ""); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  async function save() { setSaving(true); setMessage(""); const response = await fetch(`/api/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, internal_notes: notes || null }) }); setSaving(false); if (response.ok) { setMessage("Saved"); router.refresh(); } else setMessage("Couldn’t save changes."); }
  return <div className="panel p-5"><h2 className="text-base font-semibold">Lead management</h2><div className="mt-4 grid gap-4"><label><span className="label">Status</span><select className="field" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>{Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="label">Internal notes</span><textarea className="field min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context for your team…" /></label><button className="btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button>{message && <p className="text-sm text-slate-600">{message}</p>}</div></div>;
}
