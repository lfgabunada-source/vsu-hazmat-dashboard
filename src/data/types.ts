// ============================================================
// Typed data models — shared across all screens
// ============================================================

export type Category = 'Chemical' | 'Biological'
export type RiskLevel = 'High' | 'Medium' | 'Low'
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OK'

export type MaterialStatus =
  | 'Compliant'
  | 'Non-compliant'
  | 'Expired'
  | 'Under review'

export type GhsHazard =
  | 'flammable'
  | 'corrosive'
  | 'toxic'
  | 'health-hazard'
  | 'oxidizer'
  | 'irritant'
  | 'environment'

export type BSL = 'BSL-1' | 'BSL-2' | 'BSL-3'

// Reference knowledge-base entry (the "AI" reference brain)
export interface KnowledgeEntry {
  aliases: string[]
  canonicalName: string
  category: Category
  casOrStrain: string // CAS number (chem) or strain designation (bio)
  formula?: string // chemicals
  substanceType: string // e.g. "Ketone / solvent" or "Gram-negative bacterium"
  riskLevel: RiskLevel
  ghs?: GhsHazard[] // chemicals
  bsl?: BSL // biologicals
  storage: string
  incompatibilities: string[]
  notes?: string
}

export interface Material {
  id: string
  name: string
  category: Category
  casOrStrain: string
  riskLevel: RiskLevel
  quantity: number
  unit: string
  unitId: string // academic unit id
  location: string
  storage: string
  expiry: string | null // ISO date, null for stable biologicals
  status: MaterialStatus
  bsl?: BSL
  ghs?: GhsHazard[]
}

export type UnitStatus =
  | 'Validated'
  | 'Submitted'
  | 'In progress'
  | 'Not started'

export interface AcademicUnit {
  id: string
  name: string
  short: string
  coordinator: string
  building: string
  itemCount: number
  progress: number // 0-100
  deadline: string // ISO
  status: UnitStatus
  complianceScore: number // 0-100
  focalEmail?: string // assigned focal person's vsu.edu.ph email
}

// ---- Waste generation & disposal (the dashboard's primary focus) ----
export type WasteCategory = 'Chemical' | 'Biological'

// How well the unit's current disposal activity matches recommended practice.
export type HandlingStatus = 'Compliant' | 'Partially compliant' | 'Non-compliant'

export type DisposalMethod =
  | 'DENR-accredited hauler'
  | 'Neutralization'
  | 'On-site autoclave'
  | 'Non-burn treatment'
  | 'Charcoal filtration / destaining'
  | 'Drain disposal'
  | 'Untreated / accumulating'

export type WasteVerdict = 'Properly handled' | 'Needs improvement' | 'Improperly handled'

// AI recommendation for a waste stream, grounded in cited standards.
export interface WasteRecommendation {
  verdict: WasteVerdict
  severity: Severity
  summary: string
  actions: string[]
  standards: string[] // factual international / national standard citations
}

export interface WasteStream {
  id: string
  unitId: string
  category: WasteCategory
  name: string
  room?: string // laboratory / room where it is generated (building comes from the unit)
  sourceActivity: string // the lab activity that generates this waste
  hazardClass: string // GHS / DENR / DOH classification
  hazardCode: string
  physicalState: string
  volumePerMonth: string
  storage: string // interim storage before disposal
  disposalActivity: string // what the unit currently does to dispose of it
  method: DisposalMethod | string // a preset method, or a user-typed "Other" route
  treatment: string // neutralization / autoclave / none
  hauler: string | null
  manifest: string | null
  status: HandlingStatus
  ai: WasteRecommendation
}

export interface Finding {
  id: string
  severity: Severity
  title: string
  recommendation: string
  reference: string // standard/guideline reference
}

export interface Assessment {
  labId: string
  labName: string
  unitId: string
  score: number // 0-100
  findings: Finding[]
}

export type ActionStatus = 'Open' | 'In progress' | 'Resolved'

export interface Action {
  id: string
  title: string
  severity: Severity
  unitId: string
  owner: string
  due: string // ISO
  status: ActionStatus
  sourceFinding?: string
}

export interface AiFlag {
  id: string
  type: 'EXPIRED' | 'STORAGE' | 'DUPLICATE' | 'INCOMPLETE'
  text: string
  detail: string
  time: string
}
