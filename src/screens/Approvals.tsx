import { Check, X, UserCheck, Clock, Mail } from 'lucide-react'
import { useApp } from '../store/app'
import { unitName } from '../data'
import { Pill } from '../components/ui'
import { useToast } from '../components/Toast'

export default function Approvals() {
  const { users, approve, reject } = useApp()
  const { toast } = useToast()

  const pending = users.filter((u) => u.status === 'pending')
  const decided = users.filter((u) => u.role === 'focal' && u.status !== 'pending')

  return (
    <div className="stack">
      <div className="page-intro">
        <p>
          Review account requests from unit focal persons. Only approved focal persons can
          sign in and add new material entries for their unit.
        </p>
      </div>

      {/* Pending */}
      <div className="card">
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--med)" /> Pending approval
          </h3>
          <span className="sub">{pending.length} awaiting decision</span>
        </div>
        <div className="card-pad" style={{ paddingTop: 6 }}>
          {pending.length === 0 && (
            <div className="muted" style={{ padding: 16, textAlign: 'center' }}>
              No pending requests.
            </div>
          )}
          {pending.map((u) => (
            <div key={u.id} className="approval-row">
              <div className="avatar" style={{ width: 40, height: 40 }}>
                {u.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
              </div>
              <div className="grow">
                <div className="cell-main">{u.name}</div>
                <div className="cell-sub" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={12} /> <span className="mono">{u.email}</span>
                  </span>
                  <span>{unitName(u.unitId ?? '')}</span>
                  <span>requested {u.requestedAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    reject(u.id)
                    toast(`${u.name}'s request was rejected.`, 'info')
                  }}
                >
                  <X size={15} /> Reject
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    approve(u.id)
                    toast(`${u.name} approved — they can now sign in and add entries.`)
                  }}
                >
                  <Check size={15} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decided */}
      <div className="card">
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={16} color="var(--vsu-green)" /> Focal person accounts
          </h3>
          <span className="sub">{decided.length} accounts</span>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Focal person</th>
                <th>Email</th>
                <th>Unit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {decided.map((u) => (
                <tr key={u.id}>
                  <td className="cell-main">{u.name}</td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{u.email}</td>
                  <td style={{ fontSize: 12.5 }}>{unitName(u.unitId ?? '')}</td>
                  <td>
                    <Pill tone={u.status === 'approved' ? 'low' : 'high'}>
                      {u.status === 'approved' ? 'Approved' : 'Rejected'}
                    </Pill>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.status === 'approved' ? (
                      <button
                        className="btn btn-ghost"
                        style={{ height: 32 }}
                        onClick={() => {
                          reject(u.id)
                          toast(`${u.name}'s access was revoked.`, 'info')
                        }}
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        style={{ height: 32 }}
                        onClick={() => {
                          approve(u.id)
                          toast(`${u.name} re-approved.`)
                        }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {decided.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No focal person accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
