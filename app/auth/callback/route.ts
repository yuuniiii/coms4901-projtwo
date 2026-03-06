import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseServer"

export async function GET(request: Request) {

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", data.user.id)
    .single()

  if (profile?.is_superadmin) {
    return NextResponse.redirect(`${origin}/admin`)
  }

  return NextResponse.redirect(origin)
}