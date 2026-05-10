import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Bookmark, Download, ExternalLink, Sparkles, Trophy, Plus, FileText, Video, ClipboardList } from 'lucide-react'

const TABS = [
  { key:'notes', label:'Notes', icon:<FileText size={15}/> },
  { key:'summaries', label:'Summaries', icon:<Sparkles size={15}/> },
  { key:'tests', label:'Unit Tests', icon:<ClipboardList size={15}/> },
  { key:'videos', label:'Videos', icon:<Video size={15}/> },
]

const MOCK_MATERIALS = [
  { id:'m1', title:'Unit 1 — Process Management & Scheduling Algorithms', type:'full_notes', uploader:'Arjun K.', date:'2 days ago', ai:false },
  { id:'m2', title:'AI Summary: Process Management', type:'summary', uploader:'AI', date:'1 day ago', ai:true },
  { id:'m3', title:'CIE 1 Paper — March 2024', type:'unit_test', uploader:'Priya S.', date:'5 days ago', ai:false },
  { id:'m4', title:'Process Scheduling — Full Playlist', type:'youtube', uploader:'Admin', date:'1 week ago', ai:false },
  { id:'m5', title:'Unit 2 — Memory Management & Paging', type:'full_notes', uploader:'Rahul M.', date:'3 days ago', ai:false },
  { id:'m6', title:'AI Summary: Memory Management', type:'summary', uploader:'AI', date:'2 days ago', ai:true },
]

const TYPE_BADGE: Record<string, { label:string; cls:string }> = {
  full_notes: { label:'Full Notes', cls:'badge-primary' },
  summary:    { label:'AI Summary', cls:'badge-ai' },
  unit_test:  { label:'Unit Test', cls:'badge-amber' },
  youtube:    { label:'Video', cls:'badge-red' },
}

const SIDEBAR_DOUBTS = [
  { id:'d1', title:'Difference between paging & segmentation?', replies:4 },
  { id:'d2', title:'How does LRU work with multiple processes?', replies:7 },
  { id:'d3', title:'Explain Banker\'s Algorithm step by step', replies:2 },
]

export default function SubjectPage() {
  const { id = 'JCS-403', year = '2' } = useParams()
  const [activeTab, setActiveTab] = useState('notes')

  const filtered = MOCK_MATERIALS.filter(m => {
    if (activeTab === 'notes') return m.type === 'full_notes'
    if (activeTab === 'summaries') return m.type === 'summary'
    if (activeTab === 'tests') return m.type === 'unit_test'
    if (activeTab === 'videos') return m.type === 'youtube'
    return false
  })

  const counts = {
    notes: MOCK_MATERIALS.filter(m=>m.type==='full_notes').length,
    summaries: MOCK_MATERIALS.filter(m=>m.type==='summary').length,
    tests: MOCK_MATERIALS.filter(m=>m.type==='unit_test').length,
    videos: MOCK_MATERIALS.filter(m=>m.type==='youtube').length,
  }

  return (
    <div>
      {/* Sticky header */}
      <div style={{ background:'var(--surface-mid)', borderBottom:'1px solid var(--outline-variant)', position:'sticky', top:64, zIndex:50 }}>
        <div className="container" style={{ paddingBlock:'var(--sp-4)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'var(--sp-3)' }}>
          <div>
            <div style={{ fontSize:12, color:'var(--on-surface-muted)', marginBottom:4 }}>
              <Link to={`/year/${year}`} style={{ textDecoration:'none', color:'var(--primary)' }}>2nd Year</Link> / {id}
            </div>
            <h1 style={{ fontSize:22, fontWeight:800 }}>Operating Systems</h1>
          </div>
          <Link to="/upload" className="btn btn-primary btn-sm"><Plus size={15}/> Upload</Link>
        </div>
        {/* Tabs */}
        <div className="container" style={{ display:'flex', gap:4, paddingBottom:0 }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:'var(--radius-md) var(--radius-md) 0 0', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, background: activeTab===t.key ? 'var(--bg)' : 'transparent', color: activeTab===t.key ? 'var(--primary)' : 'var(--on-surface-muted)', borderBottom: activeTab===t.key ? '2px solid var(--primary)' : '2px solid transparent', transition:'all 0.15s' }}>
              {t.icon} {t.label} <span className="badge badge-primary" style={{ fontSize:11 }}>{counts[t.key as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop:'var(--sp-6)', paddingBottom:'var(--sp-10)', display:'grid', gridTemplateColumns:'1fr 300px', gap:'var(--sp-8)', alignItems:'start' }}>
        {/* Material list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
          {filtered.length === 0 ? (
            <div className="glass-card" style={{ padding:'var(--sp-12)', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>📭</div>
              <h3 style={{ marginBottom:'var(--sp-2)' }}>Nothing here yet</h3>
              <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-4)' }}>First to upload here gets +20 bonus karma!</p>
              <Link to="/upload" className="btn btn-primary">Upload Material</Link>
            </div>
          ) : filtered.map(m => (
            <Link key={m.id} to={`/material/${m.id}`} className="material-row">
              <div>
                <span className={`badge ${TYPE_BADGE[m.type].cls}`}>
                  {m.ai && <Sparkles size={11}/>} {TYPE_BADGE[m.type].label}
                </span>
              </div>
              <div className="material-row-title">{m.title}</div>
              <div className="material-row-meta">
                <span>{m.uploader}</span>
                <span>·</span>
                <span>{m.date}</span>
                <button style={{ border:'none', background:'none', cursor:'pointer', color:'var(--on-surface-muted)', display:'flex' }} aria-label="Bookmark"><Bookmark size={16}/></button>
                <button style={{ border:'none', background:'none', cursor:'pointer', color:'var(--on-surface-muted)', display:'flex' }} aria-label="Download"><Download size={16}/></button>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar */}
        <aside style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', position:'sticky', top:160 }}>
          <div className="glass-card" style={{ padding:'var(--sp-5)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', marginBottom:'var(--sp-4)', fontWeight:700 }}>
              <Trophy size={16} color="var(--primary)"/> Quick Quiz
            </div>
            <p style={{ fontSize:13, color:'var(--on-surface-muted)', marginBottom:'var(--sp-4)' }}>Test your Operating Systems knowledge right now.</p>
            <Link to="/quiz/q1" className="btn btn-gold" style={{ width:'100%', justifyContent:'center' }}>Start Quiz ⚡</Link>
          </div>

          <div className="glass-card" style={{ padding:'var(--sp-5)' }}>
            <div style={{ fontWeight:700, marginBottom:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
              <BookOpen size={16} color="var(--primary)"/> Top Doubts
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {SIDEBAR_DOUBTS.map(d=>(
                <Link key={d.id} to={`/doubts`} style={{ textDecoration:'none', color:'inherit' }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{d.title}</div>
                  <div style={{ fontSize:12, color:'var(--primary)' }}>{d.replies} replies</div>
                  <div className="divider"/>
                </Link>
              ))}
            </div>
            <Link to="/doubts" className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:'var(--sp-2)' }}>
              View all doubts <ExternalLink size={13}/>
            </Link>
          </div>
        </aside>
      </div>

      {/* Upload FAB */}
      <Link to="/upload" className="fab" aria-label="Upload"><Plus size={22}/></Link>
    </div>
  )
}
