// src/pages/ProfilePage.tsx — real Supabase data
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Trophy, BookOpen, Bell, Star, TrendingUp, Eye, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/context/AuthContext'

interface QuizHistory { id: string; percentage: number; created_at: string; quizzes: { title: string } | null }
interface BookmarkItem { id: string; material_id: string; created_at: string; materials: { title: string; type: string } | null }
interface Notif { id: string; title: string; body: string; read: boolean; created_at: string }

const BADGES = [
  { icon: '🚀', label: 'Early Adopter', desc: 'Joined during launch week' },
  { icon: '📤', label: 'Contributor',   desc: 'Uploaded approved material' },
  { icon: '⭐', label: 'Helpful',       desc: 'Had an answer accepted' },
]

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  return `${Math.floor(diff / 7)}w ago`
}

export default function ProfilePage() {
  const { handle } = useParams()
  const { user, profile: myProfile, signOut } = useAuth()
  const isOwn = !handle

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [quizHistory, setQHistory] = useState<QuizHistory[]>([])
  const [bookmarks, setBookmarks]  = useState<BookmarkItem[]>([])
  const [notifs, setNotifs]        = useState<Notif[]>([])
  const [tab, setTab]              = useState<'bookmarks' | 'history' | 'notifications'>('bookmarks')
  const [loading, setLoading]      = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const pid = isOwn ? user?.id : null

      if (!pid) { setLoading(false); return }

      const [
        { data: p },
        { data: attempts },
        { data: bks },
        { data: nots },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', pid).single(),
        supabase.from('quiz_attempts').select('id,percentage,created_at,quizzes(title)').eq('user_id', pid).order('created_at', { ascending: false }).limit(10),
        supabase.from('bookmarks').select('id,material_id,created_at,materials(title,type)').eq('user_id', pid).order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications').select('id,title,body,read,created_at').eq('user_id', pid).order('created_at', { ascending: false }).limit(20),
      ])

      setProfile(p as Profile)
      setQHistory((attempts as unknown as QuizHistory[]) ?? [])
      setBookmarks((bks as unknown as BookmarkItem[]) ?? [])
      setNotifs((nots as Notif[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user, handle, isOwn])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const displayProfile = isOwn ? myProfile : profile
  if (!displayProfile && !loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2>Sign in to view your profile</h2>
      <Link to="/login" className="btn btn-primary">Sign In</Link>
    </div>
  )

  const dp = displayProfile!
  const initials = dp?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div>
      {/* Profile header */}
      <section style={{ background: 'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock: 'var(--sp-10)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 'var(--sp-8)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7b8fff)', color: 'white', fontWeight: 800, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: 'var(--shadow-float)', overflow: 'hidden' }}>
                {dp?.avatar_url ? <img src={dp.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800 }}>{dp?.full_name}</h1>
                {dp?.role === 'admin' && <span className="badge badge-admin">Admin</span>}
              </div>
              <div style={{ fontSize: 14, color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-4)' }}>
                {dp?.year ? `${dp.year === 1 ? '1st' : '2nd'} Year` : ''} {dp?.branch ? `· ${dp.branch}` : ''} · JSS University Noida
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
                {[
                  { icon: <Star size={16} color="#f7dd7d" />,       label: 'Karma',     value: dp?.karma_points ?? 0 },
                  { icon: <Trophy size={16} color="var(--primary)" />, label: 'Quiz Pts', value: dp?.quiz_points ?? 0 },
                  { icon: <BookOpen size={16} color="#10b981" />,    label: 'Bookmarks', value: bookmarks.length },
                  { icon: <TrendingUp size={16} color="#f59e0b" />,  label: 'Quizzes',   value: quizHistory.length },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    {s.icon}
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isOwn && (
              <button className="btn btn-ghost" onClick={signOut}>
                <LogOut size={15} /> Sign Out
              </button>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)', flexWrap: 'wrap' }}>
            {(dp?.karma_points ?? 0) >= 0 && BADGES.slice(0, 1).map((b, i) => (
              <div key={i} title={b.desc} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>
                {b.icon} {b.label}
              </div>
            ))}
            {(dp?.karma_points ?? 0) >= 10 && (
              <div title="Uploaded approved material" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>
                📤 Contributor
              </div>
            )}
            {dp?.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>
                ⚡ Platform Builder
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--bg)' }}>
        <div className="container" style={{ display: 'flex', gap: 4 }}>
          {(['bookmarks', 'history', 'notifications'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: 'transparent', color: tab === t ? 'var(--primary)' : 'var(--on-surface-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t === 'bookmarks' ? <><BookOpen size={15} />Bookmarks</> : t === 'history' ? <><Eye size={15} />Quiz History</> : <><Bell size={15} />Notifications {notifs.filter(n => !n.read).length > 0 && <span className="badge badge-red" style={{ fontSize: 10 }}>{notifs.filter(n => !n.read).length}</span>}</>}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : tab === 'bookmarks' ? (
          bookmarks.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🔖</div>
              <h3 style={{ marginBottom: 'var(--sp-2)' }}>No bookmarks yet</h3>
              <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-5)' }}>Bookmark any material to access it instantly on exam morning.</p>
              <Link to="/year/2" className="btn btn-primary">Browse Materials</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {bookmarks.map(b => (
                <Link key={b.id} to={`/material/${b.material_id}`} className="material-row">
                  <span className="badge badge-primary">{(b.materials as any)?.type?.replace('_', ' ') ?? 'Material'}</span>
                  <div className="material-row-title">{(b.materials as any)?.title ?? 'Unknown'}</div>
                  <div className="material-row-meta">{fmtDate(b.created_at)}</div>
                </Link>
              ))}
            </div>
          )
        ) : tab === 'history' ? (
          quizHistory.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>📝</div>
              <h3>No quizzes taken yet</h3>
              <p style={{ color: 'var(--on-surface-muted)', marginTop: 'var(--sp-2)' }}>Take a quiz to start building your history.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {quizHistory.map(h => (
                <div key={h.id} className="glass-card" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: h.percentage >= 80 ? '#16a34a' : h.percentage >= 60 ? 'var(--warn)' : 'var(--danger)', minWidth: 64, textAlign: 'center' }}>{Math.round(h.percentage)}%</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{(h.quizzes as any)?.title ?? 'Quiz'}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>{fmtDate(h.created_at)}</div>
                  </div>
                  <div className="progress-bar" style={{ width: 100 }}>
                    <div className="progress-fill" style={{ width: `${h.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          notifs.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🔔</div>
              <h3>No notifications yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {notifs.map(n => (
                <div key={n.id} className="glass-card" onClick={() => markRead(n.id)} style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer', opacity: n.read ? 0.7 : 1 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--primary)', flexShrink: 0, border: n.read ? '2px solid var(--outline-variant)' : 'none' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginTop: 2 }}>{n.body}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 4 }}>{fmtDate(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
