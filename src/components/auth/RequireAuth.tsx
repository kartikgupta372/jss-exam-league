// src/components/auth/RequireAuth.tsx
// Redirect to /login if not authenticated

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthSplash />
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

// src/components/auth/RequireAdmin.tsx
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthSplash />
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  if (!isAdmin) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)', textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2>Admin Access Only</h2>
      <p style={{ color: 'var(--on-surface-muted)' }}>You need admin privileges to view this page.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  )
  return <>{children}</>
}

function AuthSplash() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.03, marginBottom: 'var(--sp-4)' }}>
          Exam<span style={{ color: 'var(--primary)' }}>League</span>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s infinite', animationDelay: `${i*0.2}s` }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
