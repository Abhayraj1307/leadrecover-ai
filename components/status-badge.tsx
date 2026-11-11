import clsx from "clsx";
import type { LeadStatus } from "@/lib/types";

const labels: Record<LeadStatus, string> = { new: "New", callback_needed: "Callback Needed", booked: "Booked", won: "Won", lost: "Lost" };
const colors: Record<LeadStatus, string> = { new: "bg-blue-50 text-blue-700 ring-blue-600/20", callback_needed: "bg-amber-50 text-amber-800 ring-amber-600/20", booked: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", won: "bg-violet-50 text-violet-700 ring-violet-600/20", lost: "bg-slate-100 text-slate-600 ring-slate-500/20" };
export function StatusBadge({ status }: { status: LeadStatus }) { return <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", colors[status])}>{labels[status]}</span>; }
export { labels as leadStatusLabels };
