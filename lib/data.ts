import { getDemoDashboard } from "@/lib/demo-store";
import { createSupabaseServerClient, hasSupabase } from "@/lib/supabase/server";
import type { DashboardData } from "@/lib/types";

export async function getDashboardData(): Promise<DashboardData | null> {
  if (!hasSupabase) return getDemoDashboard();
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data: membership } = await client.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return null;
  const businessId = membership.business_id;
  const [{ data: business }, { data: leads }, { data: calls }, { data: followups }] = await Promise.all([
    client.from("businesses").select("*").eq("id", businessId).single(),
    client.from("leads").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    client.from("calls").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    client.from("followups").select("*").order("scheduled_at", { ascending: false }),
  ]);
  if (!business) return null;
  return { business: business as DashboardData["business"], leads: (leads ?? []) as DashboardData["leads"], calls: (calls ?? []) as DashboardData["calls"], followups: (followups ?? []) as DashboardData["followups"] };
}
