import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, Download, Share2, Flag, Sparkles, ChevronLeft } from 'lucide-react'

export default function MaterialPage() {
  const { id } = useParams()
  const [bookmarked, setBookmarked] = useState(false)
  const isAI = id === 'm2' || id === 'm6'

  return (
    <div>
      <div style={{ background:'var(--surface-mid)', borderBottom:'1px solid var(--outline-variant)', padding:'var(--sp-3) 0' }}>
        <div className="container">
          <Link to="/year/2/subject/JCS-403" style={{ textDecoration:'none', color:'var(--primary)', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
            <ChevronLeft size={15}/> Back to Operating Systems
          </Link>
        </div>
      </div>

      <div className="container" style={{ paddingBlock:'var(--sp-8)', display:'grid', gridTemplateColumns:'1fr 280px', gap:'var(--sp-8)', alignItems:'start' }}>
        {/* PDF Viewer placeholder */}
        <div>
          <div style={{ background:'var(--on-surface)', borderRadius:'var(--radius-lg)', overflow:'hidden', aspectRatio:'1/1.3', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'var(--sp-4)', color:'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize:64 }}>📄</div>
            <div style={{ fontSize:16, fontWeight:600, color:'white' }}>PDF Viewer</div>
            <div style={{ fontSize:13, textAlign:'center', maxWidth:280 }}>
              The react-pdf-viewer component will render here once connected to Supabase Storage.
            </div>
          </div>
        </div>

        {/* Metadata + Actions sidebar */}
        <aside style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', position:'sticky', top:80 }}>
          {isAI && (
            <div className="badge badge-ai" style={{ alignSelf:'flex-start', padding:'6px 14px', fontSize:13 }}>
              <Sparkles size={14}/> AI-Generated Summary
            </div>
          )}
          <h1 style={{ fontSize:20, fontWeight:800, lineHeight:1.3 }}>
            Unit 1 — Process Management & Scheduling Algorithms
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>AK</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Arjun K.</div>
              <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>Uploaded 2 days ago</div>
            </div>
          </div>

          <div className="divider"/>

          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Subject</span>
              <span style={{ fontWeight:600 }}>Operating Systems</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Type</span>
              <span className="badge badge-primary">Full Notes</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Views</span>
              <span style={{ fontWeight:600, fontFamily:'var(--font-mono)' }}>248</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Downloads</span>
              <span style={{ fontWeight:600, fontFamily:'var(--font-mono)' }}>87</span>
            </div>
          </div>

          <div className="divider"/>

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
            <button onClick={()=>setBookmarked(b=>!b)} className="btn btn-ghost" style={{ justifyContent:'center', color: bookmarked ? 'var(--primary)' : undefined }}>
              <Bookmark size={16} fill={bookmarked ? 'var(--primary)' : 'none'}/> {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button className="btn btn-primary" style={{ justifyContent:'center' }}>
              <Download size={16}/> Download PDF
            </button>
            <button className="btn btn-ghost" style={{ justifyContent:'center' }}>
              <Share2 size={16}/> Share on WhatsApp
            </button>
            <button className="btn btn-ghost" style={{ justifyContent:'center', color:'var(--danger)', borderColor:'var(--danger)' }}>
              <Flag size={16}/> Report
            </button>
          </div>

          {isAI && (
            <>
              <div className="divider"/>
              <div style={{ background:'var(--surface-low)', borderRadius:'var(--radius-md)', padding:'var(--sp-4)', fontSize:13, color:'var(--on-surface-muted)' }}>
                <strong style={{ color:'var(--on-surface)' }}>Source Material:</strong><br/>
                <Link to="/material/m1" style={{ color:'var(--primary)' }}>Unit 1 — Process Management & Scheduling Algorithms</Link>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Related materials */}
      <div className="container" style={{ paddingBottom:'var(--sp-10)' }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:'var(--sp-4)' }}>Related Materials</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
          {['Unit 2 — Memory Management & Paging', 'Unit 3 — File Systems & I/O'].map((t,i)=>(
            <Link key={i} to={`/material/m${i+5}`} className="material-row">
              <span className="badge badge-primary">Full Notes</span>
              <div className="material-row-title">{t}</div>
              <div className="material-row-meta"><Download size={15}/><Bookmark size={15}/></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
