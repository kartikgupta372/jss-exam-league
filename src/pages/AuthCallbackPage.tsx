// src/pages/AuthCallbackPage.tsx
// Handles the redirect after Google OAuth

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handle = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/login')
        return
      }

      // Check if profile exists and is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, year, branch')
        .eq('id', session.user.id)
        .single()

      // If no year/branch, send to onboarding
      if (!profile?.year || !profile?.branch) {
        navigate('/onboarding')
        return
      }

      // Otherwise go to returnTo or home
      const params = new URLSearchParams(window.location.search)
      const returnTo = params.get('returnTo') || '/'
      navigate(returnTo)
    }

    handle()
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.03, marginBottom: 'var(--sp-4)' }}>
          Exam<span style={{ color: 'var(--primary)' }}>League</span>
        </div>
        <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-4)' }}>Signing you in…</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s infinite', animationDelay: `${i * 0.2}s` }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
