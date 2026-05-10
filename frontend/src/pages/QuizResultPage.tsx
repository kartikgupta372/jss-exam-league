import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Trophy, Star, BookOpen } from 'lucide-react'

export default function QuizResultPage() {
  return <div className="container" style={{ paddingBlock:'var(--sp-10)', textAlign:'center' }}>
    <h1>Quiz Result</h1>
    <Link to="/leaderboard" className="btn btn-primary" style={{ marginTop:'var(--sp-6)' }}>View Leaderboard</Link>
  </div>
}
