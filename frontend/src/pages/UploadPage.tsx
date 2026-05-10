import { useState } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const SUBJECTS = ['Operating Systems','Computer Networks','DBMS','Software Engineering','Discrete Mathematics','Theory of Automata','OOPS in Java','COA']
const TYPES = [
  { value:'full_notes', label:'📄 Full Notes' },
  { value:'unit_test', label:'📝 Unit Test / CIE Paper' },
  { value:'youtube', label:'🎥 YouTube Video Link' },
]

const SUBMISSIONS = [
  { title:'Unit 2 — Memory Management', status:'approved', time:'1d ago' },
  { title:'CIE 1 Paper March 2024', status:'pending', time:'3h ago' },
  { title:'OS Lecture Notes Unit 3', status:'rejected', reason:'Duplicate content already exists', time:'2d ago' },
]

const STATUS_BADGE: Record<string, string> = { approved:'badge-lime', pending:'badge-amber', rejected:'badge-red' }

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [type, setType] = useState('full_notes')
  const [submitted, setSubmitted] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  if (submitted) return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="glass-card" style={{ padding:'var(--sp-10)', maxWidth:420, width:'100%', textAlign:'center' }}>
        <CheckCircle size={56} color="#16a34a" style={{ marginBottom:'var(--sp-4)' }}/>
        <h2 style={{ fontSize:24, marginBottom:'var(--sp-3)' }}>Sent for Approval!</h2>
        <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-6)' }}>You'll get notified once admin reviews your submission. Approved materials earn you karma points.</p>
        <div style={{ display:'flex', gap:'var(--sp-3)', justifyContent:'center' }}>
          <button className="btn btn-ghost" onClick={()=>setSubmitted(false)}>Upload Another</button>
          <Link to="/year/2" className="btn btn-primary">Browse Subjects</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container" style={{ maxWidth:700, paddingBlock:'var(--sp-10)' }}>
      <h1 style={{ fontSize:28, fontWeight:800, marginBottom:'var(--sp-2)' }}>Upload Material</h1>
      <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-8)' }}>Share notes, tests, or videos. Earn karma when it's approved.</p>

      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-6)' }}>
        {/* Type selector */}
        <div>
          <label style={{ marginBottom:'var(--sp-3)', display:'block' }}>What are you uploading?</label>
          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
            {TYPES.map(t=>(
              <button key={t.value} onClick={()=>setType(t.value)} style={{ padding:'10px 18px', borderRadius:'var(--radius-md)', border:'2px solid', borderColor:type===t.value?'var(--primary)':'var(--outline-variant)', background:type===t.value?'var(--primary-light)':'transparent', fontWeight:600, cursor:'pointer', fontSize:14, color:type===t.value?'var(--primary)':'var(--on-surface-muted)', transition:'all 0.15s' }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* File drop */}
        {type !== 'youtube' && (
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            style={{ border:`2px dashed ${dragOver?'var(--primary)':'var(--outline-variant)'}`, borderRadius:'var(--radius-lg)', padding:'var(--sp-10)', textAlign:'center', background:dragOver?'var(--primary-light)':'var(--surface-low)', transition:'all 0.15s', cursor:'pointer' }}
            onClick={()=>document.getElementById('file-input')?.click()}>
            <input id="file-input" type="file" accept=".pdf" style={{ display:'none' }} onChange={e=>{ if(e.target.files?.[0]) setFile(e.target.files[0]) }}/>
            {file ? (
              <>
                <div style={{ fontSize:40, marginBottom:'var(--sp-3)' }}>📄</div>
                <div style={{ fontWeight:700 }}>{file.name}</div>
                <div style={{ fontSize:13, color:'var(--on-surface-muted)', marginTop:4 }}>{(file.size/1024/1024).toFixed(2)} MB</div>
                <button onClick={e=>{e.stopPropagation();setFile(null)}} style={{ marginTop:'var(--sp-3)', background:'none', border:'none', cursor:'pointer', color:'var(--danger)', display:'flex', alignItems:'center', gap:4, margin:'var(--sp-3) auto 0' }}><X size={14}/>Remove</button>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--outline)" style={{ marginBottom:'var(--sp-3)' }}/>
                <div style={{ fontWeight:600 }}>Drag & drop your PDF here</div>
                <div style={{ fontSize:13, color:'var(--on-surface-muted)', marginTop:4 }}>or click to browse • PDF only • max 25MB</div>
              </>
            )}
          </div>
        )}

        {/* Form fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
          <div>
            <label>Year</label>
            <select className="input"><option>2nd Year</option><option>1st Year</option></select>
          </div>
          <div>
            <label>Subject</label>
            <select className="input">
              <option value="">Select subject...</option>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label>Title</label>
          <input className="input" placeholder="e.g. Unit 1 — Process Management Notes"/>
        </div>
        <div>
          <label>Description (optional)</label>
          <textarea className="input" rows={3} placeholder="Brief description of what's covered..."/>
        </div>

        {type === 'youtube' && (
          <div>
            <label>YouTube URL</label>
            <input className="input" placeholder="https://youtube.com/..."/>
          </div>
        )}

        <button className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'13px 28px', fontSize:16 }} onClick={()=>setSubmitted(true)}>
          Send for Approval ✓
        </button>
      </div>

      {/* Submission history */}
      <div style={{ marginTop:'var(--sp-12)' }}>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'var(--sp-4)' }}>Your Recent Submissions</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
          {SUBMISSIONS.map((s,i)=>(
            <div key={i} className="glass-card" style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{s.title}</div>
                {s.status==='rejected' && <div style={{ fontSize:12, color:'var(--danger)', marginTop:4 }}>Rejected: {s.reason}</div>}
                <div style={{ fontSize:12, color:'var(--on-surface-muted)', marginTop:4 }}>{s.time}</div>
              </div>
              <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
