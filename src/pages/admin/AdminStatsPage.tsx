// src/pages/admin/AdminStatsPage.tsx — real stats from Supabase
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart2, TrendingUp, BookOpen, Trophy, HelpCircle, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ADMIN_NAV = [
  { to: '/admin/queue', label: 'Queue', icon: <LayoutDashboard size={14} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={14} /> },
  { to: '/admin/stats', label: 'Stats', icon: <BarChart2 size={14} /> },
]

interface Stats {
  totalUsers: number; totalMaterials: number; totalQuizAttempts: number
  totalDoubts: number; pendingQueue: number; resolvedDoubts: number
}

interface SubjectStat { name: string; view_count: number }
interface TopMaterial { title: string; bookmark_count: number; download_count: number; subject_name: string }

export default function AdminStatsPage() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [topSubs, setTopSubs]   = useState<SubjectStat[]>([])
  const [topMats, setTopMats]   = useState<TopMaterial[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [
        { count: users },
        { count: materials },
        { count: attempts },
        { count: doubts },
        { count: pending },
        { count: resolved },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('materials').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('doubts').select('id', { count: 'exact', head: true }),
        supabase.from('materials').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('doubts').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
      ])
      setStats({ totalUsers: users ?? 0, totalMaterials: materials ?? 0, totalQuizAttempts: attempts ?? 0, totalDoubts: doubts ?? 0, pendingQueue: pending ?? 0, resolvedDoubts: resolved ?? 0 })

      // Top subjects by view count (sum of materials.view_count)
      const { data: subViews } = await supabase
        .from('materials')
        .select('view_count, subjects(name)')
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .limit(50)

      if (subViews) {
        const agg: Record<string, number> = {}
        subViews.forEach((m: any) => {
          const n = m.subjects?.name ?? 'Unknown'
          agg[n] = (agg[n] ?? 0) + (m.view_count ?? 0)
        })
        setTopSubs(Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, view_count]) => ({ name, view_count })))
      }

      // Top bookmarked materials
      const { data: bkMats } = await supabase
        .from('materials')
        .select('title, download_count, subjects(name)')
        .eq('status', 'approved')
        .order('download_count', { ascending: false })
        .limit(5)

      if (bkMats) {
        setTopMats(bkMats.map((m: any) => ({ title: m.title, bookmark_count: 0, download_count: m.download_count ?? 0, subject_name: m.subjects?.name ?? '—' })))
      }

      setLoading(false)
    }
    load()
  }, [])

  const maxViews = Math.max(...topSubs.map(s => s.view_count), 1)

  const METRIC_CARDS = stats ? [
    { icon: <Users size={20} color="var(--primary)" />, label: 'Total Users',    value: stats.totalUsers.toLocaleString(),          sub: 'registered',         color: 'var(--primary-light)' },
    { icon: <BookOpen size={20} color="#10b981" />,     label: 'Materials Live',  value: stats.totalMaterials.toLocaleString(),       sub: `${stats.pendingQueue} pending`, color: '#dcffe8' },
    { icon: <Trophy size={20} color="#f59e0b" />,       label: 'Quiz Attempts',   value: stats.totalQuizAttempts.toLocaleString(),    sub: 'all time',           color: '#fff3cd' },
    { icon: <HelpCircle size={20} color="#0e7490" />,   label: 'Doubts Posted',   value: stats.totalDoubts.toLocaleString(),          sub: `${stats.resolvedDoubts} resolved`, color: '#e0f2fe' },
    { icon: <Star size={20} color="#7b4fff" />,         label: 'Queue',           value: stats.pendingQueue.toLocaleString(),         sub: 'awaiting review',    color: '#ede9fe' },
    { icon: <TrendingUp size={20} color="#f7dd7d" />,   label: 'Resolve Rate',    value: stats.totalDoubts > 0 ? `${Math.round(stats.resolvedDoubts / stats.totalDoubts * 100)}%` : '—', sub: 'doubts resolved', color: '#fff3c7' },
  ] : []

  return (
    <div>
      <div style={{ background: 'var(--on-surface)', color: 'white', padding: 'var(--sp-3) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Admin Panel</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {ADMIN_NAV.map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontSize: 13, fontWeight: 600, background: l.to === '/admin/stats' ? 'rgba(255,255,255,0.15)' : 'transparent', color: l.to === '/admin/stats' ? 'white' : 'rgba(255,255,255,0.6)' }}>
                {l.icon}{l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>
        <div style={{ marginBottom: 'var(--sp-8)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Platform Analytics</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: 14 }}>Live stats — screenshot these for your resume 📸</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 'var(--sp-4)' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
              {METRIC_CARDS.map((s, i) => (
                <div key={i} style={{ background: 'var(--surface-card)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-5)', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
              {/* Top subjects */}
              <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 'var(--sp-5)' }}>📊 Top Subjects by Views</div>
                {topSubs.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-muted)', fontSize: 13 }}>No view data yet. Share the platform to get traffic!</p>
                ) : topSubs.map((s, i) => (
                  <div key={i} style={{ marginBottom: 'var(--sp-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{s.view_count.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${(s.view_count / maxViews) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Most downloaded */}
              <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 'var(--sp-5)' }}>🔖 Most Downloaded Materials</div>
                {topMats.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-muted)', fontSize: 13 }}>No downloads yet. Approve some materials first!</p>
                ) : topMats.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--surface-low)', marginBottom: 'var(--sp-2)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface-muted)', fontSize: 12, width: 20, textAlign: 'center', flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>{m.subject_name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{m.download_count} ↓</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
