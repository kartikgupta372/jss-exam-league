import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Bookmark, Download, ExternalLink, Sparkles, Trophy, Plus, FileText, Video, ClipboardList, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'
import { useSubject } from '@/hooks/useSubjects'
import { useMaterials, useAllMaterials } from '@/hooks/useMaterials'
import { useDoubts } from '@/hooks/useDoubts'

interface Material {
  id: string; title: string; type: string; ai_generated: boolean
  created_at: string; status: string
  profiles: { full_name: string } | null
}
interface Doubt { id: string; title: string; doubt_replies: { count: number }[] }

const TABS = [
  { key: 'notes',     label: 'Notes',      icon: <FileText size={15} /> },
  { key: 'summaries', label: 'Summaries',  icon: <Sparkles size={15} /> },
  { key: 'tests',     label: 'Unit Tests', icon: <ClipboardList size={15} /> },
  { key: 'videos',    label: 'Videos',     icon: <Video size={15} /> },
]

const TYPE_MAP: Record<string, string> = { notes: 'full_notes', summaries: 'summary', tests: 'unit_test', videos: 'youtube' }
const TYPE_BADGE: Record<string, string> = { full_notes: 'badge-primary', summary: 'badge-ai', unit_test: 'badge-amber', youtube: 'badge-red' }
const TYPE_LABEL: Record<string, string> = { full_notes: 'Full Notes', summary: 'AI Summary', unit_test: 'Unit Test', youtube: 'Video' }
const STATUS_ICON: Record<string, ReactNode> = {
  approved: <CheckCircle size={12} color="#16a34a" />,
  pending:  <Clock size={12} color="var(--warn)" />,
  rejected: <XCircle size={12} color="var(--danger)" />,
}

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  return `${Math.floor(diff / 7)}w ago`
}

