import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();   // ← FIX HERE

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", data.user.id)
        .single();

      if (profile?.is_superadmin) {
        return NextResponse.redirect(new URL("/admin", origin));
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/auth-code-error", origin));
}