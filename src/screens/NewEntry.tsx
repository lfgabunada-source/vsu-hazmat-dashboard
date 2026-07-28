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
  type DisposalMethod,
} from '../data'
import {
  advise,
  adviseCustom,
  classifyHazard,
  inferTraits,
  suggestStorage,
  suggestTreatment,
  traitLabel,
  methodLabel,
  METHOD_OPTIONS,
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

const UNIT_ABBR: Record<string, string> = { Liters: 'L', Milliliters: 'mL', Kilograms: 'kg', Grams: 'g' }
const PHYS: Record<WasteCategory, string[]> = {
  Chemical: ['Liquid', 'Solid', 'Sludge / paste', 'Mixed'],
  Biological: ['Cultures / plates', 'Liquid', 'Sharps', 'Tissue', 'Mixed'],
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
  const [physicalState, setPhysicalState] = useState('Liquid')
  const [amount, setAmount] = useState('')
  const [amtUnit, setAmtUnit] = useState('Liters')
  const [amtPer, setAmtPer] = useState('per month')
  const [storage, setStorage] = useState('')
  const [method, setMethod] = useState('')
  const [customMethod, setCustomMethod] = useState('')
  const [treatment, setTreatment] = useState('')
  const [hauler, setHauler] = useState('')
  const [unitId, setUnitId] = useState(isFocal ? (session?.unitId ?? '') : '')
  const [submitting, setSubmitting] = useState(false)

  const switchCategory = (c: WasteCategory) => {
    setCategory(c)
    setMethod('')
    setCustomMethod('')
    setPhysicalState(PHYS[c][0])
    setAmtUnit(c === 'Chemical' ? 'Liters' : 'Kilograms')
  }

  // AI infers hazard traits from the name + activity text — no checkboxes.
  const traits = useMemo(() => inferTraits(category, `${name} ${activity}`), [category, name, activity])
  const hazard = useMemo(() => classifyHazard(category, traits), [category, traits])
  const haulerRelevant = method === 'DENR-accredited hauler' || method === 'Non-burn treatment'

  const rec = useMemo(() => {
    if (!method) return null
    if (method === 'Other') return customMethod.trim() ? adviseCustom(category, traits, customMethod) : null
    return advise({
      category,
      traits,
      method: method as DisposalMethod,
      hasHauler: hauler.trim().length > 0,
    })
  }, [category, traits, method, customMethod, hauler])

  const storageSug = useMemo(() => suggestStorage(category, traits), [category, traits])
  const treatmentSug = useMemo(
    () => (method && method !== 'Other' ? suggestTreatment(category, method) : ''),
    [category, method],
  )

  const requiredFilled =
    name.trim() && activity.trim() && amount.trim() && storage.trim() && method && unitId &&
    (method !== 'Other' || customMethod.trim())

  const methodState: CheckState = !rec
    ? 'idle'
    : rec.verdict === 'Properly handled'
      ? 'ok'
      : rec.verdict === 'Needs improvement'
        ? 'warn'
        : 'err'

  const summary: 'clear' | 'review' | 'blocked' = !rec
    ? 'review'
    : rec.verdict === 'Properly handled'
      ? 'clear'
      : rec.verdict === 'Needs improvement'
        ? 'review'
        : 'blocked'

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
      volumePerMonth: `${amount} ${UNIT_ABBR[amtUnit] ?? amtUnit} ${amtPer}`,
      storage: storage.trim(),
      disposalActivity: method === 'Other' ? customMethod.trim() : methodLabel(method),
      method: method === 'Other' ? customMethod.trim() : method,
      treatment: treatment.trim() || 'Not specified',
      hauler: hauler.trim() || null,
      manifest: null,
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
            <Recycle size={16} color="var(--vsu-green)" /> Report a waste stream
          </h3>
          <span className="sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserCircle2 size={14} /> {session?.name}
            {isFocal ? ` · ${unitName(session?.unitId ?? '')}` : ' · Admin'}
          </span>
        </div>
        <div className="card-pad">
          {/* 1. Category */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Type of waste</label>
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
            {/* 2. Name */}
            <div className="field full">
              <label>Waste name or description <span className="req">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={category === 'Chemical' ? 'e.g. Spent acetone, waste formalin, used HCl…' : 'e.g. Bacterial culture plates, blood samples…'}
              />
            </div>

            {/* 3. Generating activity */}
            <div className="field full">
              <label>What activity produced this waste? <span className="req">*</span></label>
              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder={category === 'Chemical' ? 'e.g. Cleaning glassware with solvent, titration experiment…' : 'e.g. Staining bacterial cultures, preserving tissue…'}
              />
              <span className="muted" style={{ fontSize: 11.5 }}>
                The lab work or process that created it — simply, “what were you doing when this waste was made?”
              </span>
            </div>

            {/* 4. Physical state */}
            <div className="field">
              <label>Physical state</label>
              <select value={physicalState} onChange={(e) => setPhysicalState(e.target.value)}>
                {PHYS[category].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 6. Amount */}
            <div className="field">
              <label>How much is generated? <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ flex: '1 1 60px', minWidth: 0 }} />
                <select value={amtUnit} onChange={(e) => setAmtUnit(e.target.value)} style={{ flex: '1 1 90px' }}>
                  {['Liters', 'Milliliters', 'Kilograms', 'Grams'].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <select value={amtPer} onChange={(e) => setAmtPer(e.target.value)} style={{ flex: '1 1 90px' }}>
                  {['per month', 'per week'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <span className="muted" style={{ fontSize: 11.5 }}>A rough estimate is fine.</span>
            </div>

            {/* 7. Interim storage + AI suggestion */}
            <div className="field full">
              <label>Where is it stored before disposal? <span className="req">*</span></label>
              <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g. Labelled bottle in the flammables cabinet" />
              {name.trim() && storage.trim() !== storageSug && (
                <button type="button" className="ai-suggest" onClick={() => setStorage(storageSug)}>
                  <Sparkles size={12} />
                  <span><b>AI suggests:</b> {storageSug} · <u>Use this</u></span>
                </button>
              )}
            </div>

            {/* 8. Disposal method */}
            <div className="field">
              <label>How is it disposed of? <span className="req">*</span></label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="">Select…</option>
                {METHOD_OPTIONS[category].map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
                <option value="Other">Other — type it in</option>
              </select>
            </div>

            {method === 'Other' && (
              <div className="field full">
                <label>Describe how it’s disposed of <span className="req">*</span></label>
                <input
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value)}
                  placeholder="e.g. Given to a scrap buyer / returned to supplier / stored then buried on-site…"
                  autoFocus
                />
                <span className="muted" style={{ fontSize: 11.5 }}>
                  Describe it in your own words — the AI will still check it and flag anything unsafe.
                </span>
              </div>
            )}

            {/* Unit */}
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

            {/* 9. Treatment + AI suggestion */}
            <div className="field full">
              <label>Treatment applied <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
              <input value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. Autoclaved 121°C 30 min / neutralized to pH 7" />
              {method && treatment.trim() !== treatmentSug && (
                <button type="button" className="ai-suggest" onClick={() => setTreatment(treatmentSug)}>
                  <Sparkles size={12} />
                  <span><b>AI suggests:</b> {treatmentSug} · <u>Use this</u></span>
                </button>
              )}
            </div>

            {/* 10. Hauler — only when relevant */}
            {haulerRelevant && (
              <div className="field full">
                <label>Collected by <span className="muted" style={{ fontWeight: 400 }}>(hauler or company name)</span></label>
                <input value={hauler} onChange={(e) => setHauler(e.target.value)} placeholder="e.g. Cleanway Environmental (DENR-accredited)" />
              </div>
            )}

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
                    ? 'Submit (flagged for correction)'
                    : 'Submit waste stream'}
              </button>
              {!requiredFilled && (
                <span className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Fill the required (*) fields to submit. Improper disposal is still recorded — and flagged for correction.
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
            {!name.trim() ? (
              <div className="muted" style={{ color: 'rgba(233,239,233,0.6)', fontSize: 13 }}>
                Start by naming the waste — the AI reads the name and activity, works out the
                hazard, then checks how you dispose of it against biosafety and chemical-safety
                standards.
              </div>
            ) : (
              <div>
                {/* AI classification (as soon as there's a name) */}
                <div className="label">AI read this waste as</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span className="chip">{hazard.hazardClass}</span>
                  <span className="chip mono">{hazard.hazardCode}</span>
                </div>
                {traits.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {traits.map((t) => (
                      <span className="chip danger" key={t}>{traitLabel(t)}</span>
                    ))}
                  </div>
                )}

                {!method || !rec ? (
                  <div className="muted" style={{ color: 'rgba(233,239,233,0.6)', fontSize: 12.5, marginTop: 8 }}>
                    {method === 'Other'
                      ? <>Type <b style={{ color: '#fff' }}>how it’s disposed of</b> to get the recommendation.</>
                      : <>Now choose <b style={{ color: '#fff' }}>how it’s disposed of</b> to get the full recommendation.</>}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center" style={{ margin: '12px 0 10px' }}>
                      <span className={`sev-tag ${rec.severity.toLowerCase()}`}>{rec.severity}</span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 12.5, fontWeight: 700,
                          color: rec.verdict === 'Properly handled' ? '#9be0b4' : rec.verdict === 'Needs improvement' ? '#f0cf8a' : '#f4b8af',
                        }}
                      >
                        {rec.verdict}
                      </span>
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
                  </>
                )}
              </div>
            )}
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
                state={name.trim() ? 'ok' : 'idle'}
                title="Waste identified"
                detail={!name.trim() ? 'Enter a name or description' : `AI classified it as ${hazard.hazardClass}`}
              />
              <CheckRow
                state={requiredFilled ? 'ok' : name.trim() ? 'warn' : 'idle'}
                title="Details complete"
                detail={requiredFilled ? 'All required fields provided' : 'Name, activity, amount, storage, method & unit'}
              />
              <CheckRow
                state={methodState}
                title="Disposal method checked"
                detail={!rec ? 'Choose how it’s disposed of' : rec.verdict === 'Properly handled' ? 'Matches recommended practice' : rec.verdict === 'Needs improvement' ? 'Acceptable with improvements' : 'Conflicts with safe practice — flagged'}
              />
              <CheckRow
                state={storage.trim() ? 'ok' : name.trim() ? 'warn' : 'idle'}
                title="Storage recorded"
                detail={storage.trim() ? 'Interim storage noted' : 'Where is it kept before disposal?'}
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
