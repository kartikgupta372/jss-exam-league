import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Search, BookOpen, Home, Trophy, HelpCircle, User, LogOut, LayoutDashboard, Upload, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function NavBar() {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth()
  const [year, setYear] = useState<1|2>(2)
  const [dropOpen, setDropOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const dropRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false); setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('notifications')
      .select('id,title,body,read,created_at,link')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setNotifs(data ?? []))
  }, [user])

  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'
  const unread = notifs.filter(n => !n.read).length

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">Exam<span>League</span></Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
            <NavLink to={`/year/${year}`} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Subjects</NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Leaderboard</NavLink>
            <NavLink to="/doubts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Doubts</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>About</NavLink>
            {isLoading ? (
               <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 4 }} />
            ) : isAdmin ? (
              <NavLink to="/admin/queue" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                ⚡ Admin
              </NavLink>
            ) : null}
          </div>

          <div className="navbar-spacer" />

          <div className="navbar-actions" ref={dropRef}>
            <div className="year-toggle">
              <button className={`year-toggle-btn${year === 1 ? ' active' : ''}`} onClick={() => { setYear(1); navigate('/year/1') }}>1st Yr</button>
              <button className={`year-toggle-btn${year === 2 ? ' active' : ''}`} onClick={() => { setYear(2); navigate('/year/2') }}>2nd Yr</button>
            </div>

            <button className="icon-btn" onClick={() => navigate('/year/2')} aria-label="Browse"><Search size={17} /></button>

            {user ? (
              <>
                {/* Notification bell */}
                <div style={{ position: 'relative' }}>
                  <button className="icon-btn" onClick={() => { setNotifOpen(o => !o); setDropOpen(false) }}>
                    <Bell size={17} />
                    {unread > 0 && <span className="notif-dot" />}
                  </button>
                  {notifOpen && (
                    <div style={{ position: 'absolute', top: 48, right: 0, width: 320, background: 'var(--bg)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', zIndex: 200 }}>
                      <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Notifications
                        {unread > 0 && <span className="badge badge-primary">{unread} new</span>}
                      </div>
                      {notifs.length === 0 ? (
                        <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: 13 }}>No notifications yet</div>
                      ) : notifs.map(n => (
                        <div key={n.id}
                          style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--primary-light)' }}
                          onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link) }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 2 }}>{n.body.slice(0, 60)}{n.body.length > 60 ? '…' : ''}</div>
                          </div>
                        </div>
                      ))}
                      <Link to="/profile" style={{ display: 'block', textAlign: 'center', padding: 'var(--sp-3)', fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}
                        onClick={() => setNotifOpen(false)}>View all →</Link>
                    </div>
                  )}
                </div>

                {/* Avatar + dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => { setDropOpen(o => !o); setNotifOpen(false) }}
                    style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--primary)', overflow: 'hidden', cursor: 'pointer', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{initials}</span>}
                  </button>

                  {dropOpen && (
                    <div style={{ position: 'absolute', top: 48, right: 0, width: 220, background: 'var(--bg)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', zIndex: 200, overflow: 'hidden' }}>
                      <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--outline-variant)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{profile?.full_name ?? user.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 2 }}>
                          {profile?.year ? `${profile.year === 1 ? '1st' : '2nd'} Year · ${profile.branch}` : 'Complete your profile'}
                        </div>
                        {isAdmin && <span className="badge badge-admin" style={{ marginTop: 'var(--sp-2)' }}>⚡ Admin</span>}
                      </div>
                      {[
                        { to: '/profile', icon: <User size={15} />, label: 'My Profile' },
                        { to: '/upload', icon: <Upload size={15} />, label: 'Upload Material' },
                        { to: '/about', icon: <Info size={15} />, label: 'About' },
                        ...(isAdmin ? [{ to: '/admin/queue', icon: <LayoutDashboard size={15} />, label: 'Admin Panel' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', textDecoration: 'none', color: 'var(--on-surface)', fontSize: 14, fontWeight: 500 }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-low)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <div className="divider" style={{ margin: 0 }} />
                      <button onClick={() => { signOut(); setDropOpen(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#ffdad6')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-gold btn-sm">Sign in with Google</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bottom-tab-bar">
        <div className="bottom-tab-bar-inner">
          <NavLink to="/" end className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}><Home /><span>Home</span></NavLink>
          <NavLink to="/year/2" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}><BookOpen /><span>Subjects</span></NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}><Trophy /><span>League</span></NavLink>
          <NavLink to="/doubts" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}><HelpCircle /><span>Doubts</span></NavLink>
          <NavLink to={user ? '/profile' : '/login'} className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}><User /><span>{user ? 'Me' : 'Login'}</span></NavLink>
        </div>
      </nav>
    </>
  )
}
