import { CalendarClock } from 'lucide-react'
import { ACTIONS, unitName, daysUntil, type ActionStatus } from '../data'

const COLUMNS: ActionStatus[] = ['Open', 'In progress', 'Resolved']

function initials(name: string) {
  const parts = name.replace(/\./g, '').split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function CorrectiveActions() {
  return (
    <div className="stack">
      <div className="page-intro">
        <p>
          Remediation tasks generated from AI Safety Assessment findings. Cards move
          across the board as units close out corrective actions. Open critical/high items
          feed the sidebar badge.
        </p>
      </div>

      <div className="kanban">
        {COLUMNS.map((col) => {
          const items = ACTIONS.filter((a) => a.status === col)
          return (
            <div className="kanban-col" key={col}>
              <h4>
                {col}
                <span className="kcount mono">{items.length}</span>
              </h4>
              {items.map((a) => {
                const d = daysUntil(a.due)
                const overdue = d < 0 && a.status !== 'Resolved'
                return (
                  <div className="kan-card" key={a.id}>
                    <div className="flex items-center justify-between">
                      <span className={`sev-tag ${a.severity.toLowerCase()}`}>{a.severity}</span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: overdue ? 'var(--high)' : 'var(--muted)',
                          fontWeight: overdue ? 600 : 400,
                        }}
                      >
                        <CalendarClock size={12} />
                        {new Date(a.due).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="kt">{a.title}</div>
                    <div className="kmeta">{unitName(a.unitId)}</div>
                    <div className="kan-owner">
                      <span className="avatar-sm">{initials(a.owner)}</span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{a.owner}</span>
                      {a.sourceFinding && (
                        <span className="tag mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                          {a.sourceFinding}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              {items.length === 0 && (
                <div className="muted" style={{ fontSize: 12, padding: 12, textAlign: 'center' }}>
                  No tasks
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
