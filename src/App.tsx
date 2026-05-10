// src/App.tsx  –  Phase 6: code-split + animated route transitions
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import NavBar from '@/components/layout/NavBar'
import RequireAuth, { RequireAdmin } from '@/components/auth/RequireAuth'
import './index.css'

/* ── Eager (tiny, needed immediately) ─────────────────────────── */
import LandingPage      from '@/pages/LandingPage'
import LoginPage        from '@/pages/LoginPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'

/* ── Lazy (heavy pages — split into separate chunks) ───────────── */
const OnboardingPage   = lazy(() => import('@/pages/OnboardingPage'))
const YearPage         = lazy(() => import('@/pages/YearPage'))
const SubjectPage      = lazy(() => import('@/pages/SubjectPage'))
const MaterialPage     = lazy(() => import('@/pages/MaterialPage'))
const QuizPage         = lazy(() => import('@/pages/QuizPage'))
const QuizResultPage   = lazy(() => import('@/pages/QuizResultPage'))
const LeaderboardPage  = lazy(() => import('@/pages/LeaderboardPage'))
const DoubtsPage       = lazy(() => import('@/pages/DoubtsPage'))
const ProfilePage      = lazy(() => import('@/pages/ProfilePage'))
const UploadPage       = lazy(() => import('@/pages/UploadPage'))

/* ── Admin (heaviest — always split) ──────────────────────────── */
const AdminQueuePage   = lazy(() => import('@/pages/admin/AdminQueuePage'))
const AdminUsersPage   = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminStatsPage   = lazy(() => import('@/pages/admin/AdminStatsPage'))

/* ── Lightweight page-level skeleton shown while chunk loads ─── */
function PageFallback() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--primary-light)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <div style={{ fontSize: 14, color: 'var(--on-surface-muted)' }}>Loading…</div>
      </div>
    </div>
  )
}

/* ── Animated routes (must live inside BrowserRouter) ─────────── */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* ── Public ── */}
          <Route path="/"                        element={<LandingPage />} />
          <Route path="/login"                   element={<LoginPage />} />
          <Route path="/auth/callback"           element={<AuthCallbackPage />} />
          <Route path="/year/:year"              element={<YearPage />} />
          <Route path="/year/:year/subject/:id"  element={<SubjectPage />} />
          <Route path="/material/:id"            element={<MaterialPage />} />
          <Route path="/quiz/:id"                element={<QuizPage />} />
          <Route path="/quiz/:id/result"         element={<QuizResultPage />} />
          <Route path="/leaderboard"             element={<LeaderboardPage />} />
          <Route path="/doubts"                  element={<DoubtsPage />} />
          <Route path="/doubts/:id"              element={<DoubtsPage />} />
          <Route path="/profile/:handle"         element={<ProfilePage />} />

          {/* ── Requires login ── */}
          <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/upload"     element={<RequireAuth><UploadPage /></RequireAuth>} />
          <Route path="/profile"    element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/library"    element={<RequireAuth><ProfilePage /></RequireAuth>} />

          {/* ── Admin only ── */}
          <Route path="/admin"       element={<RequireAdmin><AdminQueuePage /></RequireAdmin>} />
          <Route path="/admin/queue" element={<RequireAdmin><AdminQueuePage /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="/admin/stats" element={<RequireAdmin><AdminStatsPage /></RequireAdmin>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {/* Accessibility: skip-to-main link */}
          <a
            href="#main-content"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 'var(--sp-3)',
              zIndex: 99999,
              background: 'var(--primary)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
            onFocus={e => { e.currentTarget.style.left = 'var(--sp-4)' }}
            onBlur={e => { e.currentTarget.style.left = '-9999px' }}
          >
            Skip to main content
          </a>

          <NavBar />

          <main id="main-content" style={{ paddingBottom: '80px' }}>
            <AnimatedRoutes />
          </main>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
