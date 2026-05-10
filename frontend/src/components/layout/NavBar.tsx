import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Search, BookOpen, Home, Trophy, HelpCircle, User } from 'lucide-react'
import { useState } from 'react'

export default function NavBar() {
  const [year, setYear] = useState<1 | 2>(2)
  const navigate = useNavigate()

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            Exam<span>League</span>
          </Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({isActive})=>`nav-link${isActive?' active':''}`}>Home</NavLink>
            <NavLink to={`/year/${year}`} className={({isActive})=>`nav-link${isActive?' active':''}`}>Subjects</NavLink>
            <NavLink to="/leaderboard" className={({isActive})=>`nav-link${isActive?' active':''}`}>Leaderboard</NavLink>
            <NavLink to="/doubts" className={({isActive})=>`nav-link${isActive?' active':''}`}>Doubts</NavLink>
          </div>

          <div className="navbar-spacer" />

          <div className="navbar-actions">
            <div className="year-toggle">
              <button className={`year-toggle-btn${year===1?' active':''}`} onClick={()=>{ setYear(1); navigate('/year/1') }}>1st Yr</button>
              <button className={`year-toggle-btn${year===2?' active':''}`} onClick={()=>{ setYear(2); navigate('/year/2') }}>2nd Yr</button>
            </div>
            <button className="icon-btn" aria-label="Search"><Search size={17}/></button>
            <button className="icon-btn" aria-label="Notifications"><Bell size={17}/></button>
            <Link to="/profile" className="avatar-btn" aria-label="Profile">K</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bottom-tab-bar">
        <div className="bottom-tab-bar-inner">
          <NavLink to="/" end className={({isActive})=>`tab-item${isActive?' active':''}`}>
            <Home/><span>Home</span>
          </NavLink>
          <NavLink to="/year/2" className={({isActive})=>`tab-item${isActive?' active':''}`}>
            <BookOpen/><span>Subjects</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({isActive})=>`tab-item${isActive?' active':''}`}>
            <Trophy/><span>League</span>
          </NavLink>
          <NavLink to="/doubts" className={({isActive})=>`tab-item${isActive?' active':''}`}>
            <HelpCircle/><span>Doubts</span>
          </NavLink>
          <NavLink to="/profile" className={({isActive})=>`tab-item${isActive?' active':''}`}>
            <User/><span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </>
  )
}
