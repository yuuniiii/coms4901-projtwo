'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Page() {

  const login = async () => {
    alert("clicked")

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button onClick={login}>
        Sign in with Google
      </button>
    </div>
  )
}