export default function SubjectPage() {
  const { id = '', year = '2' } = useParams()
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('notes')
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  const { data: subject } = useSubject(id)

  // Admin sees ALL materials (pending, approved, rejected); students see approved only
  const subjectId = subject?.id ?? ''
  const { data: allMatsData, isLoading: loadingAll } = useAllMaterials(subjectId)
  const { data: approvedData, isLoading: loadingApproved } = useMaterials(subjectId, 'approved')

  const materialsData = isAdmin ? allMatsData : approvedData
  const loadingMaterials = isAdmin ? loadingAll : loadingApproved

  const { data: doubtsData, isLoading: loadingDoubts } = useDoubts(subjectId)

  const materials = (materialsData as unknown as Material[]) ?? []
  const doubts = (doubtsData as unknown as Doubt[])?.slice(0, 3) ?? []
  const loading = loadingMaterials || loadingDoubts

  useEffect(() => {
    if (!user) return
    supabase.from('bookmarks').select('material_id').eq('user_id', user.id).then(({ data }) => {
      if (data) setBookmarked(new Set(data.map((b: { material_id: string }) => b.material_id)))
    })
  }, [user])

  const toggleBookmark = async (materialId: string) => {
    if (!user) return
    const has = bookmarked.has(materialId)
    if (has) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('material_id', materialId)
      setBookmarked(prev => { const s = new Set(prev); s.delete(materialId); return s })
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, material_id: materialId })
      setBookmarked(prev => new Set([...prev, materialId]))
    }
  }

  const approveFromPage = async (matId: string) => {
    await supabase.from('materials').update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString()
    }).eq('id', matId)
    window.location.reload()
  }

  const filtered = materials.filter((m: Material) => m.type === TYPE_MAP[activeTab])
  const counts = Object.fromEntries(
    Object.entries(TYPE_MAP).map(([tab, type]) => [tab, materials.filter((m: Material) => m.type === type).length])
  )

  const subjectAny = subject as any

  return (
    <AnimatedPage>
      <PageMeta
        title={subject ? `${subjectAny.name} – Notes, Quizzes & Doubts` : 'Subject'}
        description={subject ? `Study ${subjectAny.name} (${subjectAny.code}) with AI-summarised notes, quizzes, and a live doubt forum on JSS Exam League.` : ''}
        path={`/year/${year}/subject/${id}`}
      />
      <div>
        {/* Sticky header */}
        <div style={{ background: 'var(--surface-mid)', borderBottom: '1px solid var(--outline-variant)', position: 'sticky', top: 64, zIndex: 50 }}>
          <div className="container" style={{ paddingBlock: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginBottom: 4 }}>
                <Link to={`/year/${year}`} style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                  {year === '2' ? '2nd Year' : '1st Year'}
                </Link> / {subjectAny?.code}
                {isAdmin && (
                  <span className="badge badge-admin" style={{ marginLeft: 8, fontSize: 10 }}>⚡ Admin — All Materials</span>
                )}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{subjectAny?.name ?? 'Loading…'}</h1>
            </div>
            <Link to="/upload" className="btn btn-primary btn-sm"><Plus size={15} /> Upload</Link>
          </div>

          {/* Tabs */}
          <div className="container" style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: activeTab === t.key ? 'var(--bg)' : 'transparent', color: activeTab === t.key ? 'var(--primary)' : 'var(--on-surface-muted)', borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.15s' }}>
                {t.icon} {t.label}
                <span className="badge badge-primary" style={{ fontSize: 11 }}>{counts[t.key] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-10)', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--sp-8)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>📭</div>
                <h3 style={{ marginBottom: 'var(--sp-2)' }}>Nothing here yet</h3>
                <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-4)' }}>
                  {isAdmin ? 'Upload the first material for this subject.' : 'First to upload gets +20 bonus karma!'}
                </p>
                <Link to="/upload" className="btn btn-primary">Upload Material</Link>
              </div>
            ) : filtered.map((m: Material) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  <span className={`badge ${TYPE_BADGE[m.type]}`}>
                    {m.ai_generated && <Sparkles size={11} />} {TYPE_LABEL[m.type]}
                  </span>
                  {isAdmin && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: m.status === 'approved' ? '#16a34a' : m.status === 'rejected' ? 'var(--danger)' : 'var(--warn)', fontWeight: 600 }}>
                      {STATUS_ICON[m.status]} {m.status}
                    </span>
                  )}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 12, color: 'var(--on-surface-muted)' }}>
                    <span>{(m.profiles as any)?.full_name ?? 'Unknown'}</span>
                    <span>· {fmtDate(m.created_at)}</span>
                    {m.status === 'approved' && (
                      <button onClick={() => toggleBookmark(m.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: bookmarked.has(m.id) ? 'var(--primary)' : 'var(--on-surface-muted)', display: 'flex', padding: 0 }}>
                        <Bookmark size={16} fill={bookmarked.has(m.id) ? 'var(--primary)' : 'none'} />
                      </button>
                    )}
                    {m.status === 'approved' && (
                      <a href="#" style={{ color: 'var(--on-surface-muted)', display: 'flex' }}>
                        <Download size={16} />
                      </a>
                    )}
                    {isAdmin && m.status === 'pending' && (
                      <button onClick={() => approveFromPage(m.id)} className="btn btn-sm" style={{ background: '#dcffe8', color: '#16a34a', border: 'none', padding: '3px 10px', fontSize: 11, borderRadius: 'var(--radius-full)' }}>
                        <CheckCircle size={11} /> Approve
                      </button>
                    )}
                  </div>
                </div>
                <Link to={`/material/${m.id}`} style={{ textDecoration: 'none', color: 'inherit', fontSize: 14, fontWeight: 600 }}>
                  {m.title}
                </Link>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', position: 'sticky', top: 160 }}>
            <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', fontWeight: 700 }}>
                <Trophy size={16} color="var(--primary)" /> Quick Quiz
              </div>
              <p style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-4)' }}>
                Test your {subjectAny?.name} knowledge.
              </p>
              <Link to="/leaderboard" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                Start Quiz ⚡
              </Link>
            </div>

            <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <BookOpen size={16} color="var(--primary)" /> Top Doubts
              </div>
              {doubts.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>No open doubts yet.</div>
              ) : doubts.map((d: Doubt) => (
                <Link key={d.id} to={`/doubts/${d.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)' }}>{(d.doubt_replies as any)?.[0]?.count ?? 0} replies</div>
                  <div className="divider" />
                </Link>
              ))}
              <Link to="/doubts" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}>
                View all <ExternalLink size={13} />
              </Link>
            </div>
          </aside>
        </div>

        <Link to="/upload" className="fab" aria-label="Upload"><Plus size={22} /></Link>
      </div>
    </AnimatedPage>
  )
}
