import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";
import { updateDemoLead } from "@/lib/demo-store";
import { createSupabaseServerClient, hasSupabase } from "@/lib/supabase/server";
import { leadUpdateSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const patch = leadUpdateSchema.parse(await request.json());
    if (!hasSupabase) {
      const lead = updateDemoLead(id, patch);
      return lead ? NextResponse.json({ lead }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const dashboard = await getDashboardData();
    if (!dashboard) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await createSupabaseServerClient();
    const { data, error } = await client.from("leads").update(patch).eq("id", id).eq("business_id", dashboard.business.id).select().maybeSingle();
    if (error) throw error;
    return data ? NextResponse.json({ lead: data }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
}
