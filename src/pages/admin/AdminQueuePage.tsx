// src/pages/admin/AdminQueuePage.tsx — real Supabase approval pipeline
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, SkipForward, Sparkles, FileText, LayoutDashboard, Users, BarChart2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface PendingItem {
  id: string; title: string; type: string; created_at: string
  rejection_reason: string | null; subject_id: string
  subjects: { name: string; code: string } | null
  profiles: { full_name: string } | null
  file_url: string | null; youtube_url: string | null
}

const TYPE_BADGE: Record<string, string> = { full_notes: 'badge-primary', unit_test: 'badge-amber', youtube: 'badge-red', summary: 'badge-ai' }
const TYPE_LABEL: Record<string, string> = { full_notes: 'Full Notes', unit_test: 'Unit Test', youtube: 'Video', summary: 'AI Summary' }

function fmtTime(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

const ADMIN_NAV = [
  { to: '/admin/queue', label: 'Queue',  icon: <LayoutDashboard size={14} /> },
  { to: '/admin/users', label: 'Users',  icon: <Users size={14} /> },
  { to: '/admin/stats', label: 'Stats',  icon: <BarChart2 size={14} /> },
]

export default function AdminQueuePage() {
  const { user } = useAuth()
  const [queue, setQueue]       = useState<PendingItem[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast]       = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadQueue = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('materials')
      .select('id,title,type,created_at,rejection_reason,subject_id,file_url,youtube_url,subjects(name,code),profiles(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setQueue((data as unknown as PendingItem[]) ?? [])
    setSelected(0)
    setLoading(false)
  }

  useEffect(() => { loadQueue() }, [])

  useEffect(() => {
    if (queue[selected]) setEditTitle(queue[selected].title)
    setAiPreview(null)
  }, [selected, queue])

  const current = queue[selected]

  const approve = async () => {
    if (!current) return
    const updates: Record<string, unknown> = { status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() }
    if (editTitle !== current.title) updates.title = editTitle
    await supabase.from('materials').update(updates).eq('id', current.id)
    showToast(`✅ Approved! +10 karma sent.`)
    await loadQueue()
  }

  const reject = async () => {
    if (!current || !rejectReason) return
    await supabase.from('materials').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', current.id)
    showToast(`❌ Rejected.`)
    setRejectOpen(false); setRejectReason('')
    await loadQueue()
  }

  const skip = () => setSelected(s => (s + 1) % Math.max(queue.length, 1))

  const generateAI = async () => {
    if (!current || !user) return
    setAiLoading(true); setAiPreview(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await supabase.functions.invoke('generate-summary', {
      body: { material_id: current.id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    setAiLoading(false)
    if (res.error) { showToast('⚠️ AI error: ' + res.error.message); return }
    setAiPreview(res.data?.summary ?? null)
    showToast('✨ AI Summary generated! Review below then approve.')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="skeleton" style={{ width: 200, height: 20, borderRadius: 4 }} />
      <div className="skeleton" style={{ width: 300, height: 20, borderRadius: 4 }} />
    </div>
  )

  return (
    <div>
      {/* Admin nav bar */}
      <div style={{ background: 'var(--on-surface)', color: 'white', padding: 'var(--sp-3) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Admin Panel</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {ADMIN_NAV.map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontSize: 13, fontWeight: 600, background: l.to === '/admin/queue' ? 'rgba(255,255,255,0.15)' : 'transparent', color: l.to === '/admin/queue' ? 'white' : 'rgba(255,255,255,0.6)' }}>
                {l.icon}{l.label}
              </Link>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            {queue.length} pending
          </div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)', textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>🎉</div>
          <h2>Queue Empty!</h2>
          <p style={{ color: 'var(--on-surface-muted)' }}>All submissions have been reviewed. Check back later.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 112px)' }}>
          {/* Queue list */}
          <div style={{ borderRight: '1px solid var(--outline-variant)', overflowY: 'auto', background: 'var(--surface-low)' }}>
            <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', fontWeight: 700, fontSize: 12, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PENDING ({queue.length})
            </div>
            {queue.map((item, i) => (
              <div key={item.id} onClick={() => setSelected(i)}
                style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer', background: i === selected ? 'var(--primary-light)' : 'transparent', borderLeft: `3px solid ${i === selected ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                  <span className={`badge ${TYPE_BADGE[item.type]}`} style={{ fontSize: 10 }}>{TYPE_LABEL[item.type]}</span>
                  <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>{fmtTime(item.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>
                  {(item.subjects as any)?.name} · {(item.profiles as any)?.full_name}
                </div>
              </div>
            ))}
          </div>

          {/* Preview pane */}
          {current && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Action bar */}
              <div style={{ padding: 'var(--sp-4) var(--sp-6)', background: 'var(--bg)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={approve}><CheckCircle size={15} /> Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => setRejectOpen(true)}><XCircle size={15} /> Reject</button>
                <button className="btn btn-ghost btn-sm" onClick={skip}><SkipForward size={15} /> Skip</button>
                {current.type === 'full_notes' && (
                  <button className="btn btn-sm" onClick={generateAI} disabled={aiLoading}
                    style={{ background: 'linear-gradient(135deg,#e0f2fe,#dcffe8)', color: '#0e7490', border: '1px solid #a5f3fc' }}>
                    <Sparkles size={14} /> {aiLoading ? 'Generating…' : 'Generate AI Summary'}
                  </button>
                )}
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--on-surface-muted)' }}>
                  {selected + 1} / {queue.length}
                  <button onClick={() => setSelected(s => Math.max(0, s - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 8 }}>◀</button>
                  <button onClick={() => setSelected(s => Math.min(queue.length - 1, s + 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>▶</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', flex: 1 }}>
                {/* Preview */}
                <div style={{ padding: 'var(--sp-6)', overflowY: 'auto' }}>
                  {current.type === 'youtube' ? (
                    <div style={{ background: 'var(--surface-mid)', borderRadius: 'var(--radius-lg)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      <div style={{ fontSize: 48 }}>🎥</div>
                      <div style={{ fontWeight: 600 }}>YouTube Video</div>
                      <a href={current.youtube_url ?? '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 13 }}>Open link ↗</a>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--on-surface)', borderRadius: 'var(--radius-lg)', aspectRatio: '1/1.2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--sp-4)', color: 'rgba(255,255,255,0.5)' }}>
                      <FileText size={48} color="rgba(255,255,255,0.3)" />
                      <div style={{ color: 'white', fontWeight: 600, textAlign: 'center', padding: '0 var(--sp-6)' }}>{current.title}</div>
                      <div style={{ fontSize: 12 }}>PDF · Supabase Storage</div>
                    </div>
                  )}

                  {/* AI loading skeleton */}
                  {aiLoading && (
                    <div className="glass-card" style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-5)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                        <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                        <span style={{ color: 'var(--on-surface-muted)', fontSize: 14 }}>Extracting text → Calling Groq AI → Polishing…</span>
                      </div>
                      {[100, 80, 90, 60, 75].map((w, i) => <div key={i} className="skeleton" style={{ height: 12, width: `${w}%`, borderRadius: 4, marginBottom: 8 }} />)}
                    </div>
                  )}

                  {/* AI summary preview */}
                  {aiPreview && (
                    <div className="glass-card" style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-5)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                        <span className="badge badge-ai"><Sparkles size={11} /> AI Summary Generated</span>
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={approve}>Approve & Publish</button>
                      </div>
                      <pre style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7, color: 'var(--on-surface)', whiteSpace: 'pre-wrap' }}>{aiPreview}</pre>
                    </div>
                  )}
                </div>

                {/* Metadata sidebar */}
                <div style={{ borderLeft: '1px solid var(--outline-variant)', padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div>
                    <label>Title (editable)</label>
                    <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ marginTop: 6 }} />
                  </div>
                  <div className="divider" />
                  {[
                    { label: 'Uploader', value: (current.profiles as any)?.full_name ?? '—' },
                    { label: 'Subject',  value: (current.subjects as any)?.name ?? '—' },
                    { label: 'Type',     value: TYPE_LABEL[current.type] },
                    { label: 'Submitted', value: fmtTime(current.created_at) },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--on-surface-muted)' }}>{r.label}</span>
                      <span style={{ fontWeight: 600 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(25,27,36,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--sp-8)', maxWidth: 420, width: '100%' }}>
            <h3 style={{ fontSize: 18, marginBottom: 'var(--sp-5)' }}>Reject Submission</h3>
            <label>Reason</label>
            <select className="input" value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginTop: 6, marginBottom: 'var(--sp-5)' }}>
              <option value="">Select reason…</option>
              <option>Duplicate content already exists</option>
              <option>Poor quality / unreadable</option>
              <option>Wrong subject selected</option>
              <option>Incomplete notes</option>
              <option>Copyright violation</option>
            </select>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRejectOpen(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={reject} disabled={!rejectReason}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
