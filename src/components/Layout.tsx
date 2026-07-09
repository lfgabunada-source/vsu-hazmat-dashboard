import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useApp } from '../store/app'

export default function Layout() {
  const { session, initializing } = useApp()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="app-loading">
        <div className="app-loading-mark">V</div>
        <span>Loading VSU HazMat…</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar />
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
