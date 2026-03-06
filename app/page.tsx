"use client"

import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  })
}

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  )
}