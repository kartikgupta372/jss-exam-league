// src/pages/LeaderboardPage.tsx — dual points: leader (semester) + karma (permanent) + doubts
import { useEffect, useState } from 'react'
import { Trophy, Star, Zap, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Entry {
  id: string; display_name: string; avatar_url: string | null
  points: number; branch: string | null; year: number | null; rank: number
}

type TabType = 'leader_2' | 'leader_1' | 'karma' | 'doubts'

const MEDAL = ['🥇','🥈','🥉']

function Avatar({ name, url, size=40 }: { name:string; url:string|null; size?:number }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),#7b8fff)', color:'white', fontWeight:700, fontSize:size*0.35, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
      {url ? <img src={url} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initials}
    </div>
  )
}

export default function LeaderboardPage() {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState<TabType>('leader_2')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [resetModal, setResetModal] = useState(false)
  const [semName, setSemName] = useState('')
  const [resetYear, setResetYear] = useState<1|2>(2)
  const [resetting, setResetting] = useState(false)
  const [toast, setToast] = useState<string|null>(null)
  const [archives, setArchives] = useState<any[]>([])
  const [showArchive, setShowArchive] = useState(false)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let data: Entry[] = []

      if (tab === 'karma') {
        const { data: d } = await supabase
          .from('profiles').select('id,full_name,avatar_url,karma_points,branch,year,anonymous_mode')
          .eq('role','student').gt('karma_points',0)
          .order('karma_points',{ ascending:false }).limit(50)
        data = (d??[]).map((p:any,i:number) => ({
          id:p.id, display_name:p.anonymous_mode?'Anonymous':p.full_name,
          avatar_url:p.avatar_url, points:p.karma_points, branch:p.branch, year:p.year, rank:i+1
        }))
      } else if (tab === 'doubts') {
        const { data: d } = await supabase
          .from('doubt_replies').select('user_id,upvote_count,profiles(full_name,avatar_url,branch,year,anonymous_mode)')
          .order('upvote_count',{ ascending:false }).limit(100)
        const agg: Record<string,any> = {}
        ;(d??[]).forEach((r:any) => {
          const uid = r.user_id
          if (!agg[uid]) agg[uid] = { name:r.profiles?.anonymous_mode?'Anonymous':r.profiles?.full_name, url:r.profiles?.avatar_url, branch:r.profiles?.branch, year:r.profiles?.year, pts:0 }
          agg[uid].pts += r.upvote_count
        })
        data = Object.entries(agg).sort((a,b)=>b[1].pts-a[1].pts).slice(0,20)
          .map(([id,v]:any,i) => ({ id, display_name:v.name, avatar_url:v.url, points:v.pts, branch:v.branch, year:v.year, rank:i+1 }))
      } else {
        const yr = tab === 'leader_1' ? 1 : 2
        const { data: d } = await supabase
          .from('profiles').select('id,full_name,avatar_url,leader_points,branch,year,anonymous_mode')
          .eq('role','student').eq('year',yr).gt('leader_points',0)
          .order('leader_points',{ ascending:false }).limit(50)
        data = (d??[]).map((p:any,i:number) => ({
          id:p.id, display_name:p.anonymous_mode?'Anonymous':p.full_name,
          avatar_url:p.avatar_url, points:p.leader_points, branch:p.branch, year:p.year, rank:i+1
        }))
      }

      setEntries(data)
      setLoading(false)
    }
    load()
  }, [tab])

  const loadArchives = async () => {
    const { data } = await supabase.from('semester_archives').select('*').order('created_at',{ ascending:false }).limit(10)
    setArchives(data ?? [])
  }

  const doReset = async () => {
    if (!semName.trim()) return
    setResetting(true)
    await supabase.rpc('reset_semester_leaderboard', { p_semester_name:semName, p_year_group:resetYear })
    setResetting(false); setResetModal(false); setSemName('')
    showToast(`✅ ${semName} archived & ${resetYear===1?'1st':'2nd'} Year leaderboard reset to zero!`)
    setEntries([])
  }

  const myRank = entries.findIndex(e => e.id === user?.id) + 1

  const TABS = [
    { key:'leader_2' as TabType, label:'2nd Year League',  sub:'Resets each semester', icon:<Trophy size={14}/> },
    { key:'leader_1' as TabType, label:'1st Year League',  sub:'Resets each semester', icon:<Trophy size={14}/> },
    { key:'karma'    as TabType, label:'Top Contributors', sub:'Permanent karma',       icon:<Star size={14}/> },
    { key:'doubts'   as TabType, label:'Doubt Solvers',    sub:'By upvotes received',   icon:<Zap size={14}/> },
  ]

  return (
    <div>
      <section style={{ background:'linear-gradient(135deg,var(--surface-mid) 0%,var(--primary-light) 100%)', paddingBlock:'var(--sp-12)' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'var(--sp-4)' }}>
          <div>
            <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, marginBottom:'var(--sp-2)' }}>🏆 Leaderboard</h1>
            <p style={{ color:'var(--on-surface-muted)' }}>
              {tab.startsWith('leader') ? 'Leader Points — resets every semester · Quizzes (50) · Contests (60) · Full Notes (5)' : tab==='karma' ? 'Karma — permanent · Earned by contributing approved content' : 'Top doubt solvers · Ranked by upvotes received'}
            </p>
          </div>
          <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
            {isAdmin && tab.startsWith('leader') && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={()=>{ loadArchives(); setShowArchive(o=>!o) }}>
                  📂 Archives
                </button>
                <button className="btn btn-danger btn-sm" onClick={()=>setResetModal(true)}>
                  <RefreshCw size={14}/> Reset Semester
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Archive panel */}
      {showArchive && isAdmin && (
        <div style={{ background:'var(--surface-low)', borderBottom:'1px solid var(--outline-variant)', padding:'var(--sp-5) 0' }}>
          <div className="container">
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'var(--sp-4)' }}>📂 Semester Archives</h3>
            {archives.length === 0 ? (
              <p style={{ color:'var(--on-surface-muted)', fontSize:14 }}>No archives yet. Reset a semester to create one.</p>
            ) : archives.map(a => (
              <div key={a.id} className="glass-card" style={{ padding:'var(--sp-4)', marginBottom:'var(--sp-3)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700 }}>{a.semester_name}</div>
                  <div style={{ fontSize:13, color:'var(--on-surface-muted)' }}>{a.year_group===1?'1st':'2nd'} Year · {(a.snapshot as any[])?.length ?? 0} students</div>
                </div>
                <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--outline-variant)', background:'var(--bg)', position:'sticky', top:64, zIndex:50 }}>
        <div className="container" style={{ display:'flex', gap:4, overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 16px', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, background:'transparent', color:tab===t.key?'var(--primary)':'var(--on-surface-muted)', borderBottom:tab===t.key?'2px solid var(--primary)':'2px solid transparent', whiteSpace:'nowrap', transition:'all 0.15s' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBlock:'var(--sp-8)', maxWidth:700 }}>
        {loading ? (
          Array.from({length:5}).map((_,i) => <div key={i} className="skeleton" style={{ height:64, borderRadius:'var(--radius-md)', marginBottom:'var(--sp-3)' }}/>)
        ) : entries.length === 0 ? (
          <div className="glass-card" style={{ padding:'var(--sp-12)', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>🌱</div>
            <h3>No entries yet</h3>
            <p style={{ color:'var(--on-surface-muted)', marginTop:'var(--sp-2)' }}>
              {tab.startsWith('leader') ? 'Take quizzes to earn leader points!' : 'Upload approved content to earn karma!'}
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {entries.length >= 2 && (
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'var(--sp-4)', marginBottom:'var(--sp-10)', paddingTop:'var(--sp-6)' }}>
                {[entries[1],entries[0],entries[2]].filter(Boolean).map((e,i) => {
                  const heights = [140,180,110]
                  return (
                    <div key={e.id} style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <Avatar name={e.display_name} url={e.avatar_url} size={e.rank===1?72:56}/>
                      <div style={{ fontWeight:700, fontSize:13, marginTop:'var(--sp-2)', maxWidth:90 }}>{e.display_name}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--primary)' }}>{e.points.toLocaleString()}</div>
                      <div style={{ marginTop:'var(--sp-3)', height:heights[i], width:80, borderRadius:'var(--radius-md) var(--radius-md) 0 0', background:e.rank===1?'linear-gradient(180deg,#ffd700,#ffb300)':e.rank===2?'linear-gradient(180deg,#e8e8e8,#c0c0c0)':'linear-gradient(180deg,#cd7f32,#a0522d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
                        {MEDAL[e.rank-1]}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
              {entries.map((e,i) => (
                <div key={e.id} className="leaderboard-row" style={{ background:e.id===user?.id?'var(--primary-light)':'transparent', borderRadius:'var(--radius-md)', border:`1.5px solid ${e.id===user?.id?'var(--primary)':'transparent'}` }}>
                  <div className={`rank-badge ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n'}`}>{i+1}</div>
                  <Avatar name={e.display_name} url={e.avatar_url} size={36}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>
                      {e.display_name}
                      {e.id===user?.id && <span className="badge badge-primary" style={{ fontSize:10, marginLeft:6 }}>You</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>{e.year?`${e.year===1?'1st':'2nd'} Year`:''} {e.branch?`· ${e.branch}`:''}</div>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:18, color:tab==='karma'?'#f7dd7d':'var(--primary)' }}>
                    {e.points.toLocaleString()}
                    <span style={{ fontSize:11, fontFamily:'var(--font-sans)', color:'var(--on-surface-muted)', marginLeft:4 }}>{tab==='karma'?'karma':'pts'}</span>
                  </div>
                </div>
              ))}
            </div>

            {myRank > 0 && (
              <div style={{ marginTop:'var(--sp-6)', padding:'var(--sp-4)', background:'var(--primary-light)', borderRadius:'var(--radius-md)', textAlign:'center', fontSize:14 }}>
                You are ranked <strong>#{myRank}</strong>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset modal */}
      {resetModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(25,27,36,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding:'var(--sp-8)', maxWidth:420, width:'100%' }}>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:'var(--sp-2)' }}>🔄 Reset Semester Leaderboard</h3>
            <p style={{ color:'var(--on-surface-muted)', fontSize:14, marginBottom:'var(--sp-5)' }}>
              Snapshots current standings into the archive, then resets all leader points to zero for the selected year group.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
              <div>
                <label>Year Group to Reset</label>
                <div style={{ display:'flex', gap:'var(--sp-3)', marginTop:6 }}>
                  {([1,2] as const).map(y => (
                    <button key={y} onClick={()=>setResetYear(y)} style={{ flex:1, padding:10, borderRadius:'var(--radius-md)', border:'2px solid', borderColor:resetYear===y?'var(--primary)':'var(--outline-variant)', background:resetYear===y?'var(--primary-light)':'transparent', fontWeight:700, cursor:'pointer', color:resetYear===y?'var(--primary)':'var(--on-surface-muted)' }}>
                      {y===1?'1st Year':'2nd Year'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Archive Name</label>
                <input className="input" value={semName} onChange={e=>setSemName(e.target.value)} placeholder="e.g. Sem 4 — May 2026" style={{ marginTop:6 }}/>
              </div>
              <div style={{ display:'flex', gap:'var(--sp-3)' }}>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={()=>setResetModal(false)}>Cancel</button>
                <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={doReset} disabled={resetting||!semName.trim()}>
                  {resetting?'Resetting…':'Confirm & Archive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
