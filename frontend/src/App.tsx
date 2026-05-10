import { Routes, Route } from 'react-router-dom'
import NavBar from './components/layout/NavBar'
import LandingPage from './pages/LandingPage'
import YearPage from './pages/YearPage'
import SubjectPage from './pages/SubjectPage'
import MaterialPage from './pages/MaterialPage'
import QuizPage from './pages/QuizPage'
import QuizResultPage from './pages/QuizResultPage'
import LeaderboardPage from './pages/LeaderboardPage'
import DoubtsPage from './pages/DoubtsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import UploadPage from './pages/UploadPage'

export default function App() {
  return (
    <>
      <NavBar />
      <main style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/year/:year" element={<YearPage />} />
          <Route path="/year/:year/subject/:id" element={<SubjectPage />} />
          <Route path="/material/:id" element={<MaterialPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/quiz/:id/result" element={<QuizResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/doubts" element={<DoubtsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:handle" element={<ProfilePage />} />
        </Routes>
      </main>
    </>
  )
}
