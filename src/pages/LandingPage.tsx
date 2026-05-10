import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, Trophy, BookOpen, Zap, Star, TrendingUp } from 'lucide-react'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'

/* ---- Animated counter hook ---- */
function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ref.current) {
        ref.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          setVal(Math.floor(p * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    })
    const el = document.getElementById('stats-section')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])
  return val
}

const SUBJECTS = [
  { emoji: '💻', code: 'JCS-403', name: 'Operating Systems', notes: 24, quizzes: 8, doubts: 31 },
  { emoji: '📡', code: 'JCS-405', name: 'Computer Networks', notes: 19, quizzes: 6, doubts: 22 },
  { emoji: '🧮', code: 'JCS-401', name: 'DBMS', notes: 31, quizzes: 10, doubts: 18 },
  { emoji: '⚙️', code: 'JCS-407', name: 'Software Engineering', notes: 15, quizzes: 5, doubts: 14 },
  { emoji: '🔢', code: 'JMA-401', name: 'Discrete Mathematics', notes: 22, quizzes: 7, doubts: 27 },
  { emoji: '🔬', code: 'JCS-409', name: 'Theory of Automata', notes: 12, quizzes: 4, doubts: 9 },
]

const CONTRIBUTORS = [
  { initials: 'AK', name: 'Arjun K.', karma: 340, color: '#406aff' },
  { initials: 'PS', name: 'Priya S.', karma: 290, color: '#7b4fff' },
  { initials: 'RM', name: 'Rahul M.', karma: 215, color: '#ff6b6b' },
  { initials: 'SV', name: 'Sneha V.', karma: 198, color: '#06b6d4' },
  { initials: 'NT', name: 'Nikhil T.', karma: 176, color: '#10b981' },
]

const TRENDING_QUIZZES = [
  { id: 'q1', title: 'OS — Process Scheduling', subject: 'Operating Systems', questions: 15, attempts: 312 },
  { id: 'q2', title: 'DBMS — SQL Fundamentals', subject: 'DBMS', attempts: 278, questions: 20 },
  { id: 'q3', title: 'CN — TCP/IP Deep Dive', subject: 'Computer Networks', attempts: 201, questions: 12 },
]

