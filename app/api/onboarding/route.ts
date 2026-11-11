import { NextRequest, NextResponse } from "next/server";
import { updateDemoBusiness } from "@/lib/demo-store";
import { createSupabaseAdminClient, createSupabaseServerClient, hasSupabase } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const input = onboardingSchema.parse(await request.json());
    if (!hasSupabase) return NextResponse.json({ business: updateDemoBusiness({ ...input, emergency_phone: input.emergency_phone || null, emergency_rules: input.emergency_rules || null }) });
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = createSupabaseAdminClient();
    const { data: business, error } = await db.from("businesses").insert({ ...input, emergency_phone: input.emergency_phone || null, emergency_rules: input.emergency_rules || null }).select().single();
    if (error || !business) throw error ?? new Error("Unable to create business");
    const { error: memberError } = await db.from("business_members").insert({ business_id: business.id, user_id: user.id, role: "owner" });
    if (memberError) { await db.from("businesses").delete().eq("id", business.id); throw memberError; }
    return NextResponse.json({ business }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid onboarding details" }, { status: 400 });
  }
}
