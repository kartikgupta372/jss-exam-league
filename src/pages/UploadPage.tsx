// src/pages/UploadPage.tsx — real Supabase upload + approval workflow
import { useEffect, useState } from 'react'
import { Upload, X, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSubjects } from '@/hooks/useSubjects'

interface Subject { id: string; name: string; code: string; year: number }
interface Submission { id: string; title: string; status: string; created_at: string; rejection_reason: string | null }

const STATUS_BADGE: Record<string, string> = { approved: 'badge-lime', pending: 'badge-amber', rejected: 'badge-red' }
const STATUS_ICON: Record<string, JSX.Element> = {
  approved: <CheckCircle size={13} />,
  pending:  <Clock size={13} />,
  rejected: <XCircle size={13} />,
}

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff}d ago`
}

export default function UploadPage() {
  const { user, isBlocked } = useAuth()
  const navigate = useNavigate()

  const [file, setFile]               = useState<File | null>(null)
  const [dragOver, setDragOver]       = useState(false)
  const [type, setType]               = useState('full_notes')
  const [subjectId, setSubjectId]     = useState('')
  const [yearSel, setYearSel]         = useState('2')
  const [title, setTitle]             = useState('')
  const [desc, setDesc]               = useState('')
  const [ytUrl, setYtUrl]             = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [saving, setSaving]           = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const { data: subjects = [] } = useSubjects()

  useEffect(() => {
    if (user) {
      supabase.from('materials').select('id,title,status,created_at,rejection_reason')
        .eq('uploaded_by', user.id).order('created_at', { ascending: false }).limit(10)
        .then(({ data }) => { if (data) setSubmissions(data) })
    }
  }, [user])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else setError('Only PDF files are accepted.')
  }

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return }
    if (isBlocked) { setError('Your account is blocked. You cannot upload materials.'); return }
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!subjectId)     { setError('Please select a subject.'); return }
    if (type !== 'youtube' && !file) { setError('Please select a PDF file.'); return }
    if (type === 'youtube' && !ytUrl.trim()) { setError('Please enter a YouTube URL.'); return }
    if (file && file.size > 25 * 1024 * 1024) { setError('File must be under 25MB.'); return }

    setSaving(true); setError(null)

    let fileUrl: string | null = null

    // Upload file to storage
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${subjectId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('materials').upload(path, file)
      if (uploadErr) { setError('Upload failed: ' + uploadErr.message); setSaving(false); return }
      fileUrl = path
    }

    // Insert materials row
    const { error: insertErr } = await supabase.from('materials').insert({
      title: title.trim(),
      description: desc.trim() || null,
      subject_id: subjectId,
      type,
      file_url: fileUrl,
      youtube_url: type === 'youtube' ? ytUrl.trim() : null,
      uploaded_by: user.id,
      status: 'pending',
    })

    if (insertErr) { setError('Could not submit: ' + insertErr.message); setSaving(false); return }

    setSaving(false); setDone(true)

    // Refresh submissions list
    const { data: fresh } = await supabase.from('materials')
      .select('id,title,status,created_at,rejection_reason')
      .eq('uploaded_by', user.id).order('created_at', { ascending: false }).limit(10)
    if (fresh) setSubmissions(fresh)
  }

  if (done) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: 'var(--sp-10)', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <CheckCircle size={56} color="#16a34a" style={{ marginBottom: 'var(--sp-4)' }} />
        <h2 style={{ fontSize: 24, marginBottom: 'var(--sp-3)' }}>Sent for Approval!</h2>
        <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-6)' }}>
          You'll get notified once admin reviews it. Approved materials earn you +10 karma.
        </p>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => { setDone(false); setFile(null); setTitle(''); setDesc(''); setYtUrl('') }}>
            Upload Another
          </button>
          <Link to="/year/2" className="btn btn-primary">Browse Subjects</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container" style={{ maxWidth: 700, paddingBlock: 'var(--sp-10)' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 'var(--sp-2)' }}>Upload Material</h1>
      <p style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--sp-8)' }}>
        Share notes, tests, or videos. Earn +10 karma when it's approved.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

        {/* Type selector */}
        <div>
          <label>What are you uploading?</label>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 6 }}>
            {[{ value: 'full_notes', label: '📄 Full Notes' }, { value: 'unit_test', label: '📝 Unit Test / CIE' }, { value: 'youtube', label: '🎥 YouTube Link' }].map(t => (
              <button key={t.value} onClick={() => setType(t.value)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: type === t.value ? 'var(--primary)' : 'var(--outline-variant)', background: type === t.value ? 'var(--primary-light)' : 'transparent', fontWeight: 600, cursor: 'pointer', fontSize: 14, color: type === t.value ? 'var(--primary)' : 'var(--on-surface-muted)', transition: 'all 0.15s' }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* File drop */}
        {type !== 'youtube' && (
          <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--outline-variant)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--sp-10)', textAlign: 'center', background: dragOver ? 'var(--primary-light)' : 'var(--surface-low)', transition: 'all 0.15s', cursor: 'pointer' }}
            onClick={() => document.getElementById('file-input')?.click()}>
            <input id="file-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }} />
            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 'var(--sp-3)' }}>📄</div>
                <div style={{ fontWeight: 700 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ marginTop: 'var(--sp-3)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, margin: 'var(--sp-3) auto 0' }}><X size={14} />Remove</button>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--outline)" style={{ marginBottom: 'var(--sp-3)' }} />
                <div style={{ fontWeight: 600 }}>Drag & drop your PDF here</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginTop: 4 }}>or click to browse · PDF only · max 25MB</div>
              </>
            )}
          </div>
        )}

        {/* Form fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <div>
            <label>Year</label>
            <select className="input" value={yearSel} onChange={e => setYearSel(e.target.value)}>
              <option value="2">2nd Year</option>
              <option value="1">1st Year</option>
            </select>
          </div>
          <div>
            <label>Subject</label>
            <select className="input" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
              <option value="">Select subject…</option>
              {subjects.filter(s => s.year === parseInt(yearSel)).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 1 — Process Management Notes" />
        </div>
        <div>
          <label>Description <span style={{ fontWeight: 400, color: 'var(--outline)' }}>(optional)</span></label>
          <textarea className="input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description of what's covered…" />
        </div>

        {type === 'youtube' && (
          <div>
            <label>YouTube URL</label>
            <input className="input" value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
          </div>
        )}

        {error && (
          <div style={{ background: '#ffdad6', color: 'var(--danger)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', fontSize: 14 }}>{error}</div>
        )}

        <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '13px 28px', fontSize: 16 }} onClick={handleSubmit} disabled={saving}>
          {saving ? 'Uploading…' : 'Send for Approval ✓'}
        </button>
      </div>

      {/* Submission history */}
      {submissions.length > 0 && (
        <div style={{ marginTop: 'var(--sp-12)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 'var(--sp-4)' }}>Your Recent Submissions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {submissions.map(s => (
              <div key={s.id} className="glass-card" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                  {s.status === 'rejected' && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Rejected: {s.rejection_reason}</div>}
                  <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 4 }}>{fmtDate(s.created_at)}</div>
                </div>
                <span className={`badge ${STATUS_BADGE[s.status]}`} style={{ gap: 'var(--sp-1)' }}>
                  {STATUS_ICON[s.status]} {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
