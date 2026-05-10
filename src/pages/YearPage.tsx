// src/pages/YearPage.tsx — real subjects from Supabase
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'
import { useSubjects } from '@/hooks/useSubjects'

interface Subject {
  id: string
  name: string
  code: string
  year: number
  semester: number
  branch: string
  icon_emoji: string
  sort_order: number
  _notes: number
  _quizzes: number
  _doubts: number
}


export default function YearPage() {
  const { year = '2' } = useParams()
  const { data: subjects = [], isLoading: loading } = useSubjects(parseInt(year))

  const isLive = year === '2'

  return (
    <AnimatedPage>
    <PageMeta
      title={year === '2' ? '2nd Year Subjects — JSS Exam League' : '1st Year Subjects — JSS Exam League'}
      description={`Browse all ${year === '2' ? 'second' : 'first'} year subjects with notes, quizzes, and doubts.`}
      path={`/year/${year}`}
    />
    <div>
      <section style={{ background: 'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock: 'var(--sp-12)' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 'var(--sp-4)' }}>
            {year === '2' ? '🎓 Second Year CSE / IT / ECE' : '📚 First Year — All Branches'}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 'var(--sp-3)' }}>
            {year === '2' ? '2nd Year' : '1st Year'} Subjects
          </h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: 16 }}>
            {loading ? 'Loading subjects…' : isLive
              ? `${subjects.length} subjects · Click to open notes, quizzes, and doubts`
              : 'Content coming soon — Phase 1.5'}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 'var(--sp-10)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--sp-4)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : !isLive ? (
          <div className="glass-card" style={{ padding: 'var(--sp-12)', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 'var(--sp-4)' }}>🚧</div>
            <h2 style={{ fontSize: 24, marginBottom: 'var(--sp-3)' }}>First Year Content Coming Soon</h2>
            <p style={{ color: 'var(--on-surface-muted)', maxWidth: 400, margin: '0 auto var(--sp-6)' }}>
              First to upload gets +20 bonus karma. Be the first!
            </p>
            <Link to="/" className="btn btn-primary">Back to Home <ArrowRight size={15} /></Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--sp-4)' }}>
            {subjects.map(s => (
              <Link key={s.id} to={`/year/${year}/subject/${s.id}`} className="subject-card">
                <div className="subject-emoji">{s.icon_emoji || '📚'}</div>
                <div className="subject-code">Sem {s.semester} · {s.code}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-counts">
                  <span className="subject-count-item"><BookOpen size={12} />{s._notes} notes</span>
                  <span className="subject-count-item"><Trophy size={12} />{s._quizzes} quizzes</span>
                  <span className="subject-count-item"><Zap size={12} />{s._doubts} doubts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </AnimatedPage>
  )
}
