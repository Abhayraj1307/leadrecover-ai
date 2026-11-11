import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const destination = next?.startsWith("/") ? next : "/dashboard";
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  if (!code || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return response;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => items.forEach((item) => response.cookies.set(item.name, item.value, item.options as never)),
    },
  });
  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
