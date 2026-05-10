import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BRANCHES = ['CSE', 'IT', 'ECE', 'ME', 'CE']

export default function OnboardingPage() {
  const [year, setYear] = useState<1|2>(2)
  const [branch, setBranch] = useState('')
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg, #fbf8ff 0%, #ededf9 100%)', padding:'var(--sp-6)' }}>
      <div className="glass-card" style={{ padding:'var(--sp-10)', width:'100%', maxWidth:480 }}>
        <h1 style={{ fontSize:26, fontWeight:800, marginBottom:'var(--sp-2)' }}>Welcome to Exam League! 🎓</h1>
        <p style={{ color:'var(--on-surface-muted)', marginBottom:'var(--sp-8)' }}>Tell us a bit about yourself to personalise your feed.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-5)' }}>
          <div>
            <label>Full Name (pre-filled from Google)</label>
            <input className="input" defaultValue="Kartik Gupta" />
          </div>
          <div>
            <label>Year</label>
            <div style={{ display:'flex', gap:'var(--sp-3)', marginTop:6 }}>
              {([1,2] as const).map(y=>(
                <button key={y} onClick={()=>setYear(y)} style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'2px solid', borderColor:year===y?'var(--primary)':'var(--outline-variant)', background:year===y?'var(--primary-light)':'var(--surface-low)', fontWeight:700, cursor:'pointer', color:year===y?'var(--primary)':'var(--on-surface-muted)', transition:'all 0.15s' }}>
                  {y === 1 ? '1st Year' : '2nd Year'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label>Branch</label>
            <div style={{ display:'flex', gap:'var(--sp-2)', flexWrap:'wrap', marginTop:6 }}>
              {BRANCHES.map(b=>(
                <button key={b} onClick={()=>setBranch(b)} style={{ padding:'8px 16px', borderRadius:'var(--radius-full)', border:'2px solid', borderColor:branch===b?'var(--primary)':'var(--outline-variant)', background:branch===b?'var(--primary)':'transparent', color:branch===b?'white':'var(--on-surface-muted)', fontWeight:600, cursor:'pointer', transition:'all 0.15s', fontSize:13 }}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <label>Roll Number (optional)</label>
            <input className="input" placeholder="e.g. 221CS043" />
          </div>
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px' }} onClick={()=>navigate(`/year/${year}`)}>
            Enter the League ⚡
          </button>
        </div>
      </div>
    </div>
  )
}
