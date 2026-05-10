import { Link, useParams } from 'react-router-dom'
import { BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react'

const SUBJECTS_BY_YEAR: Record<string, Array<{ emoji:string; code:string; name:string; notes:number; quizzes:number; doubts:number; semester:number }>> = {
  '2': [
    { emoji:'💻', code:'JCS-403', name:'Operating Systems', notes:24, quizzes:8, doubts:31, semester:4 },
    { emoji:'📡', code:'JCS-405', name:'Computer Networks', notes:19, quizzes:6, doubts:22, semester:4 },
    { emoji:'🧮', code:'JCS-401', name:'DBMS', notes:31, quizzes:10, doubts:18, semester:4 },
    { emoji:'⚙️', code:'JCS-407', name:'Software Engineering', notes:15, quizzes:5, doubts:14, semester:4 },
    { emoji:'🔢', code:'JMA-401', name:'Discrete Mathematics', notes:22, quizzes:7, doubts:27, semester:3 },
    { emoji:'🔬', code:'JCS-409', name:'Theory of Automata', notes:12, quizzes:4, doubts:9, semester:4 },
    { emoji:'⚡', code:'JCS-411', name:'OOPS in Java', notes:28, quizzes:9, doubts:19, semester:3 },
    { emoji:'📊', code:'JCS-413', name:'COA', notes:17, quizzes:5, doubts:12, semester:3 },
  ],
  '1': [
    { emoji:'📐', code:'JMA-101', name:'Mathematics I', notes:0, quizzes:0, doubts:0, semester:1 },
    { emoji:'⚗️', code:'JCH-101', name:'Engineering Chemistry', notes:0, quizzes:0, doubts:0, semester:1 },
    { emoji:'🔌', code:'JEC-101', name:'Basic Electronics', notes:0, quizzes:0, doubts:0, semester:2 },
  ],
}

export default function YearPage() {
  const { year = '2' } = useParams()
  const subjects = SUBJECTS_BY_YEAR[year] ?? []
  const isLive = year === '2'

  return (
    <div>
      {/* Header */}
      <section style={{ background:'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock:'var(--sp-12)' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom:'var(--sp-4)' }}>
            {year === '2' ? '🎓 Second Year CSE / IT / ECE' : '📚 First Year — All Branches'}
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, marginBottom:'var(--sp-3)' }}>
            {year === '2' ? '2nd Year' : '1st Year'} Subjects
          </h1>
          <p style={{ color:'var(--on-surface-muted)', fontSize:16 }}>
            {isLive ? `${subjects.length} subjects • Click to open notes, quizzes, and doubts` : 'Content coming soon — Phase 1.5'}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBlock:'var(--sp-10)' }}>
        {!isLive ? (
          <div className="glass-card" style={{ padding:'var(--sp-12)', textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:'var(--sp-4)' }}>🚧</div>
            <h2 style={{ fontSize:24, marginBottom:'var(--sp-3)' }}>First Year Content Coming Soon</h2>
            <p style={{ color:'var(--on-surface-muted)', maxWidth:400, margin:'0 auto var(--sp-6)' }}>
              We're building out 1st year content after 2nd year launches. First to upload gets +20 bonus karma.
            </p>
            <Link to="/" className="btn btn-primary">Back to Home <ArrowRight size={15}/></Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'var(--sp-4)' }}>
            {subjects.map(s => (
              <Link key={s.code} to={`/year/${year}/subject/${s.code}`} className="subject-card">
                <div className="subject-emoji">{s.emoji}</div>
                <div className="subject-code">Sem {s.semester} • {s.code}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-counts">
                  <span className="subject-count-item"><BookOpen size={12}/>{s.notes} notes</span>
                  <span className="subject-count-item"><Trophy size={12}/>{s.quizzes} quizzes</span>
                  <span className="subject-count-item"><Zap size={12}/>{s.doubts} doubts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
