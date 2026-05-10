import { Link, useParams } from 'react-router-dom'
import { BookOpen, Trophy, Zap } from 'lucide-react'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'
import { useSubjects } from '@/hooks/useSubjects'
import { useAuth } from '@/context/AuthContext'

export default function YearPage() {
  const { year = '2' } = useParams()
  const { isAdmin } = useAuth()
  const { data: subjects = [], isLoading: loading } = useSubjects(parseInt(year))

  // 1st year is open to ALL if admin, otherwise show subjects but with "no content yet" state inside
  // Admin always sees everything
  const yr = parseInt(year)

  return (
    <AnimatedPage>
      <PageMeta
        title={yr === 2 ? '2nd Year Subjects – JSS Exam League' : '1st Year Subjects – JSS Exam League'}
        description={`Browse all ${yr === 2 ? 'second' : 'first'} year subjects with notes, quizzes, and doubts.`}
        path={`/year/${year}`}
      />
      <div>
        <section style={{ background: 'linear-gradient(135deg, var(--surface-mid) 0%, var(--primary-light) 100%)', paddingBlock: 'var(--sp-12)' }}>
          <div className="container">
            <div className="badge badge-primary" style={{ marginBottom: 'var(--sp-4)' }}>
              {yr === 2 ? '🎓 Second Year CSE / IT / ECE' : '📚 First Year — All Branches'}
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 'var(--sp-3)' }}>
              {yr === 2 ? '2nd Year' : '1st Year'} Subjects
            </h1>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: 16 }}>
              {loading ? 'Loading subjects…' : `${subjects.length} subjects · Click to open notes, quizzes, and doubts`}
              {yr === 1 && isAdmin && (
                <span style={{ marginLeft: 8, padding: '2px 10px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                  ⚡ Admin — Full Access
                </span>
              )}
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
                  {yr === 1 && s._notes === 0 && (
                    <div style={{ marginTop: 'var(--sp-3)', fontSize: 11, color: isAdmin ? 'var(--primary)' : 'var(--on-surface-muted)', padding: '4px 10px', background: isAdmin ? 'var(--primary-light)' : 'var(--surface-mid)', borderRadius: 'var(--radius-full)', display: 'inline-block', fontWeight: isAdmin ? 600 : 400 }}>
                      {isAdmin ? '⚡ Upload content here' : 'Awaiting content'}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
