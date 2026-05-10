// src/pages/AboutPage.tsx
import { useEffect, useState } from 'react'
import { Github, Linkedin, Globe, Mail, Trophy, Star, Code2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Contributor {
  id: string; display_name: string; avatar_url: string | null
  karma_points: number; branch: string | null; year: number | null
}

export default function AboutPage() {
  const [contributors, setContributors] = useState<Contributor[]>([])

  useEffect(() => {
    supabase.from('profiles')
      .select('id,full_name,avatar_url,karma_points,branch,year,anonymous_mode,role')
      .eq('role','student').gt('karma_points',0)
      .order('karma_points',{ ascending:false }).limit(10)
      .then(({ data }) => {
        if (data) setContributors(data.map((p:any) => ({
          ...p, display_name: p.anonymous_mode ? 'Anonymous Contributor' : p.full_name
        })))
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,var(--on-surface) 0%,#1e3a5f 100%)', color:'white', paddingBlock:'var(--sp-16)' }}>
        <div className="container" style={{ maxWidth:860 }}>
          <div className="badge" style={{ background:'rgba(64,106,255,0.3)', color:'#a5b4fc', marginBottom:'var(--sp-5)' }}>Built at JSS University Noida</div>
          <h1 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:'var(--sp-5)', color:'white' }}>
            Exam<span style={{ color:'var(--primary)' }}>League</span>
          </h1>
          <p style={{ fontSize:18, lineHeight:1.7, color:'rgba(255,255,255,0.75)', maxWidth:620, marginBottom:'var(--sp-8)' }}>
            JSS University's first student-built study platform. AI-summarized notes, collaborative quizzes,
            a doubt forum, and a karma-driven contributor economy — all free, forever.
          </p>
          <div style={{ display:'flex', gap:'var(--sp-4)', flexWrap:'wrap' }}>
            {[
              { icon:<Github size={18}/>, label:'GitHub', href:'https://github.com/kartikgupta372' },
              { icon:<Linkedin size={18}/>, label:'LinkedIn', href:'https://linkedin.com/in/kartik-gupta-jss' },
              { icon:<Globe size={18}/>, label:'Portfolio', href:'https://kartikgupta.dev' },
              { icon:<Mail size={18}/>, label:'Email', href:'mailto:kartikkartikgupta04@gmail.com' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:'var(--radius-full)', background:'rgba(255,255,255,0.1)', color:'white', textDecoration:'none', fontSize:14, fontWeight:600, border:'1px solid rgba(255,255,255,0.15)', transition:'all 0.15s' }}>
                {l.icon} {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Builder card */}
      <section className="section-sm" style={{ background:'var(--surface-low)' }}>
        <div className="container" style={{ maxWidth:860 }}>
          <div className="glass-card" style={{ padding:'var(--sp-8)', display:'grid', gridTemplateColumns:'120px 1fr', gap:'var(--sp-8)', alignItems:'start' }}>
            <div style={{ width:120, height:120, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),#7b8fff)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:40, color:'white', flexShrink:0 }}>KG</div>
            <div>
              <div className="badge badge-admin" style={{ marginBottom:'var(--sp-3)' }}>⚡ Platform Builder & Admin</div>
              <h2 style={{ fontSize:28, fontWeight:800, marginBottom:'var(--sp-2)' }}>Kartik Gupta</h2>
              <div style={{ fontSize:14, color:'var(--on-surface-muted)', marginBottom:'var(--sp-5)', lineHeight:1.7 }}>
                2nd Year · Computer Science & Engineering · JSS University Noida<br/>
                Roll No: <span style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>J2040210027</span> ·
                <a href="mailto:kartikkartikgupta04@gmail.com" style={{ color:'var(--primary)', marginLeft:4 }}>kartikkartikgupta04@gmail.com</a>
              </div>
              <p style={{ fontSize:15, lineHeight:1.8, marginBottom:'var(--sp-6)', maxWidth:560 }}>
                I built Exam League because JSS students deserved a better way to study together.
                No WhatsApp chaos, no Google Drive links that expire — just a clean, fast, permanent
                platform where good content earns recognition and everyone benefits.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'var(--sp-3)' }}>
                {[
                  { icon:<Code2 size={16}/>, label:'Tech Stack', value:'React · Supabase · Vercel' },
                  { icon:<BookOpen size={16}/>, label:'Interests', value:'AI/ML · Full-Stack · DSA' },
                  { icon:<Trophy size={16}/>, label:'Goal', value:'SDE @ Top Product Co.' },
                  { icon:<Star size={16}/>, label:'Batch', value:'JSS 2024–28' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'var(--surface-mid)', borderRadius:'var(--radius-md)', padding:'var(--sp-3)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--primary)', marginBottom:4 }}>{s.icon}<span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</span></div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth:860 }}>
          <div style={{ marginBottom:'var(--sp-8)' }}>
            <h2 style={{ fontSize:28, fontWeight:800, marginBottom:'var(--sp-2)' }}>🏅 Top Contributors</h2>
            <p style={{ color:'var(--on-surface-muted)' }}>
              Karma points are <strong>permanent</strong> — earned when admin approves your uploaded content.
              These people built the library that helps everyone pass.
            </p>
          </div>

          {contributors.length === 0 ? (
            <div className="glass-card" style={{ padding:'var(--sp-12)', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:'var(--sp-4)' }}>📭</div>
              <h3>Be the first contributor!</h3>
              <p style={{ color:'var(--on-surface-muted)', marginTop:'var(--sp-2)' }}>Upload quality notes and get them approved to appear here forever.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
              {contributors.map((c, i) => {
                const initials = c.display_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
                const medals = ['🥇','🥈','🥉']
                return (
                  <div key={c.id} className="glass-card" style={{ padding:'var(--sp-5)', display:'flex', alignItems:'center', gap:'var(--sp-5)' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:20, width:40, textAlign:'center', color:i<3?'var(--primary)':'var(--on-surface-muted)' }}>
                      {i < 3 ? medals[i] : `#${i+1}`}
                    </div>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),#7b8fff)', color:'white', fontWeight:700, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                      {c.avatar_url ? <img src={c.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}/> : initials}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{c.display_name}</div>
                      <div style={{ fontSize:12, color:'var(--on-surface-muted)', marginTop:2 }}>
                        {c.year ? `${c.year===1?'1st':'2nd'} Year` : ''} {c.branch ? `· ${c.branch}` : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', fontFamily:'var(--font-mono)', fontWeight:800, fontSize:20, color:'#f7dd7d' }}>
                      <Star size={16} fill="#f7dd7d" color="#f7dd7d"/>{c.karma_points}
                      <span style={{ fontSize:12, fontFamily:'var(--font-sans)', fontWeight:500, color:'var(--on-surface-muted)' }}>karma</span>
                    </div>
                    {i === 0 && <span className="badge" style={{ background:'linear-gradient(135deg,#ffd700,#ffb300)', color:'#5a3e00' }}>Top Contributor</span>}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop:'var(--sp-8)', padding:'var(--sp-5)', background:'var(--primary-light)', borderRadius:'var(--radius-lg)', borderLeft:'4px solid var(--primary)' }}>
            <div style={{ fontWeight:700, marginBottom:'var(--sp-2)' }}>ℹ️ How Points Work</div>
            <div style={{ fontSize:14, color:'var(--on-surface-muted)', lineHeight:1.8 }}>
              <strong>Karma Points (permanent, never reset):</strong> Upload quality content → admin approves → +10 karma. Answer accepted on doubt forum → +5 karma. Rejected content = 0 points.<br/>
              <strong>Leader Points (semester-based):</strong> Earned by completing quizzes (50 pts), winning contests (60 pts), and reading complete notes (5 pts). Resets each semester — admin archives standings before reset.
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section-sm" style={{ background:'var(--surface-low)' }}>
        <div className="container" style={{ maxWidth:860, textAlign:'center' }}>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:'var(--sp-8)' }}>Built with ♥ at JSS University Noida</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'var(--sp-4)' }}>
            {[
              { value:'React 18', label:'Frontend' },
              { value:'Supabase', label:'Backend + Auth' },
              { value:'Groq AI', label:'AI Summaries' },
              { value:'Vercel', label:'Deployment' },
              { value:'Free', label:'Cost to students' },
              { value:'2024–∞', label:'Running forever' },
            ].map((s,i) => (
              <div key={i} className="glass-card" style={{ padding:'var(--sp-5)', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:800, fontSize:18, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
