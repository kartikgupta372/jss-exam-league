import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import NavBar from '@/components/layout/NavBar'
import RequireAuth, { RequireAdmin } from '@/components/auth/RequireAuth'

import LandingPage      from '@/pages/LandingPage'
import LoginPage        from '@/pages/LoginPage'
import OnboardingPage   from '@/pages/OnboardingPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import YearPage         from '@/pages/YearPage'
import SubjectPage      from '@/pages/SubjectPage'
import MaterialPage     from '@/pages/MaterialPage'
import QuizPage         from '@/pages/QuizPage'
import QuizResultPage   from '@/pages/QuizResultPage'
import LeaderboardPage  from '@/pages/LeaderboardPage'
import DoubtsPage       from '@/pages/DoubtsPage'
import ProfilePage      from '@/pages/ProfilePage'
import AboutPage        from '@/pages/AboutPage'
import UploadPage       from '@/pages/UploadPage'
import AdminQueuePage   from '@/pages/admin/AdminQueuePage'
import AdminUsersPage   from '@/pages/admin/AdminUsersPage'
import AdminStatsPage   from '@/pages/admin/AdminStatsPage'

import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <main style={{ paddingBottom: '80px' }}>
          <Routes>
            <Route path="/"                         element={<LandingPage />} />
            <Route path="/login"                    element={<LoginPage />} />
            <Route path="/auth/callback"            element={<AuthCallbackPage />} />
            <Route path="/about"                    element={<AboutPage />} />
            <Route path="/year/:year"               element={<YearPage />} />
            <Route path="/year/:year/subject/:id"   element={<SubjectPage />} />
            <Route path="/material/:id"             element={<MaterialPage />} />
            <Route path="/quiz/:id"                 element={<QuizPage />} />
            <Route path="/quiz/:id/result"          element={<QuizResultPage />} />
            <Route path="/leaderboard"              element={<LeaderboardPage />} />
            <Route path="/doubts"                   element={<DoubtsPage />} />
            <Route path="/doubts/:id"               element={<DoubtsPage />} />
            <Route path="/profile/:handle"          element={<ProfilePage />} />
            <Route path="/onboarding"  element={<RequireAuth><OnboardingPage /></RequireAuth>} />
            <Route path="/upload"      element={<RequireAuth><UploadPage /></RequireAuth>} />
            <Route path="/profile"     element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/library"     element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/admin"         element={<RequireAdmin><AdminQueuePage /></RequireAdmin>} />
            <Route path="/admin/queue"   element={<RequireAdmin><AdminQueuePage /></RequireAdmin>} />
            <Route path="/admin/users"   element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
            <Route path="/admin/stats"   element={<RequireAdmin><AdminStatsPage /></RequireAdmin>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
