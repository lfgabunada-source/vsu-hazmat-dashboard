import { Send, Building2, CheckCircle2, Clock, CircleDashed } from 'lucide-react'
import { stats, daysUntil } from '../data'
import { KpiCard, Pill, statusTone } from '../components/ui'
import { useToast } from '../components/Toast'
import { useApp } from '../store/app'

export default function UnitCoordination() {
  const { toast } = useToast()
  const { units: UNITS } = useApp()

  const submitted = UNITS.filter(
    (u) => u.status === 'Validated' || u.status === 'Submitted',
  ).length
  const inProgress = UNITS.filter((u) => u.status === 'In progress').length
  const notStarted = UNITS.filter((u) => u.status === 'Not started').length

  return (
    <div className="stack">
      <div className="grid grid-4">
        <KpiCard icon={<Building2 size={18} />} value={UNITS.length} label="Academic units" tone="info" />
        <KpiCard icon={<CheckCircle2 size={18} />} value={submitted} label="Submitted / validated" tone="low" />
        <KpiCard icon={<Clock size={18} />} value={inProgress} label="In progress" tone="med" />
        <KpiCard icon={<CircleDashed size={18} />} value={notStarted} label="Not started" tone="high" />
      </div>

      {/* Campus progress */}
      <div className="card card-pad">
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <div className="section-title" style={{ margin: 0 }}>
            Overall campus progress
          </div>
          <span className="mono" style={{ fontWeight: 600, fontSize: 15 }}>
            {stats.campusProgress}%
          </span>
        </div>
        <div className="progress">
          <span style={{ width: `${stats.campusProgress}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Units table */}
      <div className="card">
        <div className="card-head">
          <h3>Academic units</h3>
          <button
            className="btn btn-gold no-print"
            onClick={() =>
              toast(`Reminder sent to ${stats.pendingUnits} pending units.`, 'info')
            }
          >
            <Send size={15} /> Send reminder to pending units
          </button>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Coordinator</th>
                <th>Items</th>
                <th style={{ width: 190 }}>Progress</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => {
                const overdue = u.status === 'Not started' && daysUntil(u.deadline) < 0
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-main">{u.short}</div>
                      <div className="cell-sub">{u.building}</div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{u.coordinator}</td>
                    <td className="mono">{u.itemCount}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress grow">
                          <span
                            style={{
                              width: `${u.progress}%`,
                              background:
                                u.progress === 100
                                  ? 'var(--accent)'
                                  : u.progress === 0
                                    ? 'var(--border-strong)'
                                    : 'var(--med)',
                            }}
                          />
                        </div>
                        <span className="mono" style={{ fontSize: 11.5, width: 32 }}>
                          {u.progress}%
                        </span>
                      </div>
                    </td>
                    <td
                      className="mono"
                      style={{ color: overdue ? 'var(--high)' : 'var(--text)', fontWeight: overdue ? 600 : 400, fontSize: 12.5 }}
                    >
                      {new Date(u.deadline).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}
                      {overdue && ' · overdue'}
                    </td>
                    <td>
                      <Pill tone={statusTone(u.status)}>{u.status}</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
