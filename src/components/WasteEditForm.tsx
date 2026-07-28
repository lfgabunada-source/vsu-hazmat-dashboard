import { useMemo, useState } from 'react'
import { Save, X, Sparkles } from 'lucide-react'
import {
  statusFromVerdict,
  type AcademicUnit,
  type WasteStream,
  type WasteCategory,
  type DisposalMethod,
} from '../data'
import {
  advise,
  adviseCustom,
  inferTraits,
  classifyHazard,
  methodLabel,
  METHOD_OPTIONS,
  CHEM_METHODS,
  BIO_METHODS,
} from '../lib/wasteAdvisor'
import { useApp } from '../store/app'
import { useToast } from './Toast'

const PHYS: Record<WasteCategory, string[]> = {
  Chemical: ['Liquid', 'Solid', 'Sludge / paste', 'Mixed'],
  Biological: ['Cultures / plates', 'Liquid', 'Sharps', 'Tissue', 'Mixed'],
}
const KNOWN_METHODS = [...CHEM_METHODS, ...BIO_METHODS] as string[]

export default function WasteEditForm({
  stream,
  units,
  onCancel,
  onSaved,
}: {
  stream: WasteStream
  units: AcademicUnit[]
  onCancel: () => void
  onSaved: () => void
}) {
  const { updateWasteStream } = useApp()
  const { toast } = useToast()

  const isOther = !KNOWN_METHODS.includes(stream.method)

  const [category, setCategory] = useState<WasteCategory>(stream.category)
  const [name, setName] = useState(stream.name)
  const [room, setRoom] = useState(stream.room ?? '')
  const [activity, setActivity] = useState(stream.sourceActivity)
  const [physicalState, setPhysicalState] = useState(stream.physicalState)
  const [volume, setVolume] = useState(stream.volumePerMonth)
  const [storage, setStorage] = useState(stream.storage)
  const [method, setMethod] = useState<string>(isOther ? 'Other' : stream.method)
  const [customMethod, setCustomMethod] = useState(isOther ? stream.method : '')
  const [treatment, setTreatment] = useState(stream.treatment)
  const [hauler, setHauler] = useState(stream.hauler ?? '')
  const [unitId, setUnitId] = useState(stream.unitId)
  const [busy, setBusy] = useState(false)

  const switchCategory = (c: WasteCategory) => {
    setCategory(c)
    if (method !== 'Other' && !METHOD_OPTIONS[c].some((m) => m.value === method)) setMethod('')
    if (!PHYS[c].includes(physicalState)) setPhysicalState(PHYS[c][0])
  }

  const traits = useMemo(() => inferTraits(category, `${name} ${activity}`), [category, name, activity])
  const hazard = useMemo(() => classifyHazard(category, traits), [category, traits])
  const rec = useMemo(() => {
    if (!method) return null
    if (method === 'Other') return customMethod.trim() ? adviseCustom(category, traits, customMethod) : null
    return advise({ category, traits, method: method as DisposalMethod, hasHauler: hauler.trim().length > 0 })
  }, [category, traits, method, customMethod, hauler])

  const canSave =
    !!(name.trim() && activity.trim() && volume.trim() && storage.trim() && method && unitId && room.trim() && rec) &&
    (method !== 'Other' || !!customMethod.trim())

  const verdictColor =
    rec?.verdict === 'Properly handled' ? 'var(--low)' : rec?.verdict === 'Needs improvement' ? 'var(--med)' : 'var(--high)'

  const save = async () => {
    if (!canSave || !rec || busy) return
    setBusy(true)
    const methodValue = method === 'Other' ? customMethod.trim() : method
    const res = await updateWasteStream(stream.id, {
      unitId,
      category,
      name: name.trim(),
      room: room.trim(),
      sourceActivity: activity.trim(),
      hazardClass: hazard.hazardClass,
      hazardCode: hazard.hazardCode,
      physicalState,
      volumePerMonth: volume.trim(),
      storage: storage.trim(),
      disposalActivity: method === 'Other' ? customMethod.trim() : methodLabel(method),
      method: methodValue,
      treatment: treatment.trim() || 'Not specified',
      hauler: hauler.trim() || null,
      status: statusFromVerdict(rec.verdict),
      ai: rec,
    })
    setBusy(false)
    if (!res.ok) {
      toast(`Could not save: ${res.error}`, 'info')
      return
    }
    toast(`Updated “${name.trim()}”.`)
    onSaved()
  }

  return (
    <div className="waste-card" style={{ background: 'var(--card)', borderColor: 'var(--accent)' }}>
      <div className="card-pad" style={{ padding: 14 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Editing waste stream</div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label>Type of waste</label>
          <div className="toggle-group">
            <button className={category === 'Chemical' ? 'active chem' : ''} onClick={() => switchCategory('Chemical')}>Chemical</button>
            <button className={category === 'Biological' ? 'active bio' : ''} onClick={() => switchCategory('Biological')}>Biological</button>
          </div>
        </div>

        <div className="form-grid">
          <div className="field full">
            <label>Waste name or description</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Academic unit</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.short} — {u.building}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Laboratory / Room</label>
            <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Rm 204 — Organic Lab" />
          </div>
          <div className="field full">
            <label>Activity that produced it</label>
            <input value={activity} onChange={(e) => setActivity(e.target.value)} />
          </div>
          <div className="field">
            <label>Physical state</label>
            <select value={physicalState} onChange={(e) => setPhysicalState(e.target.value)}>
              {(PHYS[category].includes(physicalState) ? PHYS[category] : [physicalState, ...PHYS[category]]).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Amount generated</label>
            <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="e.g. 6 L per month" />
          </div>
          <div className="field full">
            <label>Interim storage</label>
            <input value={storage} onChange={(e) => setStorage(e.target.value)} />
          </div>
          <div className="field">
            <label>Disposal method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">Select…</option>
              {METHOD_OPTIONS[category].map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
              <option value="Other">Other — type it in</option>
            </select>
          </div>
          {method === 'Other' && (
            <div className="field">
              <label>Describe the method</label>
              <input value={customMethod} onChange={(e) => setCustomMethod(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Treatment applied</label>
            <input value={treatment} onChange={(e) => setTreatment(e.target.value)} />
          </div>
          <div className="field full">
            <label>Collected by (hauler)</label>
            <input value={hauler} onChange={(e) => setHauler(e.target.value)} placeholder="optional" />
          </div>
        </div>

        {rec && (
          <div
            className="flex items-center gap-2"
            style={{ marginTop: 12, padding: '9px 12px', borderRadius: 9, background: 'var(--card-2)', border: '1px solid var(--border)' }}
          >
            <Sparkles size={14} color="var(--gold)" />
            <span style={{ fontSize: 12.5 }}>AI re-check:</span>
            <span className={`sev-tag ${rec.severity.toLowerCase()}`}>{rec.severity}</span>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: verdictColor }}>{rec.verdict}</span>
          </div>
        )}

        <div className="flex gap-2" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={save} disabled={!canSave || busy}>
            <Save size={15} /> {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            <X size={15} /> Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
