// src/pages/OnboardingPage.tsx
// Writes real profile row to Supabase on first login

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const BRANCHES = ['CSE', 'IT', 'ECE', 'ME', 'CE']

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  )
  const [year, setYear]     = useState<1 | 2>(2)
  const [branch, setBranch] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!branch) { setError('Please select your branch.'); return }
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    if (!user) { navigate('/login'); return }

    setSaving(true)
    setError(null)

    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        avatar_url: user.user_metadata?.avatar_url ?? null,
        year,
        branch,
        roll_number: rollNo.trim() || null,
      })

    if (upsertErr) {
      setError(upsertErr.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    navigate(`/year/${year}`)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fbf8ff 0%, #ededf9 100%)', padding: 'var(--sp-6)' }}>
      <div className="glass-card animate-fadeInUp" style={{ padding: 'var(--sp-10)', width: '100%', maxWidth: 480 }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 'var(--sp-2)' }}>Welcome to Exam League! 🎓</h1>
        <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-8)' }}>
          Tell us a bit about yourself to personalise your feed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

          <div>
            <label>Full Name</label>
            <input
              className="input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label>Year</label>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 6 }}>
              {([1, 2] as const).map(y => (
                <button key={y} onClick={() => setYear(y)} style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: year === y ? 'var(--primary)' : 'var(--outline-variant)', background: year === y ? 'var(--primary-light)' : 'var(--surface-low)', fontWeight: 700, cursor: 'pointer', color: year === y ? 'var(--primary)' : 'var(--on-surface-muted)', transition: 'all 0.15s' }}>
                  {y === 1 ? '1st Year' : '2nd Year'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Branch</label>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginTop: 6 }}>
              {BRANCHES.map(b => (
                <button key={b} onClick={() => setBranch(b)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '2px solid', borderColor: branch === b ? 'var(--primary)' : 'var(--outline-variant)', background: branch === b ? 'var(--primary)' : 'transparent', color: branch === b ? 'white' : 'var(--on-surface-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontSize: 13 }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Roll Number <span style={{ fontWeight: 400, color: 'var(--outline)' }}>(optional)</span></label>
            <input
              className="input"
              value={rollNo}
              onChange={e => setRollNo(e.target.value)}
              placeholder="e.g. 221CS043"
              style={{ marginTop: 6 }}
            />
          </div>

          {error && (
            <div style={{ background: '#ffdad6', color: 'var(--danger)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 14 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Enter the League ⚡'}
          </button>
        </div>
      </div>
    </div>
  )
}
