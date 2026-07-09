import {
  FlaskConical,
  Dna,
  Trash2,
  CalendarX2,
  Database,
  type LucideIcon,
} from 'lucide-react'

interface Guide {
  icon: LucideIcon
  tone: string
  title: string
  points: string[]
}

const GUIDES: Guide[] = [
  {
    icon: FlaskConical,
    tone: 'var(--high)',
    title: 'GHS chemical segregation',
    points: [
      'Store acids and bases in separate secondary containment.',
      'Keep flammables in dedicated cabinets, away from oxidizers (min. 3 m or barrier).',
      'Isolate oxidizers from organics, solvents, and reducers.',
      'Apply the GHS pictogram segregation matrix to every storage area.',
      'Never store corrosives above eye level.',
    ],
  },
  {
    icon: Dna,
    tone: 'var(--info)',
    title: 'Biosafety practice (BSL-1 → BSL-3)',
    points: [
      'BSL-1: standard microbiological practices, open-bench for non-pathogens.',
      'BSL-2: biosafety cabinet (Class II) for aerosols; restricted access; PPE.',
      'BSL-3: containment lab, HEPA exhaust, respiratory protection, controlled entry.',
      'Autoclave all infectious waste; validate monthly with spore tests.',
      'Vaccinate personnel handling bloodborne pathogens (e.g. HBV).',
    ],
  },
  {
    icon: Trash2,
    tone: 'var(--accent)',
    title: 'Chemical waste disposal',
    points: [
      'Use only DENR-accredited haulers; retain manifest for every pickup.',
      'Neutralize acids/bases where protocol permits before disposal.',
      'Segregate waste by class (flammable, corrosive, toxic, reactive).',
      'Never pour hazardous waste down drains.',
      'Profile each stream against DENR DAO 2013-22 and RA 6969.',
    ],
  },
  {
    icon: CalendarX2,
    tone: 'var(--med)',
    title: 'Expiry & disposal',
    points: [
      'Review chemical expiry dates quarterly.',
      'Flag items within 60 days of expiry for planned disposal.',
      'Remove expired stock from active storage immediately.',
      'Log all disposals in the Waste Register with manifest reference.',
      'Peroxide-forming chemicals: test and date on opening.',
    ],
  },
  {
    icon: Database,
    tone: 'var(--gold)',
    title: 'Data entry standards',
    points: [
      'Use canonical substance names; let AI autocomplete fill CAS/strain.',
      'Record quantity with explicit units and precise storage location.',
      'Verify GHS pictograms / Biosafety level against the reference base.',
      'Resolve AI verification flags before validating a submission.',
      'One record per material per location — avoid duplicates.',
    ],
  },
]

export default function Guidelines() {
  return (
    <div className="stack">
      <div className="page-intro">
        <p>
          Management and handling reference for the TWG and unit coordinators, aligned to
          international and Philippine regulatory standards.
        </p>
      </div>
      <div className="grid grid-3">
        {GUIDES.map((g) => {
          const Icon = g.icon
          return (
            <div className="card guide-card" key={g.title}>
              <div
                className="g-icon"
                style={{ background: 'var(--card-2)', color: g.tone, border: '1px solid var(--border)' }}
              >
                <Icon size={20} />
              </div>
              <h3>{g.title}</h3>
              <ul>
                {g.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
