// src/components/layout/NavBar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Search, BookOpen, Home, Trophy, HelpCircle, User, LogOut, Settings, LayoutDashboard, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

export default function NavBar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  useRealtimeNotifications()
  const [year, setYear] = useState<1 | 2>(2)
  const [dropOpen, setDropOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const avatarUrl = profile?.avatar_url

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            Exam<span>League</span>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
            <NavLink to={`/year/${year}`} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Subjects</NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Leaderboard</NavLink>
            <NavLink to="/doubts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Doubts</NavLink>
            {isAdmin && (
              <NavLink to="/admin/queue" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                ⚡ Admin
              </NavLink>
            )}
          </div>

          <div className="navbar-spacer" />

          <div className="navbar-actions" ref={dropRef}>

            {/* Year toggle */}
            <div className="year-toggle">
              <button className={`year-toggle-btn${year === 1 ? ' active' : ''}`} onClick={() => { setYear(1); navigate('/year/1') }}>1st Yr</button>
              <button className={`year-toggle-btn${year === 2 ? ' active' : ''}`} onClick={() => { setYear(2); navigate('/year/2') }}>2nd Yr</button>
            </div>

            {/* Search */}
            <button className="icon-btn" aria-label="Search" onClick={() => navigate('/year/2')}>
              <Search size={17} />
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <div style={{ position: 'relative' }}>
                  <button className="icon-btn" aria-label="Notifications" onClick={() => { setNotifOpen(o => !o); setDropOpen(false) }}>
                    <Bell size={17} />
                    <span className="notif-dot" />
                  </button>

                  {notifOpen && (
                    <div style={{ position: 'absolute', top: 48, right: 0, width: 320, background: 'var(--bg)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', zIndex: 200 }}>
                      <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
                      {[
                        { icon: '✅', text: 'Your upload was approved! +10 karma', time: '2h ago' },
                        { icon: '⭐', text: 'Your answer was accepted on a doubt', time: '1d ago' },
                        { icon: '💬', text: 'Priya replied to your doubt', time: '2d ago' },
                      ].map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-low)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span style={{ fontSize: 18 }}>{n.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{n.text}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginTop: 2 }}>{n.time}</div>
                          </div>
                        </div>
                      ))}
                      <Link to="/profile" style={{ display: 'block', textAlign: 'center', padding: 'var(--sp-3)', fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}
                        onClick={() => setNotifOpen(false)}>
                        View all in Profile →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Avatar + dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setDropOpen(o => !o); setNotifOpen(false) }}
                    style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--primary)', overflow: 'hidden', cursor: 'pointer', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    aria-label="Profile"
                  >
                    {avatarUrl
                      ? <img src={avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{initials}</span>
                    }
                  </button>

                  {dropOpen && (
                    <div style={{ position: 'absolute', top: 48, right: 0, width: 220, background: 'var(--bg)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', zIndex: 200, overflow: 'hidden' }}>
                      {/* User info */}
                      <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--outline-variant)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{profile?.full_name ?? user.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 2 }}>
                          {profile?.year ? `${profile.year === 1 ? '1st' : '2nd'} Year · ${profile.branch}` : 'Complete your profile'}
                        </div>
                        {isAdmin && <span className="badge badge-admin" style={{ marginTop: 'var(--sp-2)' }}>Admin</span>}
                      </div>

                      {/* Menu items */}
                      {[
                        { to: '/profile', icon: <User size={15} />, label: 'My Profile' },
                        { to: '/library', icon: <BookOpen size={15} />, label: 'My Library' },
                        { to: '/upload', icon: <Upload size={15} />, label: 'Upload Material' },
                        ...(isAdmin ? [{ to: '/admin/queue', icon: <LayoutDashboard size={15} />, label: 'Admin Panel' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to}
                          onClick={() => setDropOpen(false)}
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
          <NavLink to="/" end className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
            <Home /><span>Home</span>
          </NavLink>
          <NavLink to="/year/2" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
            <BookOpen /><span>Subjects</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
            <Trophy /><span>League</span>
          </NavLink>
          <NavLink to="/doubts" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
            <HelpCircle /><span>Doubts</span>
          </NavLink>
          <NavLink to={user ? '/profile' : '/login'} className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
            <User /><span>{user ? 'Profile' : 'Login'}</span>
          </NavLink>
        </div>
      </nav>
    </>
  )
}
