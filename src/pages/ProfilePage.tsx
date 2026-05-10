import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trophy, BookOpen, Bell, Star, Eye, LogOut, LayoutDashboard, Users, BarChart2, RefreshCw, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/context/AuthContext'

interface QuizHistory { id: string; percentage: number; created_at: string; quizzes: { title: string } | null }
interface BookmarkItem { id: string; material_id: string; created_at: string; materials: { title: string; type: string } | null }
interface Notif { id: string; title: string; body: string; read: boolean; created_at: string; link: string | null }
interface KarmaEntry { id: string; action: string; points: number; created_at: string }

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  return `${Math.floor(diff / 7)}w ago`
}

const ADMIN_LINKS = [
  { to: '/admin/queue', icon: <LayoutDashboard size={15} />, label: 'Approval Queue',    desc: 'Review pending uploads & trigger AI summaries' },
  { to: '/admin/users', icon: <Users size={15} />,           label: 'User Moderation',   desc: 'Warn, block, unblock students' },
  { to: '/admin/stats', icon: <BarChart2 size={15} />,       label: 'Platform Stats',    desc: 'Live DAU, top materials, downloads' },
  { to: '/leaderboard', icon: <RefreshCw size={15} />,       label: 'Reset Semester',    desc: 'Archive standings & reset leader points' },
  { to: '/about',       icon: <Info size={15} />,            label: 'About Page',        desc: 'Top contributors & your bio' },
]

