import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Menu } from 'lucide-react'

const TITLES: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Waste generation, disposal activities & AI recommendations' },
  '/map': { title: 'Hazard Zone Map', sub: 'Schematic risk distribution across campus buildings' },
  '/coordination': { title: 'Unit Coordination', sub: 'Mandate 2 · Submission tracking across academic units' },
  '/new': { title: 'Report Waste', sub: 'Mandate 1 · The standardized TWG waste survey · AI checks how it’s handled' },
  '/waste': { title: 'Waste Register', sub: 'Mandate 5 · Waste generated per unit & disposal activities' },
  '/assessment': { title: 'AI Waste Assessment', sub: 'Are wastes handled properly? Recommendations vs. safety standards' },
  '/guidelines': { title: 'Guidelines', sub: 'Management & handling reference' },
  '/report': { title: 'Consolidated Report', sub: 'Mandate 8 · Executive report to the Office of the President' },
  '/admin/approvals': { title: 'Approvals', sub: 'Review and approve focal-person accounts' },
  '/admin/units': { title: 'Units & Focal Persons', sub: 'Configure academic units and their focal persons' },
}

export default function TopBar({ onMenu }: { onMenu?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const meta = TITLES[pathname] ?? { title: 'VSU HazMat', sub: 'Lab Safety Registry' }

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar-title grow">
        <h1>{meta.title}</h1>
        <p>{meta.sub}</p>
      </div>

      <button className="btn btn-primary" onClick={() => navigate('/new')}>
        <Plus size={16} /> <span className="btn-label">Report Waste</span>
      </button>
    </header>
  )
}
