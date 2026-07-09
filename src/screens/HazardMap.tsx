import { Building2, Layers } from 'lucide-react'
import { BUILDINGS } from '../data'

const RISK_RANK = { High: 3, Medium: 2, Low: 1 } as const
const cls = (r: 'High' | 'Medium' | 'Low') =>
  r === 'High' ? 'high' : r === 'Medium' ? 'med' : 'low'

export default function HazardMap() {
  return (
    <div className="stack">
      <div className="flex items-center justify-between wrap gap-3">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <p>
            Schematic zone diagram of campus buildings. Each building is bordered by its
            highest on-site risk; labs are shaded by risk level with live item counts.
          </p>
        </div>
        <div className="filter-row" aria-label="Legend">
          <span className="tag">
            <span className="dot high" /> High
          </span>
          <span className="tag">
            <span className="dot med" /> Medium
          </span>
          <span className="tag">
            <span className="dot low" /> Low
          </span>
        </div>
      </div>

      <div className="grid grid-3">
        {BUILDINGS.map((b) => {
          const top = b.labs.reduce(
            (acc, l) => (RISK_RANK[l.risk] > RISK_RANK[acc] ? l.risk : acc),
            'Low' as 'High' | 'Medium' | 'Low',
          )
          const total = b.labs.reduce((s, l) => s + l.items, 0)
          return (
            <div className={`card zone-card ${cls(top)}`} key={b.id}>
              <div className="card-head">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={16} color="var(--vsu-green)" />
                  {b.name}
                </h3>
                <span className={`pill ${cls(top)}`}>{top}</span>
              </div>
              <div className="card-pad">
                {b.labs.map((l) => (
                  <div className={`lab-row ${cls(l.risk)}`} key={l.name}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`dot ${cls(l.risk)}`} />
                      {l.name}
                    </span>
                    <span className="lab-count">{l.items} items</span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between"
                  style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}
                >
                  <span className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={13} /> {b.labs.length} labs
                  </span>
                  <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                    {total} materials
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
