"use client"

import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback"
      }
    })
  }

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  )
}