export default function ProfilePage() {
  const { handle } = useParams()
  const { user, profile: myProfile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const isOwn = !handle

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [quizHistory, setQHistory] = useState<QuizHistory[]>([])
  const [bookmarks, setBookmarks]  = useState<BookmarkItem[]>([])
  const [notifs, setNotifs]        = useState<Notif[]>([])
  const [karmaLog, setKarmaLog]    = useState<KarmaEntry[]>([])
  const [loading, setLoading]      = useState(true)

  // Admin gets extra tabs; regular users get 3
  type AdminTab = 'bookmarks' | 'history' | 'notifications' | 'karma' | 'admin'
  type UserTab  = 'bookmarks' | 'history' | 'notifications'
  const [tab, setTab] = useState<AdminTab | UserTab>('bookmarks')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const pid = isOwn ? user?.id : null
      if (!pid) { setLoading(false); return }

      const promises: Promise<any>[] = [
        supabase.from('profiles').select('*').eq('id', pid).single(),
        supabase.from('quiz_attempts').select('id,percentage,created_at,quizzes(title)').eq('user_id', pid).order('created_at', { ascending: false }).limit(10),
        supabase.from('bookmarks').select('id,material_id,created_at,materials(title,type)').eq('user_id', pid).order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications').select('id,title,body,read,created_at,link').eq('user_id', pid).order('created_at', { ascending: false }).limit(30),
      ]

      // Admin also loads karma log
      if (isAdmin && isOwn) {
        promises.push(supabase.from('karma_log').select('id,action,points,created_at').eq('user_id', pid).order('created_at', { ascending: false }).limit(20))
      }

      const results = await Promise.all(promises)
      const [{ data: p }, { data: attempts }, { data: bks }, { data: nots }] = results

      setProfile(p as Profile)
      setQHistory((attempts as unknown as QuizHistory[]) ?? [])
      setBookmarks((bks as unknown as BookmarkItem[]) ?? [])
      setNotifs((nots as Notif[]) ?? [])
      if (results[4]) setKarmaLog((results[4].data as KarmaEntry[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user, handle, isOwn, isAdmin])

  const markRead = async (notifId: string, link?: string | null) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId)
    setNotifs(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))
    if (link) navigate(link)
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const toggleAnon = async () => {
    if (!user || !myProfile) return
    await supabase.from('profiles').update({ anonymous_mode: !myProfile.anonymous_mode }).eq('id', user.id)
    window.location.reload()
  }

  const dp = isOwn ? myProfile : profile
  if (!dp && !loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2>Sign in to view your profile</h2>
      <Link to="/login" className="btn btn-primary">Sign In</Link>
    </div>
  )

  const dpAny = dp as any
  const initials = dp?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const unread = notifs.filter(n => !n.read).length

  const tabs = isAdmin && isOwn
    ? ['bookmarks', 'history', 'notifications', 'karma', 'admin'] as AdminTab[]
    : ['bookmarks', 'history', 'notifications'] as UserTab[]

  const TAB_LABELS: Record<string, string> = {
    bookmarks: '🔖 Bookmarks',
    history:   '📊 Quiz History',
    notifications: `🔔 Notifications${unread > 0 ? ` (${unread})` : ''}`,
    karma:     '⭐ Karma Log',
    admin:     '⚡ Admin Controls',
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock: 'var(--sp-10)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 'var(--sp-8)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7b8fff)', color: 'white', fontWeight: 800, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: 'var(--shadow-float)', overflow: 'hidden', flexShrink: 0 }}>
              {dp?.avatar_url ? <img src={dp.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800 }}>{dp?.full_name}</h1>
                {dp?.role === 'admin' && <span className="badge badge-admin">⚡ Admin</span>}
              </div>
              <div style={{ fontSize: 14, color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-4)' }}>
                {dp?.year ? `${dp.year === 1 ? '1st' : '2nd'} Year` : ''}{dp?.branch ? ` · ${dp.branch}` : ''} · JSS University Noida
                {dp?.roll_number && <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{dp.roll_number}</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
                {[
                  { icon: <Star size={16} color="#f7dd7d" />,         label: 'Karma (permanent)',     value: dp?.karma_points ?? 0 },
                  { icon: <Trophy size={16} color="var(--primary)" />, label: 'Leader Pts (this sem)', value: dpAny?.leader_points ?? 0 },
                  { icon: <BookOpen size={16} color="#10b981" />,      label: 'Bookmarks',             value: bookmarks.length },
                  { icon: <Eye size={16} color="#f59e0b" />,           label: 'Quizzes Taken',         value: quizHistory.length },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    {s.icon}
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isOwn && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <button className="btn btn-ghost btn-sm" onClick={toggleAnon}>
                  {dpAny?.anonymous_mode ? '👤 Go Public' : '🎭 Go Anonymous'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={signOut}><LogOut size={15} /> Sign Out</button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)', flexWrap: 'wrap' }}>
            <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>🚀 Early Adopter</div>
            {(dp?.karma_points ?? 0) >= 10 && <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>📤 Contributor</div>}
            {(dp?.karma_points ?? 0) >= 50 && <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>⭐ Top Contributor</div>}
            {dp?.role === 'admin' && <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.6)' }}>⚡ Platform Builder</div>}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--bg)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '12px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'transparent', color: tab === t ? 'var(--primary)' : 'var(--on-surface-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-3)' }} />)
        ) : tab === 'admin' && isAdmin ? (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 'var(--sp-2)' }}>⚡ Admin Quick Controls</h2>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: 14, marginBottom: 'var(--sp-6)' }}>Everything you can manage on Exam League.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
              {ADMIN_LINKS.map(l => (
                <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: 'var(--sp-5)', height: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <div style={{ color: 'var(--primary)', marginBottom: 'var(--sp-3)' }}>{l.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{l.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>{l.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ padding: 'var(--sp-5)', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)' }}>📌 Admin Rules</div>
              <ul style={{ fontSize: 14, color: 'var(--on-surface-muted)', lineHeight: 2.2, paddingLeft: 'var(--sp-5)' }}>
                <li><strong>Karma points</strong> = permanent, never reset. Approve content → student earns +10.</li>
                <li><strong>Leader points</strong> = semester-based. Go to Leaderboard → Reset Semester to archive + zero out.</li>
                <li>Admin uploads & quiz attempts = <strong>zero points awarded</strong> (fair play).</li>
                <li>1st Year subjects are fully open for admin to upload content.</li>
                <li>Archive old materials from Subject page when semester ends.</li>
              </ul>
            </div>
          </div>
        ) : tab === 'karma' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 32, color: '#f7dd7d' }}>{dp?.karma_points ?? 0}</div>
              <div>
                <div style={{ fontWeight: 700 }}>Total Karma Points</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>Permanent — never resets</div>
              </div>
            </div>
            {karmaLog.length === 0 ? (
              <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>⭐</div>
                <h3 style={{ marginTop: 'var(--sp-4)' }}>No karma earned yet</h3>
                <p style={{ color: 'var(--on-surface-muted)', marginTop: 'var(--sp-2)' }}>Upload quality content and get it approved.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {karmaLog.map(k => (
                  <div key={k.id} className="glass-card" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: '#f7dd7d', minWidth: 48, textAlign: 'center' }}>+{k.points}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{k.action.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>{fmtDate(k.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'bookmarks' ? (
          bookmarks.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🔖</div>
              <h3>No bookmarks yet</h3>
              <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-5)' }}>Bookmark materials to access them on exam morning.</p>
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
              <div style={{ fontSize: 48 }}>📝</div>
              <h3 style={{ marginTop: 'var(--sp-4)' }}>No quizzes taken yet</h3>
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
          // Notifications
          notifs.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>🔔</div>
              <h3 style={{ marginTop: 'var(--sp-4)' }}>No notifications yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {unread > 0 && (
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              {notifs.map(n => (
                <div key={n.id} className="glass-card"
                  onClick={() => markRead(n.id, n.link)}
                  style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer', opacity: n.read ? 0.65 : 1, background: n.read ? undefined : 'var(--primary-light)' }}>
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
