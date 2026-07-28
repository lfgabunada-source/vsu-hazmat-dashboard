import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BrandMark from './BrandMark'
import { useApp } from '../store/app'

export default function Layout() {
  const { session, initializing } = useApp()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  if (initializing) {
    return (
      <div className="app-loading">
        <div className="app-loading-mark"><BrandMark size={28} /></div>
        <span>Loading VSU HazMat…</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="app">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="main">
        <TopBar onMenu={() => setMenuOpen((o) => !o)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Guard for admin-only routes.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useApp()
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
