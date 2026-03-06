'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Page() {

  async function login() {
    console.log("clicked")

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={login}
        className="px-6 py-3 bg-black text-white rounded"
      >
        Sign in with Google
      </button>
    </main>
  )
}