import { useState } from 'react'
import { Link } from 'react-router-dom'

const TABS = ['Quiz Champions', 'Top Contributors', 'Doubt Solvers']
const FILTERS_TIME = ['This Week', 'This Month', 'All Time']
const FILTERS_YEAR = ['All Years', '1st Year', '2nd Year']

const DATA = {
  'Quiz Champions': [
    { rank:1, initials:'AK', name:'Arjun Kumar', year:'2nd Year · CSE', points:1840, trend:'+2' },
    { rank:2, initials:'PS', name:'Priya Sharma', year:'2nd Year · IT', points:1725, trend:'+5' },
    { rank:3, initials:'RM', name:'Rahul Mehta', year:'2nd Year · ECE', points:1601, trend:'-1' },
    { rank:4, initials:'SV', name:'Sneha Verma', year:'2nd Year · CSE', points:1420, trend:'+1' },
    { rank:5, initials:'NT', name:'Nikhil Tiwari', year:'2nd Year · IT', points:1310, trend:'0' },
    { rank:6, initials:'AP', name:'Ananya Patel', year:'2nd Year · CSE', points:1200, trend:'+3' },
  ],
  'Top Contributors': [
    { rank:1, initials:'PS', name:'Priya Sharma', year:'2nd Year · IT', points:340, trend:'+10' },
    { rank:2, initials:'AK', name:'Arjun Kumar', year:'2nd Year · CSE', points:290, trend:'+8' },
    { rank:3, initials:'MK', name:'Mohit Khanna', year:'2nd Year · ECE', points:215, trend:'+3' },
    { rank:4, initials:'DG', name:'Divya Gupta', year:'2nd Year · CSE', points:198, trend:'+2' },
    { rank:5, initials:'VR', name:'Vivek Rao', year:'2nd Year · IT', points:176, trend:'+1' },
  ],
  'Doubt Solvers': [
    { rank:1, initials:'RM', name:'Rahul Mehta', year:'2nd Year · ECE', points:127, trend:'+4' },
    { rank:2, initials:'AK', name:'Arjun Kumar', year:'2nd Year · CSE', points:98, trend:'+2' },
    { rank:3, initials:'KG', name:'Kartik Gupta', year:'2nd Year · CSE', points:84, trend:'+6' },
  ],
}

const PODIUM_COLORS = ['#f7dd7d', '#e8e8e8', '#cd7f32']
const PODIUM_LABELS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [tab, setTab] = useState(0)
  const [timeFilter, setTimeFilter] = useState(0)
  const [yearFilter, setYearFilter] = useState(0)

  const rows = DATA[TABS[tab] as keyof typeof DATA] ?? []
  const podium = rows.slice(0, 3)
  const list = rows.slice(3)

  return (
    <div>
      <section style={{ background:'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock:'var(--sp-10)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, marginBottom:'var(--sp-2)' }}>🏆 League Standings</h1>
          <p style={{ color:'var(--on-surface-muted)' }}>Top performers at JSS University</p>
        </div>
      </section>

      <div className="container" style={{ paddingBlock:'var(--sp-8)' }}>
        {/* Tab switcher */}
        <div style={{ display:'flex', background:'var(--surface-mid)', borderRadius:'var(--radius-full)', padding:3, marginBottom:'var(--sp-8)', maxWidth:500, margin:'0 auto var(--sp-8)' }}>
          {TABS.map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{ flex:1, padding:'8px 12px', borderRadius:'var(--radius-full)', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background: tab===i ? 'var(--primary)' : 'transparent', color: tab===i ? 'white' : 'var(--on-surface-muted)', transition:'all 0.15s' }}>{t}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'var(--sp-3)', marginBottom:'var(--sp-6)', flexWrap:'wrap' }}>
          <div style={{ display:'flex', background:'var(--surface-mid)', borderRadius:'var(--radius-full)', padding:3, gap:2 }}>
            {FILTERS_TIME.map((f,i)=><button key={i} onClick={()=>setTimeFilter(i)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:timeFilter===i?'white':'transparent', color:timeFilter===i?'var(--on-surface)':'var(--on-surface-muted)', boxShadow:timeFilter===i?'var(--shadow-card)':'none', transition:'all 0.15s' }}>{f}</button>)}
          </div>
          <div style={{ display:'flex', background:'var(--surface-mid)', borderRadius:'var(--radius-full)', padding:3, gap:2 }}>
            {FILTERS_YEAR.map((f,i)=><button key={i} onClick={()=>setYearFilter(i)} style={{ padding:'5px 14px', borderRadius:'var(--radius-full)', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:yearFilter===i?'white':'transparent', color:yearFilter===i?'var(--on-surface)':'var(--on-surface-muted)', boxShadow:yearFilter===i?'var(--shadow-card)':'none', transition:'all 0.15s' }}>{f}</button>)}
          </div>
        </div>

        {/* Podium */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'var(--sp-4)', marginBottom:'var(--sp-8)', flexWrap:'wrap' }}>
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((p,i)=>{
            const realRank = i===0?2:i===1?1:3
            const heights = [110, 140, 90]
            return (
              <div key={i} style={{ textAlign:'center', width:140 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:PODIUM_COLORS[realRank-1], margin:'0 auto var(--sp-3)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20, boxShadow:`0 4px 16px rgba(0,0,0,0.12)` }}>{p?.initials}</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{p?.name}</div>
                <div style={{ fontSize:11, color:'var(--on-surface-muted)', marginBottom:'var(--sp-3)' }}>{p?.year}</div>
                <div style={{ height:heights[i], background:`linear-gradient(180deg, ${PODIUM_COLORS[realRank-1]}, ${PODIUM_COLORS[realRank-1]}88)`, borderRadius:'var(--radius-md) var(--radius-md) 0 0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
                  <div style={{ fontSize:22 }}>{PODIUM_LABELS[realRank-1]}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:16 }}>{p?.points?.toLocaleString()}</div>
                  <div style={{ fontSize:11, opacity:0.7 }}>pts</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ranked List */}
        <div className="glass-card" style={{ padding:'var(--sp-4)' }}>
          {list.map(row=>(
            <Link key={row.rank} to={`/profile/${row.name.toLowerCase().replace(' ','-')}`} className="leaderboard-row" style={{ textDecoration:'none', color:'inherit' }}>
              <div className="rank-badge rank-n">#{row.rank}</div>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{row.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>{row.name}</div>
                <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>{row.year}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--primary)' }}>{row.points.toLocaleString()}</div>
                <div style={{ fontSize:12, color: row.trend.startsWith('+') ? '#16a34a' : row.trend === '0' ? 'var(--on-surface-muted)' : 'var(--danger)' }}>{row.trend==='0'?'—':row.trend}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
