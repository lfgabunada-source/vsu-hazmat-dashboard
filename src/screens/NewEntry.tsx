import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical,
  Dna,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  Lock,
  UserCircle2,
  Recycle,
} from 'lucide-react'
import {
  statusFromVerdict,
  unitName,
  type WasteCategory,
  type WasteStream,
} from '../data'
import {
  advise,
  classifyHazard,
  methodsFor,
  CHEM_TRAITS,
  BIO_TRAITS,
  type Trait,
} from '../lib/wasteAdvisor'
import { useToast } from '../components/Toast'
import { useApp } from '../store/app'

type CheckState = 'ok' | 'warn' | 'err' | 'idle'

function CheckRow({ state, title, detail }: { state: CheckState; title: string; detail: string }) {
  const icon =
    state === 'ok' ? <Check size={13} /> : state === 'err' ? <X size={13} /> : state === 'warn' ? <AlertTriangle size={12} /> : <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor' }} />
  return (
    <div className="check-item">
      <span className={`check-icon ${state}`}>{icon}</span>
      <div className="check-body grow">
        <div className="ct">{title}</div>
        <div className="cd">{detail}</div>
      </div>
    </div>
  )
}

export default function NewEntry() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session, units, isAdmin, addWasteStream } = useApp()

  const isFocal = session?.role === 'focal'
  const canAdd = isAdmin || (isFocal && session?.status === 'approved')

  const [category, setCategory] = useState<WasteCategory>('Chemical')
  const [name, setName] = useState('')
  const [activity, setActivity] = useState('')
  const [traits, setTraits] = useState<Trait[]>([])
  const [physicalState, setPhysicalState] = useState('Liquid')
  const [volume, setVolume] = useState('')
  const [volUnit, setVolUnit] = useState('L / month')
  const [storage, setStorage] = useState('')
  const [method, setMethod] = useState('')
  const [disposalActivity, setDisposalActivity] = useState('')
  const [treatment, setTreatment] = useState('')
  const [hauler, setHauler] = useState('')
  const [manifest, setManifest] = useState('')
  const [unitId, setUnitId] = useState(isFocal ? (session?.unitId ?? '') : '')

  const traitOptions = category === 'Chemical' ? CHEM_TRAITS : BIO_TRAITS
  const methodOptions = methodsFor(category)

  const toggleTrait = (t: Trait) =>
    setTraits((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const switchCategory = (c: WasteCategory) => {
    setCategory(c)
    setTraits([])
    setMethod('')
    setVolUnit(c === 'Chemical' ? 'L / month' : 'kg / month')
  }

  const rec = useMemo(() => {
    if (!method) return null
    return advise({
      category,
      traits,
      method: method as WasteStream['method'],
      hasHauler: hauler.trim().length > 0,
      hasManifest: manifest.trim().length > 0,
    })
  }, [category, traits, method, hauler, manifest])

  const hazard = useMemo(() => classifyHazard(category, traits), [category, traits])

  const requiredFilled =
    name.trim() && activity.trim() && volume.trim() && storage.trim() && method && disposalActivity.trim() && unitId

  // checklist
  const classifyState: CheckState = name.trim() ? (traits.length > 0 ? 'ok' : 'warn') : 'idle'
  const fieldsState: CheckState = requiredFilled ? 'ok' : name.trim() ? 'warn' : 'idle'
  const methodState: CheckState = !rec
    ? 'idle'
    : rec.verdict === 'Properly handled'
      ? 'ok'
      : rec.verdict === 'Needs improvement'
        ? 'warn'
        : 'err'
  const treatmentExpected =
    method === 'On-site autoclave' || method === 'Non-burn treatment' || method === 'Neutralization'
  const treatmentState: CheckState = !method
    ? 'idle'
    : treatmentExpected
      ? treatment.trim()
        ? 'ok'
        : 'warn'
      : 'ok'
  const haulerNeeded = method === 'DENR-accredited hauler'
  const manifestState: CheckState = !haulerNeeded
    ? 'idle'
    : hauler.trim() && manifest.trim()
      ? 'ok'
      : 'warn'

  const summary: 'clear' | 'review' | 'blocked' = !rec
    ? 'review'
    : rec.verdict === 'Properly handled'
      ? 'clear'
      : rec.verdict === 'Needs improvement'
        ? 'review'
        : 'blocked'

  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!requiredFilled || !rec || submitting) return
    const stream: WasteStream = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      unitId,
      category,
      name: name.trim(),
      sourceActivity: activity.trim(),
      hazardClass: hazard.hazardClass,
      hazardCode: hazard.hazardCode,
      physicalState,
      volumePerMonth: `${volume} ${volUnit.replace(' / month', '')}/mo`,
      storage: storage.trim(),
      disposalActivity: disposalActivity.trim(),
      method: method as WasteStream['method'],
      treatment: treatment.trim() || (treatmentExpected ? '—' : 'Not applicable'),
      hauler: hauler.trim() || null,
      manifest: manifest.trim() || null,
      status: statusFromVerdict(rec.verdict),
      ai: rec,
    }
    setSubmitting(true)
    const res = await addWasteStream(stream)
    setSubmitting(false)
    if (!res.ok) {
      toast(`Could not submit: ${res.error}`, 'info')
      return
    }
    toast(`Waste stream "${stream.name}" submitted for ${unitName(unitId)}.`)
    navigate('/waste')
  }

  if (!canAdd) {
    return (
      <div className="card card-pad" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
        <span className="check-icon err" style={{ width: 44, height: 44, margin: '0 auto 14px' }}>
          <Lock size={20} />
        </span>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>Account pending approval</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          Only approved focal persons and the administrator can submit waste entries. Your
          account is awaiting approval from the University Safety Officer.
        </p>
      </div>
    )
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      {/* ---------- Form ---------- */}
      <div className="card grow" style={{ flexBasis: '58%' }}>
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Recycle size={16} color="var(--vsu-green)" /> Waste stream details
          </h3>
          <span className="sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserCircle2 size={14} /> {session?.name}
            {isFocal ? ` · ${unitName(session?.unitId ?? '')}` : ' · Admin'}
          </span>
        </div>
        <div className="card-pad">
          {/* Category */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Waste category</label>
            <div className="toggle-group">
              <button className={category === 'Chemical' ? 'active chem' : ''} onClick={() => switchCategory('Chemical')}>
                <FlaskConical size={15} /> Chemical
              </button>
              <button className={category === 'Biological' ? 'active bio' : ''} onClick={() => switchCategory('Biological')}>
                <Dna size={15} /> Biological
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="field full">
              <label>Waste name / description <span className="req">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={category === 'Chemical' ? 'e.g. Spent formalin fixative' : 'e.g. BSL-2 culture waste (agar plates)'}
              />
            </div>

            <div className="field full">
              <label>Generating activity <span className="req">*</span></label>
              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder={category === 'Chemical' ? 'e.g. Histology tissue fixation' : 'e.g. Microbiology culturing & staining'}
              />
            </div>

            {/* Hazard traits */}
            <div className="field full">
              <label>Hazard characteristics <span className="muted" style={{ fontWeight: 400 }}>(select all that apply — informs the AI recommendation)</span></label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {traitOptions.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`filter-pill ${traits.includes(t.key) ? 'active' : ''}`}
                    style={{ height: 30 }}
                    onClick={() => toggleTrait(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Physical state</label>
              <select value={physicalState} onChange={(e) => setPhysicalState(e.target.value)}>
                {(category === 'Chemical'
                  ? ['Liquid', 'Solid', 'Sludge', 'Aqueous', 'Mixed']
                  : ['Cultures', 'Sharps', 'Tissue', 'Liquid', 'Mixed']
                ).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Volume generated <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="0" style={{ flex: 1 }} />
                <select value={volUnit} onChange={(e) => setVolUnit(e.target.value)} style={{ width: 120 }}>
                  {['L / month', 'mL / month', 'kg / month', 'g / month'].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field full">
              <label>Interim storage before disposal <span className="req">*</span></label>
              <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g. Labelled carboy in ventilated store, secondary containment" />
            </div>

            <div className="field">
              <label>Disposal method <span className="req">*</span></label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="">Select method…</option>
                {methodOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Academic unit <span className="req">*</span>
                {isFocal && <span className="muted" style={{ fontWeight: 400 }}> · locked</span>}
              </label>
              {isFocal ? (
                <input value={unitName(unitId)} disabled />
              ) : (
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                  <option value="">Select unit…</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.short} — {u.building}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="field full">
              <label>Describe current disposal activity <span className="req">*</span></label>
              <textarea
                rows={2}
                value={disposalActivity}
                onChange={(e) => setDisposalActivity(e.target.value)}
                placeholder="e.g. Spent formalin poured to drain after tissue processing / Autoclaved on-site then handed to DOH-licensed hauler in yellow bags"
              />
            </div>

            <div className="field">
              <label>Treatment applied {(method === 'On-site autoclave' || method === 'Non-burn treatment' || method === 'Neutralization') && <span className="muted" style={{ fontWeight: 400 }}>· recommended</span>}</label>
              <input value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. Autoclave 121°C 30 min / pH neutralization" />
            </div>
            <div className="field">
              <label>Hauler {method === 'DENR-accredited hauler' && <span className="muted" style={{ fontWeight: 400 }}>· required</span>}</label>
              <input value={hauler} onChange={(e) => setHauler(e.target.value)} placeholder="e.g. Cleanway (DENR-accredited)" />
            </div>
            <div className="field full">
              <label>Manifest / reference {method === 'DENR-accredited hauler' && <span className="muted" style={{ fontWeight: 400 }}>· required</span>}</label>
              <input value={manifest} onChange={(e) => setManifest(e.target.value)} placeholder="e.g. MNF-2026-0142" />
            </div>

            <div className="field full">
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!requiredFilled || submitting}
                style={{ width: '100%', justifyContent: 'center', height: 44 }}
              >
                {submitting
                  ? 'Submitting…'
                  : summary === 'blocked'
                    ? 'Submit waste stream (flagged for correction)'
                    : 'Submit waste stream'}
              </button>
              {!requiredFilled && (
                <span className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Complete all required (*) fields to submit. Improper disposal is still recorded — and flagged for correction.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- AI panel + checklist ---------- */}
      <div className="stack" style={{ flexBasis: '42%', flexShrink: 0, width: 0, minWidth: 320 }}>
        <div className="ai-panel">
          <div className="ai-panel-head">
            <Sparkles size={16} className="spark" />
            <h3>AI disposal recommendation</h3>
            <span className="live"><span className="live-dot" /> LIVE</span>
          </div>
          <div className="ai-panel-body">
            {!method ? (
              <div className="muted" style={{ color: 'rgba(233,239,233,0.6)', fontSize: 13 }}>
                Select a disposal method — the AI evaluates it against this waste's hazard
                profile and recommends whether it is handled properly, citing the relevant
                biosafety and chemical-safety standards.
              </div>
            ) : rec ? (
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                  <span className={`sev-tag ${rec.severity.toLowerCase()}`}>{rec.severity}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: rec.verdict === 'Properly handled' ? '#9be0b4' : rec.verdict === 'Needs improvement' ? '#f0cf8a' : '#f4b8af',
                    }}
                  >
                    {rec.verdict}
                  </span>
                </div>

                <div className="label">Waste classification</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className="chip">{hazard.hazardClass}</span>
                  <span className="chip mono">{hazard.hazardCode}</span>
                </div>

                <div className="label">Recommendation</div>
                <p className="kv" style={{ color: '#d6e6dc', marginBottom: 12, lineHeight: 1.5 }}>{rec.summary}</p>

                <div className="label">Recommended actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {rec.actions.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#d6e6dc', lineHeight: 1.4 }}>
                      <Check size={13} style={{ marginTop: 2, flexShrink: 0, color: '#7fe6a3' }} />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>

                <div className="divider" />
                <div className="label">Based on standards</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {rec.standards.map((s) => (
                    <span className="chip" key={s} style={{ background: 'rgba(42,111,219,0.18)', borderColor: 'rgba(42,111,219,0.3)', color: '#a8c5f5' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* checklist */}
        <div className="card">
          <div className="card-head">
            <h3>Submission checklist</h3>
          </div>
          <div style={{ padding: '4px 16px 8px' }}>
            <div className="check-list">
              <CheckRow
                state={classifyState}
                title="Waste classified"
                detail={!name.trim() ? 'Enter a waste name' : traits.length > 0 ? `${traits.length} hazard trait(s) declared` : 'Add hazard characteristics for a sharper recommendation'}
              />
              <CheckRow
                state={fieldsState}
                title="Required fields complete"
                detail={requiredFilled ? 'All mandatory fields provided' : 'Name, activity, volume, storage, method, disposal & unit required'}
              />
              <CheckRow
                state={methodState}
                title="Disposal method appropriate"
                detail={!rec ? 'Select a disposal method' : rec.verdict === 'Properly handled' ? 'Method matches recommended practice' : rec.verdict === 'Needs improvement' ? 'Method acceptable with improvements' : 'Method conflicts with safe practice — flagged'}
              />
              <CheckRow
                state={treatmentState}
                title="Treatment recorded"
                detail={!method ? 'Select a method' : !treatmentExpected ? 'Not required for this method' : treatment.trim() ? 'Treatment documented' : 'This method should record the treatment applied'}
              />
              <CheckRow
                state={manifestState}
                title="Hauler & manifest"
                detail={!haulerNeeded ? 'Not required for this method' : hauler.trim() && manifest.trim() ? 'Hauler and manifest recorded' : 'Hauler consignment needs an accredited hauler + manifest'}
              />
            </div>

            <div className={`summary-banner ${summary}`} style={{ marginBottom: 12 }}>
              {summary === 'clear' && <Check size={17} />}
              {summary === 'review' && <AlertTriangle size={16} />}
              {summary === 'blocked' && <X size={17} />}
              {summary === 'clear' ? 'Properly handled — good to submit' : summary === 'review' ? 'Review — improvements recommended' : 'Improper disposal — will be flagged for correction'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
