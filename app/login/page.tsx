'use client'

import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-zinc-200 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          Admin Login
        </h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}