import { useNavigate } from 'react-router-dom'
import {
  Recycle,
  FlaskConical,
  Dna,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { KpiCard, Pill, statusTone } from '../components/ui'
import { wasteStats, unitName, type Severity } from '../data'
import { useApp } from '../store/app'

function StatusBars() {
  const rows = [
    { label: 'Properly handled', val: wasteStats.proper, color: 'var(--low)' },
    { label: 'Needs improvement', val: wasteStats.needsImprovement, color: 'var(--med)' },
    { label: 'Improperly handled', val: wasteStats.improper, color: 'var(--high)' },
  ]
  const max = Math.max(1, ...rows.map((r) => r.val))
  return (
    <div>
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.val / max) * 100}%`, background: r.color }}>
              {r.val > 0 ? r.val : ''}
            </div>
          </div>
          <span className="bar-val">{r.val}</span>
        </div>
      ))}
    </div>
  )
}

const sevTone = (s: Severity): 'high' | 'med' | 'low' | 'info' | 'neutral' =>
  s === 'CRITICAL' || s === 'HIGH' ? 'high' : s === 'MEDIUM' ? 'med' : s === 'LOW' ? 'info' : 'low'

export default function Dashboard() {
  const navigate = useNavigate()
  const { units, session, isAdmin } = useApp()

  const chem = wasteStats.countByCategory('Chemical')
  const bio = wasteStats.countByCategory('Biological')
  const feed = wasteStats.priorityRecommendations

  // Friendly empty state before any waste has been reported.
  if (wasteStats.total === 0) {
    return (
      <div className="stack">
        <div className="card empty-hero">
          <div className="empty-hero-mark"><Recycle size={26} /></div>
          <h2>Welcome, {session?.name}</h2>
          <p>
            No waste streams have been reported yet.{' '}
            {isAdmin
              ? 'As units start reporting, this dashboard fills with live counts, per-unit handling scores, and AI recommendations.'
              : 'Report your unit’s first waste stream and the AI will check how it’s handled — right away.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/new')}>
            <Plus size={16} /> Report a waste stream
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      {/* KPIs — waste generation & disposal */}
      <div className="grid grid-4">
        <KpiCard
          icon={<Recycle size={18} />}
          value={wasteStats.total}
          label="Waste streams tracked"
          tone="info"
          trend={`${wasteStats.unitsGenerating} units generating`}
        />
        <KpiCard
          icon={<FlaskConical size={18} />}
          value={`${chem} / ${bio}`}
          label="Chemical / biological streams"
          tone="med"
          trend="by category"
        />
        <KpiCard
          icon={<AlertOctagon size={18} />}
          value={wasteStats.improper}
          label="Improperly handled"
          tone="high"
          trend="disposal non-compliant"
        />
        <KpiCard
          icon={<Sparkles size={18} />}
          value={wasteStats.openRecommendations}
          label="AI recommendations open"
          tone="low"
          trend="to review & act"
        />
      </div>

      <div className="row" style={{ alignItems: 'stretch' }}>
        {/* Disposal handling status */}
        <div className="card grow" style={{ flexBasis: '46%' }}>
          <div className="card-head">
            <h3>Waste disposal handling</h3>
            <span className="sub">against biosafety &amp; chemical-safety standards</span>
          </div>
          <div className="card-pad">
            <div className="section-title" style={{ marginBottom: 10 }}>
              Handling status of {wasteStats.total} streams
            </div>
            <StatusBars />
            <div
              className="flex items-center gap-3"
              style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
                <FlaskConical size={14} color="var(--high)" /> {chem} chemical
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
                <Dna size={14} color="var(--info)" /> {bio} biological
              </div>
            </div>
          </div>
        </div>

        {/* Waste & disposal status by unit */}
        <div className="card grow" style={{ flexBasis: '54%' }}>
          <div className="card-head">
            <h3>Waste &amp; disposal by unit</h3>
            <span className="sub">click to open the waste register</span>
          </div>
          <div style={{ padding: '6px 8px' }}>
            {units.map((u) => {
              const streams = wasteStats.streamsByUnit(u.id)
              const score = wasteStats.unitScore(u.id)
              const worst = wasteStats.unitWorstSeverity(u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => navigate('/waste')}
                  className="lab-pick"
                  style={{ marginBottom: 6 }}
                >
                  <div>
                    <div className="lp-name">{u.short}</div>
                    <div className="lp-unit">
                      {streams.length === 0
                        ? 'no waste streams reported'
                        : `${streams.length} waste stream${streams.length > 1 ? 's' : ''} · ${
                            wasteStats.streamsByUnit(u.id).filter((w) => w.category === 'Chemical').length
                          } chem / ${streams.filter((w) => w.category === 'Biological').length} bio`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {score !== null ? (
                      <>
                        <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>
                          {score}
                        </span>
                        <Pill tone={sevTone(worst)}>
                          {worst === 'OK' ? 'On track' : `${worst} priority`}
                        </Pill>
                      </>
                    ) : (
                      <Pill tone="neutral">No data</Pill>
                    )}
                    <ChevronRight size={16} color="var(--muted)" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI waste-handling recommendations feed */}
      <div className="card">
        <div className="card-head">
          <h3>
            <Sparkles size={15} style={{ color: 'var(--gold)', verticalAlign: '-2px', marginRight: 6 }} />
            AI waste-handling recommendations
          </h3>
          <span className="sub">
            {feed.length} streams need action · grounded in WHO, CDC/NIH, OSHA, DENR &amp; RA standards
          </span>
        </div>
        <div className="card-pad">
          {feed.length === 0 && (
            <div className="flex items-center gap-2 muted" style={{ padding: 8 }}>
              <CheckCircle2 size={16} color="var(--low)" /> All tracked waste streams are being handled properly.
            </div>
          )}
          {feed.map((w) => (
            <div className="feed-item" key={w.id}>
              <span className={`sev-tag ${w.ai.severity.toLowerCase()}`}>{w.ai.severity}</span>
              <div className="grow">
                <div className="f-text">
                  <b>{w.name}</b> · {unitName(w.unitId)}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {w.ai.summary}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {w.ai.standards.slice(0, 3).map((s) => (
                    <span className="tag" key={s} style={{ fontSize: 10.5, borderColor: 'rgba(42,111,219,0.25)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-ghost no-print"
                style={{ height: 32, alignSelf: 'center' }}
                onClick={() => navigate('/assessment')}
              >
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
