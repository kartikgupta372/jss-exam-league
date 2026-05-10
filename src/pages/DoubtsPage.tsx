// src/pages/DoubtsPage.tsx — real Supabase doubts
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, MessageCircle, CheckCircle, Filter, Send, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'

interface Subject { id: string; name: string }
interface Doubt {
  id: string; title: string; body: string; status: string; created_at: string; view_count: number
  subjects: { name: string } | null
  profiles: { full_name: string; avatar_url: string | null } | null
  doubt_replies: { count: number }[]
}
interface Reply {
  id: string; body: string; upvote_count: number; created_at: string
  profiles: { full_name: string; avatar_url: string | null } | null
}

function fmtDate(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

export default function DoubtsPage() {
  const { id: threadId } = useParams()
  const { user, isBlocked } = useAuth()

  const [subjects, setSubjects]       = useState<Subject[]>([])
  const [doubts, setDoubts]           = useState<Doubt[]>([])
  const [thread, setThread]           = useState<Doubt | null>(null)
  const [replies, setReplies]         = useState<Reply[]>([])
  const [subjectFilter, setSubFilter] = useState('')
  const [statusFilter, setStFilter]   = useState('all')
  const [loading, setLoading]         = useState(true)
  const [newDoubt, setNewDoubt]       = useState(false)
  const [replyText, setReplyText]     = useState('')
  const [posting, setPosting]         = useState(false)
  // New doubt form
  const [ndTitle, setNdTitle]         = useState('')
  const [ndBody, setNdBody]           = useState('')
  const [ndSubject, setNdSubject]     = useState('')

  useEffect(() => {
    supabase.from('subjects').select('id,name').eq('year', 2).order('sort_order').then(({ data }) => setSubjects(data ?? []))
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (threadId) {
        const [{ data: d }, { data: r }] = await Promise.all([
          supabase.from('doubts').select('*,subjects(name),profiles(full_name,avatar_url),doubt_replies(count)').eq('id', threadId).single(),
          supabase.from('doubt_replies').select('id,body,upvote_count,created_at,profiles(full_name,avatar_url)').eq('doubt_id', threadId).order('upvote_count', { ascending: false }),
        ])
        setThread(d as unknown as Doubt)
        setReplies((r as unknown as Reply[]) ?? [])
        // Increment view count
        await supabase.rpc('increment_view_count', { material_id: threadId })
      } else {
        let q = supabase.from('doubts').select('id,title,body,status,created_at,view_count,subjects(name),profiles(full_name,avatar_url),doubt_replies(count)').order('created_at', { ascending: false }).limit(50)
        if (subjectFilter) q = q.eq('subject_id', subjectFilter)
        if (statusFilter !== 'all') q = q.eq('status', statusFilter)
        const { data } = await q
        setDoubts((data as unknown as Doubt[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [threadId, subjectFilter, statusFilter])

  const postReply = async () => {
    if (!user || !threadId || !replyText.trim()) return
    setPosting(true)
    await supabase.from('doubt_replies').insert({ doubt_id: threadId, user_id: user.id, body: replyText.trim() })
    setReplyText(''); setPosting(false)
    const { data } = await supabase.from('doubt_replies').select('id,body,upvote_count,created_at,profiles(full_name,avatar_url)').eq('doubt_id', threadId).order('upvote_count', { ascending: false })
    setReplies((data as unknown as Reply[]) ?? [])
  }

  const upvote = async (replyId: string) => {
    if (!user) return
    await supabase.from('doubt_upvotes').insert({ user_id: user.id, reply_id: replyId })
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvote_count: r.upvote_count + 1 } : r))
  }

  const submitDoubt = async () => {
    if (!user || !ndTitle.trim() || !ndBody.trim()) return
    setPosting(true)
    const { data } = await supabase.from('doubts').insert({ user_id: user.id, title: ndTitle.trim(), body: ndBody.trim(), subject_id: ndSubject || null }).select('id').single()
    setPosting(false); setNewDoubt(false); setNdTitle(''); setNdBody(''); setNdSubject('')
    if (data) window.location.href = `/doubts/${data.id}`
  }

  // Thread view
  if (threadId) return (
    <AnimatedPage>
      <PageMeta title="Doubt Thread" description="View and answer student doubts on JSS Exam League." path={`/doubts/${threadId}`} />
      <div className="container" style={{ maxWidth: 780, paddingBlock: 'var(--sp-8)' }}>
      <Link to="/doubts" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 'var(--sp-6)' }}>← Back to Doubts</Link>

      {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} /> : thread && (
        <>
          <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              {(thread.subjects as any)?.name && <span className="badge badge-primary">{(thread.subjects as any).name}</span>}
              <span className={`badge ${thread.status === 'resolved' ? 'badge-lime' : 'badge-amber'}`}>
                {thread.status === 'resolved' ? <CheckCircle size={11} /> : null} {thread.status}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 'var(--sp-4)', lineHeight: 1.3 }}>{thread.title}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 'var(--sp-5)' }}>{thread.body}</p>
            <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>
              {(thread.profiles as any)?.full_name} · {fmtDate(thread.created_at)}
            </div>
          </div>

          {/* Replies */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
            {(thread.doubt_replies as any)?.[0]?.count ?? replies.length} Replies
          </h2>

          {replies.map((r, i) => (
            <div key={r.id} className="glass-card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-3)', borderLeft: i === 0 && replies.length > 0 ? '3px solid #16a34a' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {i === 0 && <span className="badge badge-lime" style={{ marginBottom: 'var(--sp-3)', display: 'inline-flex' }}><CheckCircle size={11} /> Best Answer</span>}
                  <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 'var(--sp-3)' }}>{r.body}</p>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>
                    {(r.profiles as any)?.full_name} · {fmtDate(r.created_at)}
                  </div>
                </div>
                <button onClick={() => upvote(r.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-2)', background: 'var(--surface-low)', cursor: 'pointer', marginLeft: 'var(--sp-4)', flexShrink: 0 }}>
                  <ChevronUp size={16} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{r.upvote_count}</span>
                </button>
              </div>
            </div>
          ))}

          {/* Reply box */}
          {user && !isBlocked && (
            <div className="glass-card" style={{ padding: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
              <label>Your Answer</label>
              <textarea className="input" rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Share your knowledge…" style={{ marginTop: 6, marginBottom: 'var(--sp-4)' }} />
              <button className="btn btn-primary" onClick={postReply} disabled={posting || !replyText.trim()}>
                <Send size={15} /> {posting ? 'Posting…' : 'Post Reply'}
              </button>
            </div>
          )}
          {!user && <div className="glass-card" style={{ padding: 'var(--sp-5)', textAlign: 'center', marginTop: 'var(--sp-5)' }}>
            <Link to="/login" className="btn btn-primary">Sign in to reply</Link>
          </div>}
        </>
      )}
      </div>
    </AnimatedPage>
  )

  // Feed view
  return (
    <AnimatedPage>
    <PageMeta title="Doubt Forum" description="Ask and answer doubts with JSS University peers. Live forum with real-time replies and karma." path="/doubts" />
    <div>
      <section style={{ background: 'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock: 'var(--sp-10)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>💬 Doubt Forum</h1>
            <p style={{ color: 'var(--on-surface-muted)' }}>Ask anything. JSS students answer.</p>
          </div>
          {user ? (
            <button className="btn btn-gold btn-lg" onClick={() => setNewDoubt(true)}><Plus size={18} /> Ask a Doubt</button>
          ) : (
            <Link to="/login" className="btn btn-gold btn-lg">Sign in to ask</Link>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 'var(--sp-8)', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--sp-8)', alignItems: 'start' }}>
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} color="var(--on-surface-muted)" />
            <select value={subjectFilter} onChange={e => setSubFilter(e.target.value)} className="input" style={{ width: 'auto', padding: '6px 12px' }}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div style={{ display: 'flex', background: 'var(--surface-mid)', borderRadius: 'var(--radius-full)', padding: 3 }}>
              {['all', 'open', 'resolved'].map(f => (
                <button key={f} onClick={() => setStFilter(f)} style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: statusFilter === f ? 'white' : 'transparent', color: statusFilter === f ? 'var(--on-surface)' : 'var(--on-surface-muted)', transition: 'all 0.15s', textTransform: 'capitalize' }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--sp-4)' }} />)
          ) : doubts.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🤔</div>
              <h3>No doubts yet</h3>
              <p style={{ color: 'var(--on-surface-muted)' }}>Be the first to ask something!</p>
            </div>
          ) : doubts.map(d => (
            <Link key={d.id} to={`/doubts/${d.id}`} className="doubt-card" style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
                {(d.subjects as any)?.name && <span className="badge badge-primary">{(d.subjects as any).name}</span>}
                <span className={`badge ${d.status === 'resolved' ? 'badge-lime' : 'badge-amber'}`}>
                  {d.status === 'resolved' ? <CheckCircle size={11} /> : null} {d.status}
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--sp-2)' }}>{d.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-muted)', lineHeight: 1.6, marginBottom: 'var(--sp-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', fontSize: 13, color: 'var(--on-surface-muted)' }}>
                <span>{(d.profiles as any)?.full_name}</span>
                <span>·</span><span>{fmtDate(d.created_at)}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--sp-3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={14} />{(d.doubt_replies as any)?.[0]?.count ?? 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', position: 'sticky', top: 80 }}>
          <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)' }}>💡 How It Works</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-muted)', lineHeight: 1.7 }}>
              Post a doubt → peers answer → upvote the best reply → mark it accepted → reply author gets +5 karma.
            </div>
          </div>
          <div className="glass-card" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--sp-4)' }}>🔥 Most Active</div>
            {doubts.filter(d => d.status === 'open').slice(0, 3).map(d => (
              <Link key={d.id} to={`/doubts/${d.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 'var(--sp-3)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>{(d.doubt_replies as any)?.[0]?.count ?? 0} replies</div>
                <div className="divider" style={{ marginTop: 'var(--sp-3)' }} />
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* New doubt modal */}
      {newDoubt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(25,27,36,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--sp-8)', maxWidth: 520, width: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 'var(--sp-5)' }}>Ask a Doubt</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div>
                <label>Subject</label>
                <select className="input" value={ndSubject} onChange={e => setNdSubject(e.target.value)} style={{ marginTop: 6 }}>
                  <option value="">Select subject…</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label>Title</label>
                <input className="input" value={ndTitle} onChange={e => setNdTitle(e.target.value)} placeholder="e.g. Difference between paging and segmentation?" style={{ marginTop: 6 }} />
              </div>
              <div>
                <label>Body</label>
                <textarea className="input" rows={4} value={ndBody} onChange={e => setNdBody(e.target.value)} placeholder="Describe your doubt in detail…" style={{ marginTop: 6 }} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setNewDoubt(false)}>Cancel</button>
                <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={submitDoubt} disabled={posting || !ndTitle.trim() || !ndBody.trim()}>
                  {posting ? 'Posting…' : 'Post Doubt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && <button className="fab" onClick={() => setNewDoubt(true)} aria-label="Ask a Doubt"><Plus size={22} /></button>}
    </div>
    </AnimatedPage>
  )
}
