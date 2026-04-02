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
    <div className="min-h-screen flex items-center justify-center bg-[#111434] text-white">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-[#0c0e2a] shadow-lg border border-white/10">
        
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin-Only Login
        </h1>

        <p className="text-sm text-white/60 text-center max-w-xs">
          Sign in with your Google account to access the admin dashboard
        </p>

        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 px-6 py-3 rounded-xl 
                     bg-white text-black font-medium
                     hover:bg-gray-200 transition-all duration-200
                     active:scale-95"
        >
          <span className="text-lg"></span>
          Sign in with Google
        </button>

      </div>
    </div>
  )
}