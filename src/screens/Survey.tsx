import { useState } from 'react'
import { Copy, Check, Link2, ClipboardList } from 'lucide-react'
import { useToast } from '../components/Toast'

interface SurveyField {
  q: string
  type: string
}
const SECTIONS: { num: number; title: string; fields: SurveyField[] }[] = [
  {
    num: 1,
    title: 'Unit & respondent',
    fields: [
      { q: 'Academic unit / department', type: 'Dropdown · required' },
      { q: 'Laboratory / room location', type: 'Short text · required' },
      { q: 'Focal person name & designation', type: 'Short text · required' },
      { q: 'Contact email', type: 'Email (@vsu.edu.ph) · required' },
      { q: 'Reporting period', type: 'Month/Year · required' },
    ],
  },
  {
    num: 2,
    title: 'Waste identification & generating activity',
    fields: [
      { q: 'Waste category', type: 'Toggle · Chemical / Biological' },
      { q: 'Waste name / description', type: 'Short text · required' },
      { q: 'Generating activity (what produces it)', type: 'Short text · required' },
      { q: 'Hazard characteristics', type: 'Multi-select · e.g. carcinogen, heavy metals, infectious, sharps, BSL-3' },
      { q: 'Hazard classification (DENR / DOH / RCRA)', type: 'AI-suggested from characteristics' },
    ],
  },
  {
    num: 3,
    title: 'Volume & interim storage',
    fields: [
      { q: 'Physical state', type: 'Select · liquid / solid / sludge / sharps / tissue' },
      { q: 'Volume generated per month', type: 'Number + unit · required' },
      { q: 'Interim storage before disposal', type: 'Short text · required' },
    ],
  },
  {
    num: 4,
    title: 'Disposal activity & treatment',
    fields: [
      { q: 'Disposal method', type: 'Select · Hauler / Neutralization / Autoclave / Non-burn / Drain / Untreated · required' },
      { q: 'Describe current disposal activity', type: 'Long text · required' },
      { q: 'Treatment applied', type: 'Short text · e.g. autoclave 121°C, pH neutralization' },
      { q: 'Accredited hauler', type: 'Short text · required for hauler consignment' },
      { q: 'Manifest / reference & date', type: 'Short text · required for hauler consignment' },
    ],
  },
]

const COVERAGE = [
  'Each waste stream feeds the consolidated Waste Register',
  'AI evaluates the disposal method against biosafety & chemical-safety standards',
  'Generates per-unit waste-handling scores in the AI Waste Assessment',
  'Improperly handled streams surface on the dashboard for corrective action',
  'Rolls up into the Consolidated Report to the Office of the President',
]

const LINK = 'vsu.edu.ph/twg/hazmat-survey'

export default function Survey() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('https://' + LINK)
    } catch {
      /* clipboard may be blocked; still confirm */
    }
    setCopied(true)
    toast('Distribution link copied to clipboard.', 'info')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      {/* Questionnaire preview */}
      <div className="card grow" style={{ flexBasis: '64%' }}>
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} color="var(--vsu-green)" />
            Standardized Hazardous Waste Survey
          </h3>
          <span className="sub">read-only preview</span>
        </div>
        <div className="card-pad">
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>
            Each unit's focal person completes this instrument for every chemical and
            biological waste stream they generate — the activity that produces it and how
            they dispose of it. Structured fields feed the AI disposal recommendations.
          </p>
          {SECTIONS.map((s) => (
            <div className="survey-section" key={s.num}>
              <div className="ss-head">
                <span className="ss-num">{s.num}</span>
                <h3 style={{ fontSize: 14 }}>{s.title}</h3>
              </div>
              {s.fields.map((f) => (
                <div className="survey-field" key={f.q}>
                  <div className="sf-q">{f.q}</div>
                  <div className="sf-type">{f.type}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="stack" style={{ flexBasis: '36%', flexShrink: 0, minWidth: 280 }}>
        <div className="card">
          <div className="card-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Link2 size={15} color="var(--info)" /> Distribution link
            </h3>
          </div>
          <div className="card-pad">
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              Share this link with unit coordinators to collect submissions.
            </p>
            <div className="copy-link">
              <div className="link-box">{LINK}</div>
              <button className="btn btn-dark" onClick={copy} style={{ flexShrink: 0 }}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Instrument coverage</h3>
          </div>
          <div className="card-pad">
            <div className="check-list">
              {COVERAGE.map((c) => (
                <div className="check-item" key={c} style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="check-icon ok">
                    <Check size={13} />
                  </span>
                  <div className="check-body">
                    <div className="ct" style={{ fontWeight: 500, fontSize: 12.5 }}>
                      {c}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
