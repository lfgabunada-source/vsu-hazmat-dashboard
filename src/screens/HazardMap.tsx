import { Building2, Layers, MapPin } from 'lucide-react'
import { useApp } from '../store/app'
import type { Severity } from '../data'

type Risk = 'High' | 'Medium' | 'Low'
const RISK_RANK = { High: 3, Medium: 2, Low: 1 } as const
const cls = (r: Risk) => (r === 'High' ? 'high' : r === 'Medium' ? 'med' : 'low')
const sevRisk = (s: Severity): Risk =>
  s === 'CRITICAL' || s === 'HIGH' ? 'High' : s === 'MEDIUM' ? 'Medium' : 'Low'
const worse = (a: Risk, b: Risk): Risk => (RISK_RANK[a] >= RISK_RANK[b] ? a : b)

export default function HazardMap() {
  const { units, wasteStreams } = useApp()

  const buildingOf = (unitId: string) => units.find((u) => u.id === unitId)?.building ?? '—'
  const buildings = [...new Set(units.map((u) => u.building).filter(Boolean))].sort()

  const data = buildings.map((building) => {
    const streams = wasteStreams.filter((w) => buildingOf(w.unitId) === building)
    const roomMap = new Map<string, { risk: Risk; count: number }>()
    for (const w of streams) {
      const room = w.room?.trim() || 'Unspecified room'
      const risk = sevRisk(w.ai.severity)
      const cur = roomMap.get(room)
      roomMap.set(room, { risk: cur ? worse(cur.risk, risk) : risk, count: (cur?.count ?? 0) + 1 })
    }
    const rooms = [...roomMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => RISK_RANK[b.risk] - RISK_RANK[a.risk] || a.name.localeCompare(b.name))
    const top = rooms.reduce((acc, r) => worse(acc, r.risk), 'Low' as Risk)
    return { building, rooms, top, total: streams.length }
  })

  const anyData = data.some((b) => b.total > 0)

  return (
    <div className="stack">
      <div className="flex items-center justify-between wrap gap-3">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <p>
            Live hazard map — reported waste streams grouped by <b>building</b> and{' '}
            <b>laboratory / room</b>, shaded by risk (from the AI severity of each stream).
            Each building takes the highest risk found inside it.
          </p>
        </div>
        <div className="filter-row" aria-label="Legend">
          <span className="tag"><span className="dot high" /> High</span>
          <span className="tag"><span className="dot med" /> Medium</span>
          <span className="tag"><span className="dot low" /> Low</span>
        </div>
      </div>

      {!anyData ? (
        <div className="card empty-hero">
          <div className="empty-hero-mark"><MapPin size={26} /></div>
          <h2>No hazard zones yet</h2>
          <p>
            Once waste streams are reported with their laboratory / room, they’ll appear here
            grouped by building and coloured by risk.
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {data.map((b) => (
            <div className={`card zone-card ${cls(b.top)}`} key={b.building}>
              <div className="card-head">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={16} color="var(--vsu-green)" />
                  {b.building}
                </h3>
                {b.total > 0 && <span className={`pill ${cls(b.top)}`}>{b.top}</span>}
              </div>
              <div className="card-pad">
                {b.rooms.length === 0 ? (
                  <div className="muted" style={{ fontSize: 12.5, padding: '8px 2px' }}>
                    No waste reported yet.
                  </div>
                ) : (
                  b.rooms.map((r) => (
                    <div className={`lab-row ${cls(r.risk)}`} key={r.name}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span className={`dot ${cls(r.risk)}`} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </span>
                      </span>
                      <span className="lab-count">{r.count}</span>
                    </div>
                  ))
                )}
                <div
                  className="flex items-center justify-between"
                  style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}
                >
                  <span className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={13} /> {b.rooms.length} {b.rooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                  <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                    {b.total} {b.total === 1 ? 'stream' : 'streams'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
