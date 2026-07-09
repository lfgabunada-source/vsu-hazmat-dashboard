import { useState } from 'react'
import { Plus, Save, X, Pencil, Trash2, Building2, Mail } from 'lucide-react'
import { useApp } from '../store/app'
import { isVsuEmail } from '../store/app'
import { Pill, statusTone } from '../components/ui'
import { useToast } from '../components/Toast'

interface Draft {
  short: string
  name: string
  building: string
  coordinator: string
  focalEmail: string
}
const empty: Draft = { short: '', name: '', building: '', coordinator: '', focalEmail: '' }

export default function UnitsAdmin() {
  const { units, addUnit, updateUnit, removeUnit } = useApp()
  const { toast } = useToast()

  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(empty)
  const [showAdd, setShowAdd] = useState(false)
  const [newDraft, setNewDraft] = useState<Draft>(empty)

  const startEdit = (id: string) => {
    const u = units.find((x) => x.id === id)!
    setEditing(id)
    setDraft({
      short: u.short,
      name: u.name,
      building: u.building,
      coordinator: u.coordinator,
      focalEmail: u.focalEmail ?? '',
    })
  }

  const saveEdit = () => {
    if (draft.focalEmail && !isVsuEmail(draft.focalEmail)) {
      toast('Focal email must be a valid @vsu.edu.ph address.', 'info')
      return
    }
    updateUnit(editing!, { ...draft })
    toast('Unit updated.')
    setEditing(null)
  }

  const saveNew = () => {
    if (!newDraft.short.trim() && !newDraft.name.trim()) {
      toast('Enter at least a unit name.', 'info')
      return
    }
    if (newDraft.focalEmail && !isVsuEmail(newDraft.focalEmail)) {
      toast('Focal email must be a valid @vsu.edu.ph address.', 'info')
      return
    }
    addUnit({ ...newDraft, name: newDraft.name || newDraft.short, short: newDraft.short || newDraft.name })
    toast('Academic unit added.')
    setNewDraft(empty)
    setShowAdd(false)
  }

  const onRemove = async (id: string, label: string) => {
    const res = await removeUnit(id)
    if (!res.ok) toast(res.error, 'info')
    else toast(`Removed ${label}.`, 'info')
  }

  return (
    <div className="stack">
      <div className="flex items-center justify-between wrap gap-3">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <p>
            Configure the academic units covered by the registry and assign each unit's
            focal person and official <span className="mono">@vsu.edu.ph</span> email.
            Focal persons register against these units.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd((s) => !s)}>
          <Plus size={16} /> Add unit
        </button>
      </div>

      {showAdd && (
        <div className="card card-pad">
          <div className="section-title">New academic unit</div>
          <div className="units-edit-grid">
            <input placeholder="Short name (e.g. Chemistry)" value={newDraft.short} onChange={(e) => setNewDraft({ ...newDraft, short: e.target.value })} />
            <input placeholder="Full name (e.g. Department of Chemistry)" value={newDraft.name} onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })} />
            <input placeholder="Building" value={newDraft.building} onChange={(e) => setNewDraft({ ...newDraft, building: e.target.value })} />
            <input placeholder="Coordinator / focal person" value={newDraft.coordinator} onChange={(e) => setNewDraft({ ...newDraft, coordinator: e.target.value })} />
            <input placeholder="focal@vsu.edu.ph" value={newDraft.focalEmail} onChange={(e) => setNewDraft({ ...newDraft, focalEmail: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={saveNew}>
              <Save size={15} /> Save unit
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setNewDraft(empty) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} color="var(--vsu-green)" /> Academic units
          </h3>
          <span className="sub">{units.length} units configured</span>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Building</th>
                <th>Focal person</th>
                <th>Focal email</th>
                <th>Waste</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) =>
                editing === u.id ? (
                  <tr key={u.id} style={{ background: 'var(--card-2)' }}>
                    <td colSpan={7}>
                      <div className="section-title" style={{ marginBottom: 8 }}>
                        Editing · {u.short}
                      </div>
                      <div className="units-edit-grid">
                        <input placeholder="Short name" value={draft.short} onChange={(e) => setDraft({ ...draft, short: e.target.value })} />
                        <input placeholder="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                        <input placeholder="Building" value={draft.building} onChange={(e) => setDraft({ ...draft, building: e.target.value })} />
                        <input placeholder="Coordinator / focal person" value={draft.coordinator} onChange={(e) => setDraft({ ...draft, coordinator: e.target.value })} />
                        <input placeholder="focal@vsu.edu.ph" value={draft.focalEmail} onChange={(e) => setDraft({ ...draft, focalEmail: e.target.value })} />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="btn btn-primary" onClick={saveEdit}>
                          <Save size={15} /> Save
                        </button>
                        <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-main">{u.short}</div>
                      <div className="cell-sub">{u.name}</div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{u.building}</td>
                    <td style={{ fontSize: 12.5 }}>{u.coordinator}</td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      {u.focalEmail ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={12} color="var(--muted)" /> {u.focalEmail}
                        </span>
                      ) : (
                        <span className="muted">— unassigned —</span>
                      )}
                    </td>
                    <td className="mono">{u.itemCount}</td>
                    <td>
                      <Pill tone={statusTone(u.status)}>{u.status}</Pill>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => startEdit(u.id)} aria-label={`Edit ${u.short}`}>
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => onRemove(u.id, u.short)} aria-label={`Remove ${u.short}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
