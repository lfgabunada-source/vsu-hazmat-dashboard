import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Users,
  PlusCircle,
  Trash2,
  ShieldCheck,
  Wrench,
  BookOpen,
  FileText,
  UserCheck,
  Building2,
  LogOut,
} from 'lucide-react'
import { stats } from '../data'
import { useApp } from '../store/app'
import BrandMark from './BrandMark'

interface NavItemDef {
  to: string
  label: string
  icon: typeof LayoutDashboard
  ai?: boolean
  badge?: number
  badgeTone?: 'red' | 'amber'
  adminItem?: boolean // hidden from focal persons to keep their menu focused
}
interface Group {
  label: string
  items: NavItemDef[]
  adminOnly?: boolean
}

export default function Sidebar({
  open = false,
  onNavigate,
}: {
  open?: boolean
  onNavigate?: () => void
}) {
  const { session, isAdmin, pendingCount, logout } = useApp()
  const navigate = useNavigate()

  const groups: Group[] = [
    {
      label: 'Overview',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/map', label: 'Hazard Zone Map', icon: Map },
      ],
    },
    {
      label: 'Data Collection',
      items: [
        { to: '/survey', label: 'Survey Instrument', icon: ClipboardList },
        {
          to: '/coordination',
          label: 'Unit Coordination',
          icon: Users,
          badge: stats.pendingUnits,
          badgeTone: 'red',
          adminItem: true,
        },
      ],
    },
    {
      label: 'Waste',
      items: [
        { to: '/new', label: 'Report Waste', icon: PlusCircle, ai: true },
        { to: '/waste', label: 'Waste Register', icon: Trash2 },
      ],
    },
    {
      label: 'Safety',
      items: [
        { to: '/assessment', label: 'AI Waste Assessment', icon: ShieldCheck, ai: true },
        {
          to: '/actions',
          label: 'Corrective Actions',
          icon: Wrench,
          badge: stats.openActions,
          badgeTone: 'amber',
          adminItem: true,
        },
        { to: '/guidelines', label: 'Guidelines', icon: BookOpen },
      ],
    },
    {
      label: 'Administration',
      adminOnly: true,
      items: [
        {
          to: '/admin/approvals',
          label: 'Approvals',
          icon: UserCheck,
          badge: pendingCount,
          badgeTone: 'red',
        },
        { to: '/admin/units', label: 'Units & Focal Persons', icon: Building2 },
      ],
    },
    {
      label: 'Reporting',
      items: [{ to: '/report', label: 'Consolidated Report', icon: FileText, adminItem: true }],
    },
  ]

  // Show admin-only groups only to admins, and drop admin-only items (and any
  // group left empty) for focal persons so their menu stays focused.
  const visible = groups
    .filter((g) => !g.adminOnly || isAdmin)
    .map((g) => ({ ...g, items: g.items.filter((it) => isAdmin || !it.adminItem) }))
    .filter((g) => g.items.length > 0)

  const initials = (session?.name ?? '')
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><BrandMark size={22} /></div>
        <div className="brand-text">
          <b>VSU HazMat</b>
          <span>Lab Safety Registry</span>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        {visible.map((g) => (
          <div className="nav-group" key={g.label}>
            <div className="nav-group-label">{g.label}</div>
            {g.items.map((it) => {
              const Icon = it.icon
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span className="nav-label">{it.label}</span>
                  {it.ai && <span className="ai-badge">AI</span>}
                  {it.badge && it.badge > 0 ? (
                    <span className={`nav-count ${it.badgeTone}`}>{it.badge}</span>
                  ) : null}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="user-chip">
        <div className="avatar">{initials || 'VS'}</div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="u-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.name}
          </div>
          <div className="u-role">
            {isAdmin ? 'University Safety Officer · Admin' : 'Unit Focal Person'}
          </div>
        </div>
        <button
          className="logout-btn"
          aria-label="Sign out"
          title="Sign out"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