export default function LandingPage() {
  const students = useCounter(847)
  const materials = useCounter(1240)
  const quizzes  = useCounter(12480)

  return (
    <AnimatedPage>
    <PageMeta
      title="JSS Exam League — Your CIE & End-Sem Co-Pilot"
      description="AI-summarized notes, gamified quizzes, a doubt forum, and a live leaderboard — all in one place built for JSS University students."
      path="/"
    />
    <div>
      {/* ===== HERO ===== */}
      <section style={{ background: 'linear-gradient(160deg, #fbf8ff 0%, #ededf9 50%, #dde5ff 100%)', paddingBlock: 'var(--sp-20)', overflow: 'hidden', position: 'relative' }}>
        {/* decorative blobs */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(64,106,255,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(163,255,112,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="container" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-16)', alignItems:'center' }}>
          <div className="animate-fadeInUp">
            <div className="badge badge-primary" style={{ marginBottom:'var(--sp-4)' }}>
              <Sparkles size={13}/> Built by JSS Students, for JSS Students
            </div>
            <h1 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:800, lineHeight:1.1, marginBottom:'var(--sp-5)' }}>
              Exam League —<br/>
              <span className="text-gradient">Your CIE & End-Sem</span><br/>
              Co-Pilot
            </h1>
            <p style={{ fontSize:'18px', color:'var(--on-surface-muted)', lineHeight:1.7, marginBottom:'var(--sp-8)', maxWidth:'480px' }}>
              AI-summarized notes, gamified quizzes, a doubt forum, and a live leaderboard — all in one place built for JSS University's exam cycles.
            </p>
            <div style={{ display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
              <Link to="/login" className="btn btn-gold btn-lg" style={{ gap:'var(--sp-2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </Link>
              <Link to="/year/2" className="btn btn-ghost btn-lg">
                Browse Subjects <ArrowRight size={16}/>
              </Link>
            </div>
          </div>

          {/* Hero card panel */}
          <div className="animate-fadeInUp animate-fadeInUp-d2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-3)' }}>
            {[
              { icon:<Zap size={20} color="var(--primary)"/>, label:'AI Summaries', desc:'One-click exam-ready notes' },
              { icon:<Trophy size={20} color="#f7dd7d"/>, label:'Leaderboard', desc:'Compete & get recognised' },
              { icon:<BookOpen size={20} color="#10b981"/>, label:'Study Library', desc:'Notes, tests & videos' },
              { icon:<Star size={20} color="#f59e0b"/>, label:'Karma Points', desc:'Earn rewards for uploads' },
            ].map((f,i)=>(
              <div key={i} className="glass-card" style={{ padding:'var(--sp-4)' }}>
                <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:'var(--surface-mid)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'var(--sp-3)' }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{f.label}</div>
                <div style={{ fontSize:12, color:'var(--on-surface-muted)', marginTop:4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE STATS ===== */}
      <section id="stats-section" className="section-sm" style={{ background:'var(--primary)', color:'white' }}>
        <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-6)', textAlign:'center' }}>
          {[
            { value: students, suffix:'+', label:'Registered Students' },
            { value: materials, suffix:'+', label:'Study Materials' },
            { value: quizzes, suffix:'+', label:'Quiz Attempts' },
          ].map((s,i)=>(
            <div key={i}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(28px,4vw,48px)', fontWeight:700, lineHeight:1 }}>{s.value.toLocaleString('en-IN')}{s.suffix}</div>
              <div style={{ fontSize:14, opacity:0.8, marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== YEAR PICKER ===== */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'var(--sp-10)' }}>
            <h2 className="section-title">Choose Your Year</h2>
            <p className="section-subtitle">Three taps to your first revision. Year → Subject → Material.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-5)', maxWidth:700, margin:'0 auto' }}>
            <Link to="/year/2" style={{ textDecoration:'none' }}>
              <div className="glass-card" style={{ padding:'var(--sp-8)', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>🎓</div>
                <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>2nd Year</div>
                <div style={{ fontSize:14, color:'var(--on-surface-muted)', marginBottom:'var(--sp-4)' }}>Live at launch</div>
                <div style={{ display:'flex', justifyContent:'center', gap:'var(--sp-3)' }}>
                  <span className="badge badge-primary">6 Subjects</span>
                  <span className="badge badge-lime">50+ Materials</span>
                </div>
              </div>
            </Link>
            <Link to="/year/1" style={{ textDecoration:'none' }}>
              <div className="glass-card" style={{ padding:'var(--sp-8)', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>📚</div>
                <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>1st Year</div>
                <div style={{ fontSize:14, color:'var(--on-surface-muted)', marginBottom:'var(--sp-4)' }}>Live now!</div>
                <div style={{ display:'flex', justifyContent:'center', gap:'var(--sp-3)' }}>
                  <span className="badge badge-primary">Open</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== POPULAR SUBJECTS ===== */}
      <section className="section-sm" style={{ background:'var(--surface-low)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--sp-8)' }}>
            <div>
              <h2 className="section-title">Popular Subjects</h2>
              <p className="section-subtitle">Most visited this week</p>
            </div>
            <Link to="/year/2" className="btn btn-ghost btn-sm">View all <ArrowRight size={14}/></Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'var(--sp-4)' }}>
            {SUBJECTS.map(s=>(
              <Link key={s.code} to={`/year/2/subject/${s.code}`} className="subject-card">
                <div className="subject-emoji">{s.emoji}</div>
                <div className="subject-code">{s.code}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-counts">
                  <span className="subject-count-item"><BookOpen size={12}/>{s.notes} notes</span>
                  <span className="subject-count-item"><Trophy size={12}/>{s.quizzes} quizzes</span>
                  <span className="subject-count-item"><Zap size={12}/>{s.doubts} doubts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING QUIZZES ===== */}
      <section className="section">
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--sp-8)' }}>
            <div>
              <h2 className="section-title">Trending Quizzes</h2>
              <p className="section-subtitle">Hot right now</p>
            </div>
            <Link to="/leaderboard" className="btn btn-ghost btn-sm">Leaderboard <ArrowRight size={14}/></Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'var(--sp-4)' }}>
            {TRENDING_QUIZZES.map(q=>(
              <Link key={q.id} to={`/quiz/${q.id}`} className="glass-card" style={{ padding:'var(--sp-5)', display:'block', textDecoration:'none', color:'inherit' }}>
                <div className="badge badge-primary" style={{ marginBottom:'var(--sp-3)' }}>{q.subject}</div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'var(--sp-2)' }}>{q.title}</h3>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'var(--sp-4)' }}>
                  <div style={{ fontSize:13, color:'var(--on-surface-muted)' }}>{q.questions} questions</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--primary)', fontWeight:600 }}>{q.attempts.toLocaleString()} attempts</div>
                </div>
                <div className="progress-bar" style={{ marginTop:'var(--sp-3)' }}>
                  <div className="progress-fill" style={{ width:`${Math.min(q.attempts/400*100,100)}%` }}/>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOP CONTRIBUTORS ===== */}
      <section className="section-sm" style={{ background:'var(--surface-low)' }}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom:'var(--sp-6)' }}>Top Contributors This Week</h2>
          <div style={{ display:'flex', gap:'var(--sp-4)', overflowX:'auto', paddingBottom:'var(--sp-2)' }}>
            {CONTRIBUTORS.map((c,i)=>(
              <Link key={i} to="/leaderboard" style={{ textDecoration:'none', color:'inherit', flexShrink:0 }}>
                <div className="glass-card" style={{ padding:'var(--sp-4)', textAlign:'center', minWidth:120 }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:c.color, color:'white', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto var(--sp-3)' }}>{c.initials}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--primary)', marginTop:4 }}>{c.karma} pts</div>
                  {i === 0 && <div className="badge badge-gold" style={{ marginTop:'var(--sp-2)' }}>🏆 #1</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="section" style={{ background:'linear-gradient(135deg, var(--primary), #7b8fff)', color:'white' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <TrendingUp size={40} style={{ marginBottom:'var(--sp-4)', opacity:0.9 }}/>
          <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:800, marginBottom:'var(--sp-4)', color:'white' }}>
            Ready to ace your CIEs?
          </h2>
          <p style={{ fontSize:18, opacity:0.85, marginBottom:'var(--sp-8)', maxWidth:500, margin:'0 auto var(--sp-8)' }}>
            Join 847+ JSS students who already study smarter with Exam League.
          </p>
          <Link to="/login" className="btn btn-gold btn-lg">
            Join the League <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background:'var(--on-surface)', color:'rgba(255,255,255,0.7)', padding:'var(--sp-10) 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'var(--sp-4)' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:18, color:'white', marginBottom:6 }}>Exam<span style={{ color:'var(--tertiary)' }}>League</span></div>
            <div style={{ fontSize:13 }}>Built with ♥ at JSS University, Noida</div>
          </div>
          <div style={{ display:'flex', gap:'var(--sp-6)', fontSize:13 }}>
            <a href="mailto:takedown@examleague.in" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>Takedown / Privacy</a>
            <a href="#" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>Instagram</a>
            <a href="#" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
    </AnimatedPage>
  )
}
