import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, BookOpen, Bell, Star, TrendingUp, Eye } from 'lucide-react'

const BADGES = [
  { icon:'🚀', label:'Early Adopter', desc:'Joined in launch week' },
  { icon:'📤', label:'First Upload', desc:'Uploaded first material' },
  { icon:'🏆', label:'Quiz Champion', desc:'Ranked #1 in a quiz' },
  { icon:'⭐', label:'Top Contributor', desc:'10+ approved materials' },
]

const ACTIVITY = [
  { type:'quiz', text:'Scored 92% on OS — Process Scheduling Quiz', time:'2h ago', icon:'⚡' },
  { type:'upload', text:'Your upload "Unit 2 Memory Management" was approved', time:'1d ago', icon:'✅' },
  { type:'reply', text:'Priya answered your doubt about paging', time:'2d ago', icon:'💬' },
  { type:'karma', text:'+10 karma for approved upload', time:'1d ago', icon:'🌟' },
]

export default function ProfilePage() {
  const [tab, setTab] = useState<'bookmarks'|'history'|'notifications'>('bookmarks')

  return (
    <div>
      {/* Profile Header */}
      <section style={{ background:'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock:'var(--sp-10)' }}>
        <div className="container">
          <div style={{ display:'flex', gap:'var(--sp-8)', alignItems:'flex-start', flexWrap:'wrap' }}>
            {/* Avatar */}
            <div style={{ position:'relative' }}>
              <div style={{ width:96, height:96, borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), #7b8fff)', color:'white', fontWeight:800, fontSize:36, display:'flex', alignItems:'center', justifyContent:'center', border:'4px solid white', boxShadow:'var(--shadow-float)' }}>K</div>
              <div style={{ position:'absolute', bottom:4, right:4, width:24, height:24, borderRadius:'50%', background:'#10b981', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'white' }}/>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-2)' }}>
                <h1 style={{ fontSize:28, fontWeight:800 }}>Kartik Gupta</h1>
                <span className="badge badge-primary">Admin</span>
              </div>
              <div style={{ fontSize:14, color:'var(--on-surface-muted)', marginBottom:'var(--sp-4)' }}>2nd Year · CSE · JSS University Noida</div>

              {/* Stats row */}
              <div style={{ display:'flex', gap:'var(--sp-6)', flexWrap:'wrap' }}>
                {[
                  { icon:<Trophy size={16} color="var(--primary)"/>, label:'Quiz Rank', value:'#3', mono:true },
                  { icon:<Star size={16} color="#f7dd7d"/>, label:'Karma', value:'840', mono:true },
                  { icon:<BookOpen size={16} color="#10b981"/>, label:'Materials', value:'14', mono:true },
                  { icon:<TrendingUp size={16} color="#f59e0b"/>, label:'Contributor Rank', value:'#2', mono:true },
                ].map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
                    {s.icon}
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:18, color:'var(--on-surface)' }}>{s.value}</div>
                      <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-ghost">Edit Profile</button>
          </div>

          {/* Badges */}
          <div style={{ display:'flex', gap:'var(--sp-3)', marginTop:'var(--sp-6)', flexWrap:'wrap' }}>
            {BADGES.map((b,i)=>(
              <div key={i} title={b.desc} style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', padding:'6px 14px', background:'rgba(255,255,255,0.8)', borderRadius:'var(--radius-full)', fontSize:13, fontWeight:600, border:'1px solid rgba(255,255,255,0.6)', cursor:'default' }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--outline-variant)', background:'var(--bg)' }}>
        <div className="container" style={{ display:'flex', gap:4 }}>
          {(['bookmarks','history','notifications'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'12px 20px', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, background:'transparent', color: tab===t ? 'var(--primary)' : 'var(--on-surface-muted)', borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent', transition:'all 0.15s', textTransform:'capitalize' }}>
              {t==='bookmarks'?<><BookOpen size={15} style={{verticalAlign:'middle',marginRight:6}}/>Bookmarks</>:t==='history'?<><Eye size={15} style={{verticalAlign:'middle',marginRight:6}}/>Quiz History</>:<><Bell size={15} style={{verticalAlign:'middle',marginRight:6}}/>Notifications</>}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBlock:'var(--sp-8)' }}>
        {tab === 'bookmarks' && (
          <div className="glass-card" style={{ padding:'var(--sp-12)', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>🔖</div>
            <h3 style={{ marginBottom:'var(--sp-2)' }}>No bookmarks yet</h3>
            <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-5)' }}>Bookmark any material to access it instantly on exam morning.</p>
            <Link to="/year/2" className="btn btn-primary">Browse Materials</Link>
          </div>
        )}
        {tab === 'history' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
            {[
              { title:'OS — Process Scheduling', score:92, date:'2h ago' },
              { title:'DBMS — SQL Fundamentals', score:76, date:'2d ago' },
              { title:'CN — TCP/IP Deep Dive', score:84, date:'1w ago' },
            ].map((h,i)=>(
              <div key={i} className="glass-card" style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:28, fontWeight:700, color: h.score>=80?'#16a34a':h.score>=60?'var(--warn)':'var(--danger)', minWidth:60, textAlign:'center' }}>{h.score}%</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{h.title}</div>
                  <div style={{ fontSize:13, color:'var(--on-surface-muted)' }}>{h.date}</div>
                </div>
                <div className="progress-bar" style={{ width:100 }}>
                  <div className="progress-fill" style={{ width:`${h.score}%` }}/>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'notifications' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
            {ACTIVITY.map((a,i)=>(
              <div key={i} className="glass-card" style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
                <div style={{ fontSize:24, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{a.text}</div>
                  <div style={{ fontSize:12, color:'var(--on-surface-muted)', marginTop:4 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
