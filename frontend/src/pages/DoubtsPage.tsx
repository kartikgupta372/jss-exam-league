import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MessageCircle, ThumbsUp, CheckCircle, Filter } from 'lucide-react'

const SUBJECTS = ['All Subjects','Operating Systems','Computer Networks','DBMS','Software Engineering']
const STATUSES = ['All','Open','Resolved']

const DOUBTS = [
  { id:'d1', title:'Difference between paging and segmentation?', body:'I understand paging divides memory into fixed-size pages, but how exactly does segmentation differ? My book gives a confusing explanation.', subject:'Operating Systems', replies:7, upvotes:12, status:'open', author:'Priya S.', time:'2h ago' },
  { id:'d2', title:'How does Banker\'s algorithm prevent deadlock?', body:'Can someone walk me through the safety algorithm step by step with an example? The textbook explanation is very dense.', subject:'Operating Systems', replies:4, upvotes:8, status:'resolved', author:'Nikhil T.', time:'5h ago' },
  { id:'d3', title:'SQL JOIN vs subquery performance?', body:'When should I use a JOIN instead of a subquery? Is there a general rule of thumb?', subject:'DBMS', replies:9, upvotes:15, status:'resolved', author:'Ananya P.', time:'1d ago' },
  { id:'d4', title:'Three-way handshake explained simply?', body:'I keep confusing the SYN, SYN-ACK, ACK steps. Is there a good analogy to remember this?', subject:'Computer Networks', replies:3, upvotes:6, status:'open', author:'Kartik G.', time:'3h ago' },
  { id:'d5', title:'What is the difference between process and thread?', body:'I know processes have their own memory space but I\'m confused about how threads share memory. Please explain.', subject:'Operating Systems', replies:11, upvotes:20, status:'resolved', author:'Rahul M.', time:'2d ago' },
]

export default function DoubtsPage() {
  const [subjectFilter, setSubjectFilter] = useState(0)
  const [statusFilter, setStatusFilter] = useState(0)
  const [sort, setSort] = useState('newest')

  const filtered = DOUBTS.filter(d => {
    const matchSub = subjectFilter === 0 || d.subject === SUBJECTS[subjectFilter]
    const matchStat = statusFilter === 0 || d.status === STATUSES[statusFilter].toLowerCase()
    return matchSub && matchStat
  })

  return (
    <div>
      {/* Header */}
      <section style={{ background:'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock:'var(--sp-10)' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'var(--sp-4)' }}>
          <div>
            <h1 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:800, marginBottom:'var(--sp-2)' }}>💬 Doubt Forum</h1>
            <p style={{ color:'var(--on-surface-muted)' }}>Ask anything. JSS students answer.</p>
          </div>
          <Link to="/doubts/new" className="btn btn-gold btn-lg"><Plus size={18}/> Ask a Doubt</Link>
        </div>
      </section>

      <div className="container" style={{ paddingBlock:'var(--sp-8)', display:'grid', gridTemplateColumns:'1fr 280px', gap:'var(--sp-8)', alignItems:'start' }}>
        {/* Main feed */}
        <div>
          {/* Filters */}
          <div style={{ display:'flex', gap:'var(--sp-3)', marginBottom:'var(--sp-6)', flexWrap:'wrap', alignItems:'center' }}>
            <Filter size={16} color="var(--on-surface-muted)"/>
            <select value={subjectFilter} onChange={e=>setSubjectFilter(+e.target.value)} className="input" style={{ width:'auto', padding:'6px 12px' }}>
              {SUBJECTS.map((s,i)=><option key={i} value={i}>{s}</option>)}
            </select>
            <div style={{ display:'flex', background:'var(--surface-mid)', borderRadius:'var(--radius-full)', padding:3 }}>
              {STATUSES.map((s,i)=><button key={i} onClick={()=>setStatusFilter(i)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:statusFilter===i?'white':'transparent', color:statusFilter===i?'var(--on-surface)':'var(--on-surface-muted)', transition:'all 0.15s' }}>{s}</button>)}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="input" style={{ width:'auto', padding:'6px 12px', marginLeft:'auto' }}>
              <option value="newest">Newest</option>
              <option value="replies">Most Replies</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>

          {/* Cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
            {filtered.map(d=>(
              <Link key={d.id} to={`/doubts/${d.id}`} className="doubt-card">
                <div style={{ display:'flex', gap:'var(--sp-3)', marginBottom:'var(--sp-3)', flexWrap:'wrap' }}>
                  <span className="badge badge-primary">{d.subject}</span>
                  <span className={`badge ${d.status==='resolved'?'badge-lime':'badge-amber'}`}>
                    {d.status==='resolved'?<CheckCircle size={11}/>:null} {d.status}
                  </span>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'var(--sp-2)' }}>{d.title}</h3>
                <p style={{ fontSize:14, color:'var(--on-surface-muted)', lineHeight:1.6, marginBottom:'var(--sp-4)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{d.body}</p>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-4)', fontSize:13, color:'var(--on-surface-muted)' }}>
                  <span>{d.author}</span>
                  <span>·</span>
                  <span>{d.time}</span>
                  <div style={{ marginLeft:'auto', display:'flex', gap:'var(--sp-3)' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MessageCircle size={14}/>{d.replies}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><ThumbsUp size={14}/>{d.upvotes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', position:'sticky', top:80 }}>
          <div className="glass-card" style={{ padding:'var(--sp-5)' }}>
            <div style={{ fontWeight:700, marginBottom:'var(--sp-4)' }}>📌 Your Open Doubts</div>
            <div style={{ fontSize:13, color:'var(--on-surface-muted)' }}>Sign in to see your doubts here.</div>
            <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop:'var(--sp-4)', width:'100%', justifyContent:'center' }}>Sign In</Link>
          </div>
          <div className="glass-card" style={{ padding:'var(--sp-5)' }}>
            <div style={{ fontWeight:700, marginBottom:'var(--sp-4)' }}>🔥 Most Helpful This Week</div>
            {DOUBTS.filter(d=>d.status==='resolved').slice(0,3).map(d=>(
              <Link key={d.id} to={`/doubts/${d.id}`} style={{ textDecoration:'none', color:'inherit', display:'block', marginBottom:'var(--sp-3)' }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{d.title}</div>
                <div style={{ fontSize:12, color:'var(--primary)', marginTop:2 }}>{d.replies} replies · {d.upvotes} upvotes</div>
                <div className="divider" style={{ marginTop:'var(--sp-3)' }}/>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* FAB */}
      <Link to="/doubts/new" className="fab" aria-label="Ask a Doubt"><Plus size={22}/></Link>
    </div>
  )
}
