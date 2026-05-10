import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const QUESTIONS = [
  { q:'Which scheduling algorithm gives the minimum average waiting time?', opts:['FCFS','SJF','Round Robin','Priority'], correct:1 },
  { q:'In paging, the page table stores:', opts:['Physical addresses','Logical addresses','Frame numbers','Segment IDs'], correct:2 },
  { q:'Deadlock can be prevented by:', opts:['Circular wait','Mutual exclusion','Resource preemption','Hold and wait'], correct:2 },
  { q:'Which memory allocation technique suffers from external fragmentation?', opts:['Paging','Segmentation','Contiguous','Fixed partition'], correct:1 },
  { q:'The Banker\'s algorithm is used for:', opts:['Deadlock detection','Deadlock avoidance','Deadlock recovery','Process scheduling'], correct:1 },
]

export default function QuizPage() {
  const { id } = useParams()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<number,number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [showPalette, setShowPalette] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; } return t-1 }), 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  const mm = String(Math.floor(timeLeft/60)).padStart(2,'0')
  const ss = String(timeLeft%60).padStart(2,'0')
  const isWarning = timeLeft < 120

  const handleSubmit = () => { clearInterval(timerRef.current!); setSubmitted(true) }

  if (submitted) return <QuizDone selected={selected} id={id||''} />

  const q = QUESTIONS[current]

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', flexDirection:'column' }}>
      {/* HUD Header */}
      <div style={{ background:'rgba(251,248,255,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--outline-variant)', padding:'var(--sp-3) 0', position:'sticky', top:64, zIndex:50 }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
          <button onClick={()=>setShowConfirm(true)} className="icon-btn"><X size={18}/></button>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--on-surface-muted)', marginBottom:6 }}>
              <span>Question {current+1} of {QUESTIONS.length}</span>
              <span>OS — Process Scheduling</span>
            </div>
            <div className="progress-bar" style={{ height:6 }}>
              <div className="progress-fill" style={{ width:`${((current+1)/QUESTIONS.length)*100}%` }}/>
            </div>
          </div>
          <div className={`hud-timer${isWarning?' warning':''}`}>{mm}:{ss}</div>
          <button onClick={()=>setShowPalette(p=>!p)} style={{ border:'1px solid var(--outline-variant)', borderRadius:'var(--radius)', padding:'6px 12px', background:'var(--surface-card)', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            Grid
          </button>
        </div>
      </div>

      {/* Question Palette */}
      {showPalette && (
        <div style={{ background:'var(--surface-low)', borderBottom:'1px solid var(--outline-variant)', padding:'var(--sp-3) 0' }}>
          <div className="container" style={{ display:'flex', gap:'var(--sp-2)', flexWrap:'wrap' }}>
            {QUESTIONS.map((_,i)=>(
              <button key={i} onClick={()=>{ setCurrent(i); setShowPalette(false) }}
                style={{ width:36, height:36, borderRadius:'var(--radius)', border:'2px solid', borderColor: i===current ? 'var(--primary)' : selected[i]!==undefined ? 'var(--success)' : 'var(--outline-variant)', background: i===current ? 'var(--primary)' : selected[i]!==undefined ? '#dcffe8' : 'white', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, cursor:'pointer', color: i===current ? 'white' : 'inherit' }}>{i+1}</button>
            ))}
          </div>
        </div>
      )}

      {/* Question Body */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'var(--sp-8) 0' }}>
        <div style={{ width:'100%', maxWidth:700 }} className="container">
          <div className="glass-card" style={{ padding:'var(--sp-8)' }}>
            <div style={{ fontSize:13, color:'var(--on-surface-muted)', fontFamily:'var(--font-mono)', marginBottom:'var(--sp-4)' }}>Q{current+1}</div>
            <h2 style={{ fontSize:'clamp(17px,2.5vw,22px)', fontWeight:700, marginBottom:'var(--sp-6)', lineHeight:1.5 }}>{q.q}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {q.opts.map((opt,i)=>(
                <button key={i} className={`quiz-option${selected[current]===i?' selected':''}`} onClick={()=>setSelected(s=>({...s,[current]:i}))}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, marginRight:'var(--sp-3)', color:'var(--on-surface-muted)' }}>{String.fromCharCode(65+i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'var(--sp-5)' }}>
            <button className="btn btn-ghost" onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}>
              <ChevronLeft size={16}/> Previous
            </button>
            {current < QUESTIONS.length-1 ? (
              <button className="btn btn-primary" onClick={()=>setCurrent(c=>c+1)}>
                Next <ChevronRight size={16}/>
              </button>
            ) : (
              <button className="btn btn-gold" onClick={()=>setShowConfirm(true)}>
                Submit Quiz ⚡
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(25,27,36,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding:'var(--sp-8)', maxWidth:400, width:'100%', textAlign:'center' }}>
            <h3 style={{ fontSize:20, marginBottom:'var(--sp-3)' }}>Submit Quiz?</h3>
            <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-6)' }}>
              You've answered {Object.keys(selected).length} of {QUESTIONS.length} questions. Unanswered questions will be marked as skipped.
            </p>
            <div style={{ display:'flex', gap:'var(--sp-3)' }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={()=>setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-gold" style={{ flex:1, justifyContent:'center' }} onClick={handleSubmit}>Submit ⚡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuizDone({ selected, id }: { selected:Record<number,number>; id:string }) {
  const QUESTIONS_LOCAL = [
    { correct:1 },{ correct:2 },{ correct:2 },{ correct:1 },{ correct:1 },
  ]
  const score = Object.entries(selected).filter(([i,v])=>QUESTIONS_LOCAL[+i]?.correct===v).length
  const pct = Math.round(score/QUESTIONS_LOCAL.length*100)

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'var(--sp-8)' }}>
      <div style={{ maxWidth:500, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:'var(--sp-4)' }}>{pct>=70?'🏆':pct>=40?'📚':'💪'}</div>
        <h1 style={{ fontSize:36, fontWeight:800, marginBottom:'var(--sp-2)' }}>Quiz Complete!</h1>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:64, fontWeight:700, color:'var(--primary)', lineHeight:1, marginBlock:'var(--sp-4)' }}>{pct}%</div>
        <div style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-6)' }}>{score} / {QUESTIONS_LOCAL.length} correct</div>
        <div className="progress-bar" style={{ height:8, marginBottom:'var(--sp-8)' }}>
          <div className="progress-fill" style={{ width:`${pct}%` }}/>
        </div>
        <div style={{ display:'flex', gap:'var(--sp-3)', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/leaderboard" className="btn btn-primary">View Leaderboard</Link>
          <a href={`https://wa.me/?text=${encodeURIComponent(`I scored ${pct}% on the OS quiz on Exam League! 🏆 Try it: examleague.in/quiz/${id}`)}`} target="_blank" rel="noreferrer" className="btn btn-ghost">Share on WhatsApp</a>
        </div>
        <div style={{ marginTop:'var(--sp-6)' }}>
          <Link to="/year/2/subject/JCS-403" style={{ color:'var(--primary)', fontSize:14 }}>← Back to Subject</Link>
        </div>
      </div>
    </div>
  )
}
