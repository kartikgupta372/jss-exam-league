// src/pages/admin/AdminUsersPage.tsx — real users from Supabase
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Shield, ShieldOff, AlertTriangle, LayoutDashboard, Users, BarChart2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface UserRow {
  id: string; full_name: string; avatar_url: string | null
  year: number | null; branch: string | null
  karma_points: number; quiz_points: number
  warnings_count: number; role: string; created_at: string
}

const ADMIN_NAV = [
  { to: '/admin/queue', label: 'Queue', icon: <LayoutDashboard size={14} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={14} /> },
  { to: '/admin/stats', label: 'Stats', icon: <BarChart2 size={14} /> },
]

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers]     = useState<UserRow[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ user: UserRow; action: 'warn' | 'block' | 'unblock' } | null>(null)
  const [reason, setReason]   = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('karma_points', { ascending: false })
    setUsers((data as UserRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const doAction = async () => {
    if (!confirm || !me) return
    const { user: target, action } = confirm

    await supabase.from('moderation_log').insert({
      target_user_id: target.id,
      action,
      reason: reason || null,
      moderator_id: me.id,
    })

    showToast(action === 'warn' ? `⚠️ Warning sent to ${target.full_name}` : action === 'block' ? `🚫 ${target.full_name} blocked` : `✅ ${target.full_name} unblocked`)
    setConfirm(null); setReason('')
    await load()
  }

  return (
    <div>
      <div style={{ background: 'var(--on-surface)', color: 'white', padding: 'var(--sp-3) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Admin Panel</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {ADMIN_NAV.map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontSize: 13, fontWeight: 600, background: l.to === '/admin/users' ? 'rgba(255,255,255,0.15)' : 'transparent', color: l.to === '/admin/users' ? 'white' : 'rgba(255,255,255,0.6)' }}>
                {l.icon}{l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>User Moderation</h1>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: 14 }}>
              {users.length} users · {users.filter(u => u.role === 'blocked').length} blocked
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input className="input" style={{ paddingLeft: 36, width: 260 }} placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-mid)', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {['User', 'Year / Branch', 'Karma', 'Quiz Pts', 'Warnings', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{ padding: 'var(--sp-3) var(--sp-4)', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const initials = u.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--outline-variant)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-low)' }}>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7b8fff)', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name}</div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 13, color: 'var(--on-surface-muted)' }}>
                        {u.year ? `${u.year === 1 ? '1st' : '2nd'} Year` : '—'} {u.branch ? `· ${u.branch}` : ''}
                      </td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{u.karma_points}</td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.quiz_points.toLocaleString()}</td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
                        <span className={`badge ${u.warnings_count === 0 ? 'badge-lime' : u.warnings_count >= 3 ? 'badge-red' : 'badge-amber'}`}>{u.warnings_count}/3</span>
                      </td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'blocked' ? 'badge-red' : 'badge-lime'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
                        {u.role !== 'admin' && u.id !== me?.id && (
                          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                            {u.role !== 'blocked' && (
                              <>
                                <button className="btn btn-sm" onClick={() => setConfirm({ user: u, action: 'warn' })}
                                  style={{ background: '#fff3cd', color: '#7a5000', border: 'none', padding: '5px 10px', fontSize: 12 }}>
                                  <AlertTriangle size={12} /> Warn
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => setConfirm({ user: u, action: 'block' })}
                                  style={{ padding: '5px 10px', fontSize: 12 }}>
                                  <ShieldOff size={12} /> Block
                                </button>
                              </>
                            )}
                            {u.role === 'blocked' && (
                              <button className="btn btn-sm" onClick={() => setConfirm({ user: u, action: 'unblock' })}
                                style={{ background: '#dcffe8', color: '#1a7a3c', border: 'none', padding: '5px 10px', fontSize: 12 }}>
                                <Shield size={12} /> Unblock
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(25,27,36,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--sp-8)', maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontSize: 18, marginBottom: 'var(--sp-2)' }}>
              {confirm.action === 'warn' ? '⚠️ Send Warning' : confirm.action === 'block' ? '🚫 Block User' : '✅ Unblock User'}
            </h3>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: 14, marginBottom: 'var(--sp-5)' }}>
              {confirm.action === 'warn' ? `Send a warning to ${confirm.user.full_name}. 3 warnings = auto-block.` : confirm.action === 'block' ? `${confirm.user.full_name} loses all posting rights immediately.` : `Restore ${confirm.user.full_name}'s access and reset warnings to 0.`}
            </p>
            {confirm.action === 'warn' && (
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <label>Reason</label>
                <select className="input" value={reason} onChange={e => setReason(e.target.value)} style={{ marginTop: 6 }}>
                  <option value="">Select reason…</option>
                  <option>Spam</option><option>Off-topic content</option>
                  <option>Inappropriate language</option><option>Harassment</option><option>Other</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className={`btn ${confirm.action === 'unblock' ? 'btn-primary' : 'btn-danger'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={doAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
