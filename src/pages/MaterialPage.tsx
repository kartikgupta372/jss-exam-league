import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Bookmark, Download, Share2, Flag, Sparkles, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMaterial } from '@/hooks/useMaterials'
import PageMeta from '@/components/ui/PageMeta'
import AnimatedPage from '@/components/ui/AnimatedPage'
import { useToast } from '@/context/ToastContext'

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return `${Math.floor(diff/7)}w ago`
}

const TYPE_LABEL: Record<string, string> = { full_notes: 'Full Notes', summary: 'AI Summary', unit_test: 'Unit Test', youtube: 'Video' }

export default function MaterialPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [bookmarked, setBookmarked] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const { data: material, isLoading: loading } = useMaterial(id)

  useEffect(() => {
    const loadBookmark = async () => {
      if (user && id) {
        const { data } = await supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('material_id', id).single()
        if (data) setBookmarked(true)
      }
    }
    loadBookmark()
  }, [user, id])

  const toggleBookmark = async () => {
    if (!user || !material) return
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('material_id', material.id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, material_id: material.id })
      setBookmarked(true)
    }
  }

  const generateQuiz = async () => {
    if (!material) return
    setGeneratingQuiz(true)
    toast('Generating 5-question quiz using AI...', 'info')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await supabase.functions.invoke('generate-quiz', {
        body: { material_id: material.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      
      if (res.error) throw new Error(res.error.message)
      
      toast('✅ Quiz generated successfully!', 'success')
      navigate(`/quiz/${res.data.quiz_id}`)
    } catch (err: any) {
      toast(`⚠️ Failed to generate quiz: ${err.message}`, 'error')
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const isAI = material?.ai_generated

  if (loading) {
    return <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>Loading material...</div>
  }

  if (!material) {
    return <div className="container" style={{ paddingBlock: 'var(--sp-8)' }}>Material not found.</div>
  }

  return (
    <AnimatedPage>
    <PageMeta
      title={material.title}
      description={`View ${material.title} — ${(material.subjects as any)?.name ?? 'JSS'} study material on Exam League.`}
      path={`/material/${id}`}
    />
    <div>
      <div style={{ background:'var(--surface-mid)', borderBottom:'1px solid var(--outline-variant)', padding:'var(--sp-3) 0' }}>
        <div className="container">
          <Link to={`/year/2/subject/${material.subject_id}`} style={{ textDecoration:'none', color:'var(--primary)', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
            <ChevronLeft size={15}/> Back to {(material.subjects as any)?.name ?? 'Subject'}
          </Link>
        </div>
      </div>

      <div className="container" style={{ paddingBlock:'var(--sp-8)', display:'grid', gridTemplateColumns:'1fr 280px', gap:'var(--sp-8)', alignItems:'start' }}>
        {/* PDF Viewer placeholder */}
        <div>
          {material.type === 'summary' && material.ai_summary_text ? (
            <div className="glass-card" style={{ padding: 'var(--sp-8)', whiteSpace: 'pre-wrap' }}>
              <h2 style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles color="var(--primary)" /> AI Summary
              </h2>
              {material.ai_summary_text}
            </div>
          ) : material.type === 'youtube' && material.youtube_url ? (
            <div style={{ background:'var(--on-surface)', borderRadius:'var(--radius-lg)', overflow:'hidden', aspectRatio:'16/9' }}>
               <iframe width="100%" height="100%" src={material.youtube_url.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen></iframe>
            </div>
          ) : (
            <div style={{ background:'var(--on-surface)', borderRadius:'var(--radius-lg)', overflow:'hidden', aspectRatio:'1/1.3', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'var(--sp-4)', color:'rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize:64 }}>📄</div>
              <div style={{ fontSize:16, fontWeight:600, color:'white' }}>PDF Viewer</div>
              <div style={{ fontSize:13, textAlign:'center', maxWidth:280 }}>
                {material.file_url ? 'PDF is ready. PDF viewer component to be added.' : 'No file attached.'}
              </div>
            </div>
          )}
        </div>

        {/* Metadata + Actions sidebar */}
        <aside className="sidebar-col" style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)', position:'sticky', top:80 }}>
          {isAI && (
            <div className="badge badge-ai" style={{ alignSelf:'flex-start', padding:'6px 14px', fontSize:13 }}>
              <Sparkles size={14}/> AI-Generated Summary
            </div>
          )}
          <h1 style={{ fontSize:20, fontWeight:800, lineHeight:1.3 }}>
            {material.title}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)' }}>
            {(material.profiles as any)?.avatar_url ? (
               <img src={(material.profiles as any).avatar_url} alt="" style={{ width:32, height:32, borderRadius:'50%' }} />
            ) : (
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {((material.profiles as any)?.full_name || 'U').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{(material.profiles as any)?.full_name ?? 'Unknown User'}</div>
              <div style={{ fontSize:12, color:'var(--on-surface-muted)' }}>Uploaded {fmtDate(material.created_at)}</div>
            </div>
          </div>

          <div className="divider"/>

          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Subject</span>
              <span style={{ fontWeight:600 }}>{(material.subjects as any)?.name ?? 'Unknown'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Type</span>
              <span className="badge badge-primary">{TYPE_LABEL[material.type] ?? 'Document'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Views</span>
              <span style={{ fontWeight:600, fontFamily:'var(--font-mono)' }}>{material.view_count}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'var(--on-surface-muted)' }}>Downloads</span>
              <span style={{ fontWeight:600, fontFamily:'var(--font-mono)' }}>{material.download_count}</span>
            </div>
          </div>

          <div className="divider"/>

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
            <button onClick={toggleBookmark} className="btn btn-ghost" style={{ justifyContent:'center', color: bookmarked ? 'var(--primary)' : undefined }}>
              <Bookmark size={16} fill={bookmarked ? 'var(--primary)' : 'none'}/> {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            {material.file_url && (
              <a href={material.file_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ justifyContent:'center', textDecoration: 'none' }}>
                <Download size={16}/> Download File
              </a>
            )}
            <button className="btn btn-ghost" style={{ justifyContent:'center' }}>
              <Share2 size={16}/> Share
            </button>
            <button className="btn btn-ghost" style={{ justifyContent:'center', color:'var(--danger)', borderColor:'var(--danger)' }}>
              <Flag size={16}/> Report
            </button>
          </div>

          {isAdmin && material?.type === 'full_notes' && !isAI && (
            <>
              <div className="divider"/>
              <button 
                onClick={generateQuiz} 
                disabled={generatingQuiz}
                className="btn btn-primary" 
                style={{ justifyContent:'center', background: 'linear-gradient(135deg,#e0f2fe,#dcffe8)', color: '#0e7490', border: '1px solid #a5f3fc' }}
              >
                <Sparkles size={16}/> {generatingQuiz ? 'Generating Quiz...' : 'Generate AI Quiz'}
              </button>
            </>
          )}

          {isAI && material.source_material_id && (
            <>
              <div className="divider"/>
              <div style={{ background:'var(--surface-low)', borderRadius:'var(--radius-md)', padding:'var(--sp-4)', fontSize:13, color:'var(--on-surface-muted)' }}>
                <strong style={{ color:'var(--on-surface)' }}>Source Material:</strong><br/>
                <Link to={`/material/${material.source_material_id}`} style={{ color:'var(--primary)' }}>View Original Material</Link>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
    </AnimatedPage>
  )
}
