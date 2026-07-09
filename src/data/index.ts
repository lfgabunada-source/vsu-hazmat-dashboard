import type {
  AcademicUnit,
  Action,
  AiFlag,
  Assessment,
  HandlingStatus,
  Material,
  Severity,
  WasteStream,
} from './types'

export * from './types'
export * from './knowledge'

// "Today" anchor for the demo — keeps expiry semantics consistent.
export const TODAY = new Date('2026-07-08')

// ============================================================
// Academic units (Mandate 2 — Unit Coordination)
// ============================================================
export const UNITS: AcademicUnit[] = [
  {
    id: 'chem',
    name: 'Department of Chemistry',
    short: 'Chemistry',
    coordinator: 'Prof. M. Delgado',
    focalEmail: 'm.delgado@vsu.edu.ph',
    building: 'Chemistry Complex',
    itemCount: 5,
    progress: 100,
    deadline: '2026-06-20',
    status: 'Validated',
    complianceScore: 78,
  },
  {
    id: 'biosci',
    name: 'Department of Biological Sciences',
    short: 'Biological Sciences',
    coordinator: 'Dr. J. Ferrer',
    focalEmail: 'j.ferrer@vsu.edu.ph',
    building: 'Biological Sciences',
    itemCount: 3,
    progress: 100,
    deadline: '2026-06-20',
    status: 'Submitted',
    complianceScore: 84,
  },
  {
    id: 'agchem',
    name: 'Agri-Chemical Research Center',
    short: 'Agri-Chem Research',
    coordinator: 'Dr. A. Bonifacio',
    focalEmail: 'a.bonifacio@vsu.edu.ph',
    building: 'Agri-Chem Research Center',
    itemCount: 3,
    progress: 65,
    deadline: '2026-07-15',
    status: 'In progress',
    complianceScore: 61,
  },
  {
    id: 'vetmed',
    name: 'College of Veterinary Medicine',
    short: 'Vet Medicine',
    coordinator: 'Dr. L. Ocampo',
    focalEmail: 'l.ocampo@vsu.edu.ph',
    building: 'Vet Medicine',
    itemCount: 2,
    progress: 40,
    deadline: '2026-07-15',
    status: 'In progress',
    complianceScore: 52,
  },
  {
    id: 'foodsci',
    name: 'Department of Food Science & Technology',
    short: 'Food Science',
    coordinator: 'Prof. R. Villamor',
    focalEmail: 'r.villamor@vsu.edu.ph',
    building: 'Food Science',
    itemCount: 1,
    progress: 100,
    deadline: '2026-06-20',
    status: 'Validated',
    complianceScore: 88,
  },
  {
    id: 'ecoinst',
    name: 'Tropical Ecology Institute',
    short: 'Tropical Ecology',
    coordinator: 'Dr. S. Mendez',
    focalEmail: 's.mendez@vsu.edu.ph',
    building: 'Tropical Ecology Institute',
    itemCount: 0,
    progress: 0,
    deadline: '2026-07-02',
    status: 'Not started',
    complianceScore: 0,
  },
  {
    id: 'agron',
    name: 'Department of Agronomy',
    short: 'Agronomy',
    coordinator: 'Prof. E. Castañeda',
    focalEmail: 'e.castaneda@vsu.edu.ph',
    building: 'Agri-Chem Research Center',
    itemCount: 0,
    progress: 0,
    deadline: '2026-07-02',
    status: 'Not started',
    complianceScore: 0,
  },
  {
    id: 'pharma',
    name: 'Pharmacology Laboratory',
    short: 'Pharmacology',
    coordinator: 'Dr. C. Rosales',
    focalEmail: 'c.rosales@vsu.edu.ph',
    building: 'Vet Medicine',
    itemCount: 0,
    progress: 20,
    deadline: '2026-07-15',
    status: 'In progress',
    complianceScore: 0,
  },
]

// Mutable registry — the admin-managed unit roster overrides the seed at runtime.
// Kept as module state so non-hook resolvers (unitName/unitById/stats) stay in sync
// with edits made in the Units admin screen.
let unitsRegistry: AcademicUnit[] = UNITS.map((u) => ({ ...u }))
export const setUnits = (list: AcademicUnit[]) => {
  unitsRegistry = list
}
export const getUnits = (): AcademicUnit[] => unitsRegistry

export const unitById = (id: string) => unitsRegistry.find((u) => u.id === id)
export const unitName = (id: string) => unitById(id)?.short ?? id

// ============================================================
// Material database (Inventory) — 14 rows across both categories
// ============================================================
export const MATERIALS: Material[] = [
  {
    id: 'M-001',
    name: 'Acetone',
    category: 'Chemical',
    casOrStrain: '67-64-1',
    riskLevel: 'High',
    quantity: 4,
    unit: 'L',
    unitId: 'chem',
    location: 'Chemistry Complex · Rm 204 Organic Lab',
    storage: 'Flammables cabinet',
    expiry: '2026-03-12',
    status: 'Expired',
    ghs: ['flammable', 'irritant'],
  },
  {
    id: 'M-002',
    name: 'Sulfuric Acid',
    category: 'Chemical',
    casOrStrain: '7664-93-9',
    riskLevel: 'High',
    quantity: 2.5,
    unit: 'L',
    unitId: 'chem',
    location: 'Chemistry Complex · Rm 204 Organic Lab',
    storage: 'Acid cabinet (no containment tray)',
    expiry: '2027-09-01',
    status: 'Non-compliant',
    ghs: ['corrosive', 'toxic'],
  },
  {
    id: 'M-003',
    name: 'Sodium Hydroxide',
    category: 'Chemical',
    casOrStrain: '1310-73-2',
    riskLevel: 'High',
    quantity: 1.2,
    unit: 'kg',
    unitId: 'chem',
    location: 'Chemistry Complex · Rm 210 Analytical Lab',
    storage: 'Corrosives cabinet',
    expiry: '2028-01-01',
    status: 'Compliant',
    ghs: ['corrosive'],
  },
  {
    id: 'M-004',
    name: 'Methanol',
    category: 'Chemical',
    casOrStrain: '67-56-1',
    riskLevel: 'High',
    quantity: 6,
    unit: 'L',
    unitId: 'chem',
    location: 'Chemistry Complex · Rm 204 Organic Lab',
    storage: 'Flammables cabinet',
    expiry: '2026-08-20',
    status: 'Compliant',
    ghs: ['flammable', 'toxic', 'health-hazard'],
  },
  {
    id: 'M-005',
    name: 'Ethanol',
    category: 'Chemical',
    casOrStrain: '64-17-5',
    riskLevel: 'Medium',
    quantity: 10,
    unit: 'L',
    unitId: 'foodsci',
    location: 'Food Science · Rm 105 Micro Lab',
    storage: 'Flammables cabinet',
    expiry: '2027-02-14',
    status: 'Compliant',
    ghs: ['flammable', 'irritant'],
  },
  {
    id: 'M-006',
    name: 'Formaldehyde',
    category: 'Chemical',
    casOrStrain: '50-00-0',
    riskLevel: 'High',
    quantity: 3,
    unit: 'L',
    unitId: 'vetmed',
    location: 'Vet Medicine · Rm 118 Anatomy Lab',
    storage: 'Open shelf (non-compliant)',
    expiry: '2026-11-30',
    status: 'Non-compliant',
    ghs: ['toxic', 'health-hazard', 'corrosive'],
  },
  {
    id: 'M-007',
    name: 'Hydrochloric Acid',
    category: 'Chemical',
    casOrStrain: '7647-01-0',
    riskLevel: 'High',
    quantity: 2,
    unit: 'L',
    unitId: 'agchem',
    location: 'Agri-Chem Research Center · Soil Lab',
    storage: 'Acid cabinet',
    expiry: '2026-07-30',
    status: 'Under review',
    ghs: ['corrosive', 'irritant'],
  },
  {
    id: 'M-008',
    name: 'Hydrogen Peroxide',
    category: 'Chemical',
    casOrStrain: '7722-84-1',
    riskLevel: 'Medium',
    quantity: 1.5,
    unit: 'L',
    unitId: 'agchem',
    location: 'Agri-Chem Research Center · Soil Lab',
    storage: 'General shelf near solvents (non-compliant)',
    expiry: '2026-05-01',
    status: 'Expired',
    ghs: ['oxidizer', 'corrosive', 'irritant'],
  },
  {
    id: 'M-009',
    name: 'Chloroform',
    category: 'Chemical',
    casOrStrain: '67-66-3',
    riskLevel: 'High',
    quantity: 0.5,
    unit: 'L',
    unitId: 'chem',
    location: 'Chemistry Complex · Rm 210 Analytical Lab',
    storage: 'Amber bottle, vented cabinet',
    expiry: '2026-09-05',
    status: 'Compliant',
    ghs: ['toxic', 'health-hazard', 'irritant'],
  },
  {
    id: 'M-010',
    name: 'Escherichia coli K-12',
    category: 'Biological',
    casOrStrain: 'K-12',
    riskLevel: 'Low',
    quantity: 12,
    unit: 'cryovials',
    unitId: 'biosci',
    location: 'Biological Sciences · Rm 302 Micro Lab',
    storage: '−80 °C freezer',
    expiry: null,
    status: 'Compliant',
    bsl: 'BSL-1',
  },
  {
    id: 'M-011',
    name: 'Staphylococcus aureus',
    category: 'Biological',
    casOrStrain: 'ATCC 25923',
    riskLevel: 'Medium',
    quantity: 6,
    unit: 'cryovials',
    unitId: 'biosci',
    location: 'Biological Sciences · Rm 305 BSL-2 Lab',
    storage: '−80 °C, BSC Class II',
    expiry: null,
    status: 'Compliant',
    bsl: 'BSL-2',
  },
  {
    id: 'M-012',
    name: 'Salmonella enterica',
    category: 'Biological',
    casOrStrain: 'ser. Typhimurium',
    riskLevel: 'Medium',
    quantity: 4,
    unit: 'cryovials',
    unitId: 'foodsci',
    location: 'Food Science · Rm 105 Micro Lab',
    storage: '−80 °C, BSC Class II',
    expiry: null,
    status: 'Under review',
    bsl: 'BSL-2',
  },
  {
    id: 'M-013',
    name: 'Mycobacterium tuberculosis',
    category: 'Biological',
    casOrStrain: 'H37Rv',
    riskLevel: 'High',
    quantity: 2,
    unit: 'cryovials',
    unitId: 'vetmed',
    location: 'Vet Medicine · Rm 130 Containment',
    storage: 'BSL-3 containment freezer',
    expiry: null,
    status: 'Non-compliant',
    bsl: 'BSL-3',
  },
  {
    id: 'M-014',
    name: 'Hepatitis B virus samples',
    category: 'Biological',
    casOrStrain: 'HBV serum',
    riskLevel: 'High',
    quantity: 18,
    unit: 'vials',
    unitId: 'biosci',
    location: 'Biological Sciences · Rm 305 BSL-2 Lab',
    storage: 'Locked −20 °C',
    expiry: null,
    status: 'Non-compliant',
    bsl: 'BSL-2',
  },
]

// ---- expiry helpers ----
export type ExpiryState = 'expired' | 'soon' | 'valid' | 'stable'
export function expiryState(iso: string | null): ExpiryState {
  if (!iso) return 'stable'
  const d = new Date(iso)
  const days = Math.round((d.getTime() - TODAY.getTime()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 60) return 'soon'
  return 'valid'
}
export function daysUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - TODAY.getTime()) / 86400000)
}

// ============================================================
// Waste generation & disposal (Mandate 5) — the dashboard focus.
// Each stream: what the unit produces, the activity that generates it,
// what they currently DO to dispose of it, and an AI recommendation
// grounded in factual international / national standards.
// ============================================================
export const WASTE_STREAMS: WasteStream[] = [
  // ---------------- Chemistry ----------------
  {
    id: 'W-01',
    unitId: 'chem',
    category: 'Chemical',
    name: 'Spent halogenated solvents (chloroform)',
    sourceActivity: 'Extraction, TLC and NMR sample preparation',
    hazardClass: 'DENR Class C — toxic organic',
    hazardCode: 'RCRA D022 / U044',
    physicalState: 'Liquid',
    volumePerMonth: '≈18 L / month',
    storage: 'Amber Winchester bottles, vented cabinet, secondary containment',
    disposalActivity:
      'Segregated from non-halogenated solvents and turned over to a DENR-registered TSD hauler with manifest.',
    method: 'DENR-accredited hauler',
    treatment: 'Off-site high-temperature treatment by TSD facility',
    hauler: 'Cleanway Env. Mgmt (DENR-accredited TSD)',
    manifest: 'MNF-2026-0142',
    status: 'Compliant',
    ai: {
      verdict: 'Properly handled',
      severity: 'OK',
      summary:
        'Halogenated solvent waste is correctly kept separate from non-halogenated streams and consigned to a DENR-registered TSD facility with manifest tracking — the recommended route for chlorinated organics.',
      actions: [
        'Keep halogenated and non-halogenated solvents in separate labelled containers (mixing raises treatment cost and reaction risk).',
        'Retain manifests for at least 5 years per DAO 2013-22.',
      ],
      standards: [
        'RA 6969',
        'DENR DAO 2013-22',
        'US EPA RCRA 40 CFR 261',
        'NRC Prudent Practices in the Laboratory',
      ],
    },
  },
  {
    id: 'W-02',
    unitId: 'chem',
    category: 'Chemical',
    name: 'Neutralized acid–base titration waste',
    sourceActivity: 'Volumetric titration and pH standardization',
    hazardClass: 'DENR Class B — corrosive (treated)',
    hazardCode: 'RCRA D002',
    physicalState: 'Aqueous liquid',
    volumePerMonth: '≈10 L / month',
    storage: 'Collection carboy at the sink station',
    disposalActivity:
      'Neutralized to pH 6–9 and flushed to the laboratory drain with excess water.',
    method: 'Neutralization',
    treatment: 'Acid–base neutralization to pH 6–9',
    hauler: null,
    manifest: null,
    status: 'Partially compliant',
    ai: {
      verdict: 'Needs improvement',
      severity: 'MEDIUM',
      summary:
        'Neutralizing simple mineral acid/base waste to pH 6–9 before sink disposal is acceptable, but only if the effluent is free of heavy metals or toxic anions — RA 9275 prohibits discharging hazardous substances to water.',
      actions: [
        'Confirm titration waste contains no heavy metals or toxic salts before drain disposal.',
        'Record pH and volume for each disposal in a neutralization log.',
        'Divert any metal-bearing or organic titrations to the hazardous-waste stream.',
      ],
      standards: [
        'RA 9275 (Philippine Clean Water Act)',
        'DENR DAO 2013-22',
        'OSHA 29 CFR 1910.1450',
      ],
    },
  },
  {
    id: 'W-03',
    unitId: 'agchem',
    category: 'Chemical',
    name: 'Heavy-metal digestates (Kjeldahl / AAS)',
    sourceActivity: 'Soil and plant nutrient analysis, metals by AAS',
    hazardClass: 'DENR Class D — toxic heavy metals',
    hazardCode: 'RCRA D004–D011',
    physicalState: 'Acidic liquid',
    volumePerMonth: '≈6 L / month',
    storage: 'Combined into the general acid waste jug (uncontained)',
    disposalActivity:
      'Poured into the general acid waste container; no separate collection or hauler scheduled.',
    method: 'Untreated / accumulating',
    treatment: 'None',
    hauler: null,
    manifest: null,
    status: 'Non-compliant',
    ai: {
      verdict: 'Improperly handled',
      severity: 'HIGH',
      summary:
        'Heavy-metal-bearing digestates must not be mixed with general acid waste or drained. They are toxicity-characteristic hazardous waste and require separate collection and licensed disposal.',
      actions: [
        'Collect metal digestates as a distinct stream — do not combine with other acids.',
        'Consign to a DENR-accredited TSD hauler with manifest; never discharge to the sewer (RA 9275).',
        'Label containers with the metals present for correct TSD treatment.',
      ],
      standards: [
        'RA 6969',
        'DENR DAO 2013-22',
        'US EPA RCRA 40 CFR 261 (D004–D011)',
        'RA 9275',
      ],
    },
  },
  {
    id: 'W-04',
    unitId: 'agchem',
    category: 'Chemical',
    name: 'Oxidizer residues (hydrogen peroxide)',
    sourceActivity: 'Sample digestion and glassware cleaning',
    hazardClass: 'DENR Class D — reactive oxidizer',
    hazardCode: 'RCRA D001 (oxidizer)',
    physicalState: 'Liquid',
    volumePerMonth: '≈3 L / month',
    storage: 'General shelf beside flammable solvents (non-compliant)',
    disposalActivity:
      'Diluted and drained; interim containers stored next to solvents before disposal.',
    method: 'Drain disposal',
    treatment: 'Dilution only',
    hauler: null,
    manifest: null,
    status: 'Non-compliant',
    ai: {
      verdict: 'Improperly handled',
      severity: 'HIGH',
      summary:
        'Oxidizer waste stored beside flammable solvents is a fire/reaction hazard, and routine drain disposal is not appropriate for concentrated peroxides. Segregate and treat or haul.',
      actions: [
        'Physically separate oxidizer waste from flammables and organics during storage.',
        'Only very dilute, small-volume peroxide may be drained where locally permitted — document it; otherwise consign to a hauler.',
        'Vent peroxide containers and keep away from heat/light.',
      ],
      standards: [
        'UN GHS Rev.10',
        'NFPA 430 (Storage of Liquid & Solid Oxidizers)',
        'DENR DAO 2013-22',
      ],
    },
  },
  {
    id: 'W-05',
    unitId: 'foodsci',
    category: 'Chemical',
    name: 'Spent alcohols (ethanol / methanol)',
    sourceActivity: 'Proximate analysis, extraction and disinfection',
    hazardClass: 'DENR Class A — flammable',
    hazardCode: 'RCRA D001',
    physicalState: 'Liquid',
    volumePerMonth: '≈12 L / month',
    storage: 'Flammable-waste drum in ventilated store, grounded',
    disposalActivity:
      'Accumulated in a labelled flammable-waste drum and collected by a DENR-accredited hauler with manifest.',
    method: 'DENR-accredited hauler',
    treatment: 'Off-site fuel-blending / treatment by TSD',
    hauler: 'Cleanway Env. Mgmt (DENR-accredited TSD)',
    manifest: 'MNF-2026-0149',
    status: 'Compliant',
    ai: {
      verdict: 'Properly handled',
      severity: 'OK',
      summary:
        'Flammable solvent waste is accumulated in a grounded, ventilated flammable-waste drum and consigned to a licensed hauler — consistent with NFPA 30 storage and DAO 2013-22 disposal.',
      actions: [
        'Keep the drum grounded/bonded and below the NFPA 30 container-volume limits.',
        'Do not co-mingle with halogenated solvents.',
      ],
      standards: [
        'NFPA 30 (Flammable & Combustible Liquids)',
        'RA 6969',
        'DENR DAO 2013-22',
      ],
    },
  },
  {
    id: 'W-06',
    unitId: 'vetmed',
    category: 'Chemical',
    name: 'Spent formalin / formaldehyde fixative',
    sourceActivity: 'Histology and gross-anatomy tissue fixation',
    hazardClass: 'DENR Class C — toxic carcinogen',
    hazardCode: 'RCRA U122',
    physicalState: 'Aqueous liquid',
    volumePerMonth: '≈6 L / month',
    storage: 'Open container near the dissection bench (uncontrolled vapor)',
    disposalActivity:
      'Spent formalin poured directly into the drain after tissue processing.',
    method: 'Drain disposal',
    treatment: 'None',
    hauler: null,
    manifest: null,
    status: 'Non-compliant',
    ai: {
      verdict: 'Improperly handled',
      severity: 'CRITICAL',
      summary:
        'Formaldehyde is a Group-1 human carcinogen and must never be poured down the drain. Spent formalin has to be collected, neutralized/recovered or hauled, with vapor controls at the point of use.',
      actions: [
        'Stop drain disposal immediately; collect spent formalin in sealed, labelled containers.',
        'Neutralize with a commercial formalin-neutralizer or distil/recover, or consign to a DENR-accredited hauler.',
        'Provide local exhaust / fume control and an exposure-control plan.',
      ],
      standards: [
        'OSHA 29 CFR 1910.1048 (Formaldehyde)',
        'RA 6969',
        'DENR DAO 2013-22',
        'RA 9275 (Clean Water Act)',
      ],
    },
  },
  // ---------------- Biological ----------------
  {
    id: 'W-07',
    unitId: 'biosci',
    category: 'Biological',
    name: 'BSL-2 cultured microbial waste (agar plates, broth)',
    sourceActivity: 'Microbiology culturing of S. aureus / Salmonella',
    hazardClass: 'DOH infectious (yellow)',
    hazardCode: 'Basel Y1 / DOH infectious',
    physicalState: 'Solid + liquid cultures',
    volumePerMonth: '≈24 kg / month',
    storage: 'Autoclave-holding area, leak-proof yellow bags in bins',
    disposalActivity:
      'Autoclaved on-site (121 °C, 30 min) then handed to a DOH-licensed health-care-waste hauler in yellow bags.',
    method: 'On-site autoclave',
    treatment: 'Steam sterilization then licensed HCW hauler',
    hauler: 'MetroClark Health Waste (DOH-licensed)',
    manifest: 'MNF-2026-0161',
    status: 'Compliant',
    ai: {
      verdict: 'Properly handled',
      severity: 'OK',
      summary:
        'Infectious culture waste is decontaminated by validated autoclaving and segregated into the DOH yellow-bag infectious stream — the recommended non-burn route under WHO/DOH guidance.',
      actions: [
        'Continue validated autoclave cycles; do not compact untreated cultures.',
        'Verify each cycle with chemical indicators and monthly biological indicators.',
      ],
      standards: [
        'WHO Laboratory Biosafety Manual, 4th ed. (2020)',
        'CDC/NIH BMBL, 6th ed.',
        'WHO Safe Management of Wastes from Health-Care Activities (2014)',
        'DOH Health-Care Waste Management Manual',
      ],
    },
  },
  {
    id: 'W-08',
    unitId: 'biosci',
    category: 'Biological',
    name: 'HBV serum & sharps waste',
    sourceActivity: 'Serological testing of Hepatitis B samples',
    hazardClass: 'DOH infectious / sharps (bloodborne)',
    hazardCode: 'Basel Y1 / DOH sharps',
    physicalState: 'Sharps + serum vials',
    volumePerMonth: '≈8 kg / month',
    storage: 'Rigid sharps containers — some overfilled; access not restricted',
    disposalActivity:
      'Sharps placed in puncture-proof containers but occasionally overfilled; handled by staff who are not all HBV-vaccinated.',
    method: 'Non-burn treatment',
    treatment: 'Autoclave / approved treatment before HCW hauler',
    hauler: 'MetroClark Health Waste (DOH-licensed)',
    manifest: 'MNF-2026-0164',
    status: 'Non-compliant',
    ai: {
      verdict: 'Improperly handled',
      severity: 'HIGH',
      summary:
        'Bloodborne-pathogen sharps must go in rigid, puncture-resistant containers filled to no more than three-quarters and be handled only by HBV-vaccinated personnel with an exposure-control plan.',
      actions: [
        'Replace overfilled containers; seal sharps bins at ≤ ¾ full.',
        'Restrict handling to HBV-vaccinated staff; verify titres and maintain the exposure-control plan.',
        'Autoclave or apply approved treatment before consignment to the HCW hauler.',
      ],
      standards: [
        'OSHA 29 CFR 1910.1030 (Bloodborne Pathogens)',
        'WHO Safe Management of Wastes from Health-Care Activities (2014)',
        'DOH Health-Care Waste Management Manual',
      ],
    },
  },
  {
    id: 'W-09',
    unitId: 'biosci',
    category: 'Biological',
    name: 'Ethidium bromide gel & stain waste',
    sourceActivity: 'Agarose gel electrophoresis of nucleic acids',
    hazardClass: 'Chemical mutagen (special handling)',
    hazardCode: 'RCRA — mutagenic',
    physicalState: 'Gels + aqueous stain',
    volumePerMonth: '≈2 L / month',
    storage: 'Segregated EtBr waste bottle and gel bin',
    disposalActivity:
      'EtBr solutions passed through activated-charcoal destaining bags; gels collected separately before disposal.',
    method: 'Charcoal filtration / destaining',
    treatment: 'Activated-carbon adsorption',
    hauler: 'Pending hazardous-waste consignment',
    manifest: null,
    status: 'Partially compliant',
    ai: {
      verdict: 'Needs improvement',
      severity: 'MEDIUM',
      summary:
        'Ethidium bromide is a mutagen and must not be drained. Charcoal destaining is good practice, but spent charcoal and concentrated EtBr are hazardous waste and must be tracked to a licensed hauler.',
      actions: [
        'Consign spent charcoal filters and concentrated EtBr to a DENR-accredited hauler with manifest.',
        'Monitor charcoal breakthrough / capacity and log replacements.',
        'Consider switching to safer DNA stains (e.g. SYBR-type) to eliminate the stream.',
      ],
      standards: [
        'NRC Prudent Practices in the Laboratory',
        'RA 6969',
        'DENR DAO 2013-22',
      ],
    },
  },
  {
    id: 'W-10',
    unitId: 'vetmed',
    category: 'Biological',
    name: 'Anatomical / animal tissue waste',
    sourceActivity: 'Necropsy and anatomy dissections',
    hazardClass: 'DOH pathological (yellow)',
    hazardCode: 'Basel Y1 / DOH anatomical',
    physicalState: 'Tissue / carcass',
    volumePerMonth: '≈30 kg / month',
    storage: 'Double-bagged, refrigerated holding freezer',
    disposalActivity:
      'Double-bagged, cold-stored and collected by a health-care-waste hauler for authorized non-burn treatment.',
    method: 'Non-burn treatment',
    treatment: 'Authorized treatment via licensed hauler',
    hauler: 'MetroClark Health Waste (DOH-licensed)',
    manifest: 'MNF-2026-0170',
    status: 'Compliant',
    ai: {
      verdict: 'Properly handled',
      severity: 'OK',
      summary:
        'Pathological waste is segregated, cold-stored and consigned for authorized treatment. Note that RA 8749 restricts open incineration in the Philippines — confirm the hauler uses an approved non-burn or authorized process.',
      actions: [
        'Confirm the hauler’s treatment is DENR/DOH-authorized (RA 8749 restricts incineration).',
        'Maintain cold storage to limit odor and pathogen growth before pickup.',
      ],
      standards: [
        'WHO Safe Management of Wastes from Health-Care Activities (2014)',
        'DOH Health-Care Waste Management Manual',
        'RA 8749 (Philippine Clean Air Act)',
        'Basel Convention (Y1 clinical wastes)',
      ],
    },
  },
  {
    id: 'W-11',
    unitId: 'vetmed',
    category: 'Biological',
    name: 'M. tuberculosis culture waste (BSL-3)',
    sourceActivity: 'Mycobacteriology diagnostic culturing',
    hazardClass: 'DOH highly infectious (BSL-3)',
    hazardCode: 'Basel Y1 / BSL-3',
    physicalState: 'Cultures',
    volumePerMonth: '≈4 kg / month',
    storage: 'Sealed within BSL-3 containment before treatment',
    disposalActivity:
      'Autoclaved inside containment before removal, but biological-indicator (spore-test) validation has lapsed ~3 months.',
    method: 'On-site autoclave',
    treatment: 'In-containment autoclave (validation lapsed)',
    hauler: 'MetroClark Health Waste (after decontamination)',
    manifest: null,
    status: 'Partially compliant',
    ai: {
      verdict: 'Needs improvement',
      severity: 'HIGH',
      summary:
        'BSL-3 waste must be decontaminated by a validated autoclave within containment before any removal. The correct workflow is in place, but lapsed spore-test validation means sterilization is unverified.',
      actions: [
        'Resume monthly Geobacillus stearothermophilus biological-indicator validation of the autoclave.',
        'Quarantine treated BSL-3 waste until a passing indicator cycle is documented.',
        'Never remove untreated M. tuberculosis waste from containment.',
      ],
      standards: [
        'WHO Laboratory Biosafety Manual, 4th ed. (2020)',
        'CDC/NIH BMBL, 6th ed.',
        'ISO 11138 (biological indicators for sterilization)',
      ],
    },
  },
  {
    id: 'W-12',
    unitId: 'foodsci',
    category: 'Biological',
    name: 'Food-microbiology culture waste',
    sourceActivity: 'Salmonella / coliform testing of food samples',
    hazardClass: 'DOH infectious (yellow)',
    hazardCode: 'Basel Y1 / DOH infectious',
    physicalState: 'Agar plates + broth',
    volumePerMonth: '≈10 kg / month',
    storage: 'Autoclave-holding bins, yellow bags',
    disposalActivity:
      'Cultures autoclaved before disposal and segregated into the infectious-waste stream.',
    method: 'On-site autoclave',
    treatment: 'Steam sterilization then licensed HCW hauler',
    hauler: 'MetroClark Health Waste (DOH-licensed)',
    manifest: 'MNF-2026-0158',
    status: 'Compliant',
    ai: {
      verdict: 'Properly handled',
      severity: 'OK',
      summary:
        'Food-microbiology cultures are decontaminated by autoclaving and segregated correctly. Maintain validation and avoid mixing chemical stains into the infectious stream.',
      actions: [
        'Keep chemical stains (e.g. crystal violet) out of the autoclave/infectious stream.',
        'Continue cycle validation with indicators.',
      ],
      standards: [
        'WHO Laboratory Biosafety Manual, 4th ed. (2020)',
        'DOH Health-Care Waste Management Manual',
        'CDC/NIH BMBL, 6th ed.',
      ],
    },
  },
]

// Factual standards catalog referenced by the AI recommendations.
export interface StandardRef {
  code: string
  title: string
  scope: 'Chemical' | 'Biological' | 'Both'
}
export const WASTE_STANDARDS: StandardRef[] = [
  { code: 'RA 6969', title: 'Toxic Substances & Hazardous and Nuclear Wastes Control Act (Philippines)', scope: 'Chemical' },
  { code: 'DENR DAO 2013-22', title: 'Revised procedures for the management of hazardous wastes', scope: 'Chemical' },
  { code: 'RA 9275', title: 'Philippine Clean Water Act — prohibits hazardous discharge to water', scope: 'Chemical' },
  { code: 'RA 8749', title: 'Philippine Clean Air Act — restricts incineration; favors non-burn treatment', scope: 'Both' },
  { code: 'US EPA RCRA 40 CFR 261', title: 'Hazardous-waste identification & characteristics (D/U codes)', scope: 'Chemical' },
  { code: 'OSHA 29 CFR 1910.1450', title: 'Occupational exposure to hazardous chemicals in laboratories', scope: 'Chemical' },
  { code: 'OSHA 29 CFR 1910.1048', title: 'Formaldehyde standard', scope: 'Chemical' },
  { code: 'OSHA 29 CFR 1910.1030', title: 'Bloodborne pathogens standard', scope: 'Biological' },
  { code: 'NFPA 30 / NFPA 430', title: 'Flammable & combustible liquids / oxidizer storage codes', scope: 'Chemical' },
  { code: 'UN GHS Rev.10', title: 'Globally Harmonized System of classification & labelling', scope: 'Chemical' },
  { code: 'WHO Biosafety Manual 4th ed. (2020)', title: 'Laboratory decontamination & waste categories', scope: 'Biological' },
  { code: 'CDC/NIH BMBL 6th ed.', title: 'Biosafety in microbiological & biomedical laboratories', scope: 'Biological' },
  { code: 'WHO HCW (2014)', title: 'Safe management of wastes from health-care activities', scope: 'Biological' },
  { code: 'DOH HCWM Manual', title: 'Philippine Health-Care Waste Management Manual (segregation & treatment)', scope: 'Biological' },
  { code: 'Basel Convention', title: 'Control of transboundary movements of hazardous wastes (Y1 clinical)', scope: 'Both' },
  { code: 'ISO 11138', title: 'Biological indicators for sterilization / autoclave validation', scope: 'Biological' },
  { code: 'NRC Prudent Practices', title: 'Prudent Practices in the Laboratory (waste segregation)', scope: 'Chemical' },
]

// ============================================================
// AI Safety Assessments (Mandate — 5 labs w/ findings)
// ============================================================
export const ASSESSMENTS: Assessment[] = [
  {
    labId: 'chem-organic',
    labName: 'Organic Chemistry Lab (Rm 204)',
    unitId: 'chem',
    score: 68,
    findings: [
      {
        id: 'F-01',
        severity: 'CRITICAL',
        title: 'Expired acetone (4 L) still in active storage',
        recommendation:
          'Remove from service immediately and dispose via DENR-accredited hauler with manifest; log in Waste Register.',
        reference: 'DENR DAO 2013-22 · RA 6969',
      },
      {
        id: 'F-02',
        severity: 'HIGH',
        title: 'Sulfuric acid lacks secondary containment tray',
        recommendation:
          'Place concentrated acids in chemically-resistant secondary containment sized to 110% of largest container.',
        reference: 'OSHA 29 CFR 1910.1450 · NFPA 30',
      },
      {
        id: 'F-03',
        severity: 'MEDIUM',
        title: 'Flammable solvent volume near cabinet limit',
        recommendation:
          'Verify aggregate flammable liquids per cabinet do not exceed NFPA 30 storage limits; redistribute if needed.',
        reference: 'NFPA 30 · OSHA 1910.106',
      },
      {
        id: 'F-04',
        severity: 'OK',
        title: 'Eyewash / safety shower accessible and tested',
        recommendation: 'Maintain weekly activation log; annual flow certification on file.',
        reference: 'ANSI Z358.1',
      },
    ],
  },
  {
    labId: 'vet-anatomy',
    labName: 'Anatomy Lab (Rm 118)',
    unitId: 'vetmed',
    score: 44,
    findings: [
      {
        id: 'F-05',
        severity: 'CRITICAL',
        title: 'Formaldehyde stored on open shelving',
        recommendation:
          'Relocate carcinogen to ventilated/fume-hooded storage; implement exposure monitoring and labeling.',
        reference: 'OSHA 29 CFR 1910.1048 · UN GHS Rev.10',
      },
      {
        id: 'F-06',
        severity: 'HIGH',
        title: 'No formaldehyde exposure-control plan documented',
        recommendation:
          'Establish written exposure control plan with air monitoring and regulated-area signage.',
        reference: 'OSHA 1910.1048(d) · WHO Lab Safety Manual',
      },
      {
        id: 'F-07',
        severity: 'MEDIUM',
        title: 'Chemical inventory 40% complete for this unit',
        recommendation: 'Complete survey submission before the 15 Jul deadline to enable full validation.',
        reference: 'TWG Survey Instrument · Mandate 1',
      },
    ],
  },
  {
    labId: 'biosci-bsl2',
    labName: 'BSL-2 Microbiology Lab (Rm 305)',
    unitId: 'biosci',
    score: 71,
    findings: [
      {
        id: 'F-08',
        severity: 'CRITICAL',
        title: 'HBV samples accessible to unvaccinated personnel',
        recommendation:
          'Restrict access to HBV-vaccinated staff; verify titers; enforce bloodborne-pathogen exposure control plan.',
        reference: 'DOH Biosafety · CDC/NIH BMBL 6th ed. · OSHA 1910.1030',
      },
      {
        id: 'F-09',
        severity: 'HIGH',
        title: 'Biosafety cabinet (Class II) certification overdue',
        recommendation: 'Schedule NSF/ANSI 49 field certification of BSC before further BSL-2 work.',
        reference: 'NSF/ANSI 49 · CDC/NIH BMBL',
      },
      {
        id: 'F-10',
        severity: 'LOW',
        title: 'Biohazard door signage missing agent list',
        recommendation: 'Update BSL-2 entry signage with agent inventory, PI contact, and PPE requirements.',
        reference: 'WHO Biosafety Manual 4th ed.',
      },
      {
        id: 'F-11',
        severity: 'OK',
        title: 'Sharps containers compliant and below fill line',
        recommendation: 'Continue current sharps handling and disposal contract.',
        reference: 'DOH Biosafety',
      },
    ],
  },
  {
    labId: 'biosci-prep',
    labName: 'Micro Prep & Autoclave Room (Rm 302)',
    unitId: 'biosci',
    score: 58,
    findings: [
      {
        id: 'F-12',
        severity: 'HIGH',
        title: 'Autoclave validation (spore test) lapsed 3 months',
        recommendation:
          'Resume monthly biological indicator (Geobacillus) validation; quarantine waste until a passing cycle is logged.',
        reference: 'CDC/NIH BMBL · WHO Biosafety Manual',
      },
      {
        id: 'F-13',
        severity: 'MEDIUM',
        title: 'Infectious waste awaiting pickup exceeds 72h target',
        recommendation: 'Coordinate hauler pickup; do not accumulate BSL-2 waste beyond facility limit.',
        reference: 'DOH Health-Care Waste Mgmt',
      },
      {
        id: 'F-14',
        severity: 'OK',
        title: 'Cold-chain freezers logging temperature',
        recommendation: 'Maintain −80 °C log and alarm testing.',
        reference: 'WHO Lab Safety Manual',
      },
    ],
  },
  {
    labId: 'agchem-soil',
    labName: 'Soil & Agri-Chem Lab',
    unitId: 'agchem',
    score: 55,
    findings: [
      {
        id: 'F-15',
        severity: 'HIGH',
        title: 'Expired hydrogen peroxide stored beside solvents',
        recommendation:
          'Segregate oxidizers from flammables; dispose expired oxidizer per DENR; keep min. 3 m or barrier separation.',
        reference: 'UN GHS Rev.10 · DENR DAO 2013-22 · NFPA 30',
      },
      {
        id: 'F-16',
        severity: 'MEDIUM',
        title: 'Acid/base segregation not maintained on shelving',
        recommendation: 'Store acids and bases in separate secondary containment; apply GHS segregation matrix.',
        reference: 'UN GHS Rev.10 · OSHA 1910.1450',
      },
      {
        id: 'F-17',
        severity: 'LOW',
        title: 'Chemical labels fading on secondary containers',
        recommendation: 'Re-label all secondary containers with GHS-compliant identity and hazard pictograms.',
        reference: 'UN GHS Rev.10',
      },
    ],
  },
]

export const gradeForScore = (
  s: number,
): { label: string; tone: 'high' | 'med' | 'low' | 'info' } => {
  if (s >= 85) return { label: 'Audit-ready', tone: 'low' }
  if (s >= 70) return { label: 'Good standing', tone: 'info' }
  if (s >= 55) return { label: 'Needs attention', tone: 'med' }
  return { label: 'Action required', tone: 'high' }
}

export const STANDARDS = [
  'WHO Lab Safety & Biosafety Manual',
  'UN GHS Rev.10',
  'OSHA 29 CFR 1910.1450',
  'OSHA 29 CFR 1910.1048',
  'DENR DAO 2013-22',
  'RA 6969',
  'DOH Biosafety',
  'CDC/NIH BMBL',
  'NFPA 30',
  'NSF/ANSI 49',
  'ANSI Z358.1',
]

// ============================================================
// Corrective Actions (Mandate 6) — derived from findings
// ============================================================
export const ACTIONS: Action[] = [
  {
    id: 'A-01',
    title: 'Dispose expired acetone via DENR hauler',
    severity: 'CRITICAL',
    unitId: 'chem',
    owner: 'M. Delgado',
    due: '2026-07-12',
    status: 'Open',
    sourceFinding: 'F-01',
  },
  {
    id: 'A-02',
    title: 'Relocate formaldehyde to ventilated storage',
    severity: 'CRITICAL',
    unitId: 'vetmed',
    owner: 'L. Ocampo',
    due: '2026-07-10',
    status: 'Open',
    sourceFinding: 'F-05',
  },
  {
    id: 'A-03',
    title: 'Restrict HBV access to vaccinated staff',
    severity: 'CRITICAL',
    unitId: 'biosci',
    owner: 'J. Ferrer',
    due: '2026-07-14',
    status: 'Open',
    sourceFinding: 'F-08',
  },
  {
    id: 'A-04',
    title: 'Install secondary containment for sulfuric acid',
    severity: 'HIGH',
    unitId: 'chem',
    owner: 'M. Delgado',
    due: '2026-07-20',
    status: 'In progress',
    sourceFinding: 'F-02',
  },
  {
    id: 'A-05',
    title: 'Recertify BSC Class II (NSF/ANSI 49)',
    severity: 'HIGH',
    unitId: 'biosci',
    owner: 'Facilities',
    due: '2026-07-22',
    status: 'In progress',
    sourceFinding: 'F-09',
  },
  {
    id: 'A-06',
    title: 'Resume autoclave spore-test validation',
    severity: 'HIGH',
    unitId: 'biosci',
    owner: 'R. Aquino',
    due: '2026-07-18',
    status: 'In progress',
    sourceFinding: 'F-12',
  },
  {
    id: 'A-07',
    title: 'Segregate oxidizers from flammable solvents',
    severity: 'HIGH',
    unitId: 'agchem',
    owner: 'A. Bonifacio',
    due: '2026-06-30',
    status: 'Resolved',
    sourceFinding: 'F-15',
  },
  {
    id: 'A-08',
    title: 'Re-label secondary containers (GHS)',
    severity: 'LOW',
    unitId: 'agchem',
    owner: 'A. Bonifacio',
    due: '2026-06-25',
    status: 'Resolved',
    sourceFinding: 'F-17',
  },
]

// ============================================================
// AI verification queue (dashboard feed)
// ============================================================
export const AI_FLAGS: AiFlag[] = [
  {
    id: 'Q-1',
    type: 'EXPIRED',
    text: 'Acetone (M-001) passed expiry',
    detail: 'Expired 12 Mar 2026 · Chemistry Complex Rm 204 — flagged for disposal.',
    time: '2h ago',
  },
  {
    id: 'Q-2',
    type: 'STORAGE',
    text: 'Formaldehyde on open shelf',
    detail: 'Carcinogen (M-006) stored uncontained · Vet Medicine Rm 118 — storage mismatch.',
    time: '3h ago',
  },
  {
    id: 'Q-3',
    type: 'STORAGE',
    text: 'HBV access control gap',
    detail: 'HBV samples (M-014) reachable by unvaccinated staff · Biological Sciences Rm 305.',
    time: '5h ago',
  },
  {
    id: 'Q-4',
    type: 'EXPIRED',
    text: 'Hydrogen peroxide expired',
    detail: 'Oxidizer (M-008) expired 01 May 2026 and shelved beside solvents · Agri-Chem.',
    time: '6h ago',
  },
  {
    id: 'Q-5',
    type: 'DUPLICATE',
    text: 'Possible duplicate: Ethanol entry',
    detail: 'Two ethanol records in Food Science Rm 105 — verify before validation.',
    time: '1d ago',
  },
  {
    id: 'Q-6',
    type: 'INCOMPLETE',
    text: 'Tropical Ecology submission missing',
    detail: 'Unit not started; deadline 02 Jul 2026 has passed — coordination reminder sent.',
    time: '1d ago',
  },
]

// ============================================================
// Buildings for Hazard Zone Map
// ============================================================
export interface Building {
  id: string
  name: string
  labs: { name: string; risk: 'High' | 'Medium' | 'Low'; items: number }[]
}
export const BUILDINGS: Building[] = [
  {
    id: 'chem-complex',
    name: 'Chemistry Complex',
    labs: [
      { name: 'Rm 204 Organic Lab', risk: 'High', items: 3 },
      { name: 'Rm 210 Analytical Lab', risk: 'High', items: 2 },
      { name: 'Rm 208 Instrumentation', risk: 'Low', items: 1 },
    ],
  },
  {
    id: 'bio-sci',
    name: 'Biological Sciences',
    labs: [
      { name: 'Rm 305 BSL-2 Lab', risk: 'High', items: 2 },
      { name: 'Rm 302 Micro Prep/Autoclave', risk: 'Medium', items: 1 },
      { name: 'Rm 310 Teaching Lab', risk: 'Low', items: 1 },
    ],
  },
  {
    id: 'agchem',
    name: 'Agri-Chem Research Center',
    labs: [
      { name: 'Soil & Agri-Chem Lab', risk: 'Medium', items: 2 },
      { name: 'Fertilizer Analysis', risk: 'Medium', items: 1 },
      { name: 'Sample Prep', risk: 'Low', items: 0 },
    ],
  },
  {
    id: 'vetmed',
    name: 'Vet Medicine',
    labs: [
      { name: 'Rm 130 Containment (BSL-3)', risk: 'High', items: 1 },
      { name: 'Rm 118 Anatomy Lab', risk: 'High', items: 1 },
      { name: 'Pharmacology Lab', risk: 'Medium', items: 0 },
    ],
  },
  {
    id: 'foodsci',
    name: 'Food Science',
    labs: [
      { name: 'Rm 105 Micro Lab', risk: 'Medium', items: 2 },
      { name: 'Sensory Evaluation', risk: 'Low', items: 0 },
    ],
  },
  {
    id: 'ecoinst',
    name: 'Tropical Ecology Institute',
    labs: [
      { name: 'Field Chemistry Lab', risk: 'Low', items: 0 },
      { name: 'Herbarium', risk: 'Low', items: 0 },
    ],
  },
]

// ============================================================
// Derived aggregations — single source of truth for KPIs
// ============================================================
export const stats = {
  get totalMaterials() {
    return MATERIALS.length
  },
  get highRisk() {
    return MATERIALS.filter((m) => m.riskLevel === 'High').length
  },
  get nonCompliant() {
    return MATERIALS.filter(
      (m) => m.status === 'Non-compliant' || m.status === 'Expired',
    ).length
  },
  get aiFlagsOpen() {
    return AI_FLAGS.length
  },
  get openActions() {
    return ACTIONS.filter((a) => a.status === 'Open').length
  },
  get correctiveOpenTotal() {
    return ACTIONS.filter((a) => a.status !== 'Resolved').length
  },
  get pendingUnits() {
    return unitsRegistry.filter(
      (u) => u.status === 'In progress' || u.status === 'Not started',
    ).length
  },
  riskCounts(category?: 'Chemical' | 'Biological') {
    const src = category
      ? MATERIALS.filter((m) => m.category === category)
      : MATERIALS
    return {
      High: src.filter((m) => m.riskLevel === 'High').length,
      Medium: src.filter((m) => m.riskLevel === 'Medium').length,
      Low: src.filter((m) => m.riskLevel === 'Low').length,
    }
  },
  itemsByUnit(unitId: string) {
    return MATERIALS.filter((m) => m.unitId === unitId).length
  },
  get campusProgress() {
    if (unitsRegistry.length === 0) return 0
    return Math.round(
      unitsRegistry.reduce((s, u) => s + u.progress, 0) / unitsRegistry.length,
    )
  },
}

// ============================================================
// Waste generation & disposal aggregations — the dashboard's
// single source of truth for the reoriented (waste-centric) view.
// ============================================================
const SEV_RANK: Record<Severity, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  OK: 1,
}
const handleScore: Record<HandlingStatus, number> = {
  Compliant: 100,
  'Partially compliant': 60,
  'Non-compliant': 20,
}

// Mutable waste registry — focal-person submissions are added here at runtime.
// The store persists them and syncs this registry so all screens stay in sync.
let wasteRegistry: WasteStream[] = WASTE_STREAMS.map((w) => ({ ...w }))
export const setWasteStreams = (list: WasteStream[]) => {
  wasteRegistry = list
}
export const getWasteStreams = (): WasteStream[] => wasteRegistry
// Map HandlingStatus from a recommendation verdict.
export const statusFromVerdict = (v: WasteStream['ai']['verdict']): HandlingStatus =>
  v === 'Properly handled'
    ? 'Compliant'
    : v === 'Needs improvement'
      ? 'Partially compliant'
      : 'Non-compliant'

export const wasteStats = {
  get total() {
    return wasteRegistry.length
  },
  countByCategory(cat: 'Chemical' | 'Biological') {
    return wasteRegistry.filter((w) => w.category === cat).length
  },
  countByStatus(status: HandlingStatus) {
    return wasteRegistry.filter((w) => w.status === status).length
  },
  get improper() {
    return wasteRegistry.filter((w) => w.status === 'Non-compliant').length
  },
  get needsImprovement() {
    return wasteRegistry.filter((w) => w.status === 'Partially compliant').length
  },
  get proper() {
    return wasteRegistry.filter((w) => w.status === 'Compliant').length
  },
  // Open AI recommendations = streams not yet properly handled.
  get openRecommendations() {
    return wasteRegistry.filter((w) => w.status !== 'Compliant').length
  },
  get unitsGenerating() {
    return new Set(wasteRegistry.map((w) => w.unitId)).size
  },
  streamsByUnit(unitId: string) {
    return wasteRegistry.filter((w) => w.unitId === unitId)
  },
  // 0–100 handling score for a unit (avg of its streams). null if none.
  unitScore(unitId: string): number | null {
    const s = this.streamsByUnit(unitId)
    if (s.length === 0) return null
    return Math.round(s.reduce((a, w) => a + handleScore[w.status], 0) / s.length)
  },
  unitWorstSeverity(unitId: string): Severity {
    const s = this.streamsByUnit(unitId)
    let worst: Severity = 'OK'
    for (const w of s) if (SEV_RANK[w.ai.severity] > SEV_RANK[worst]) worst = w.ai.severity
    return worst
  },
  // Priority-ordered recommendations that still need action (for the feed).
  get priorityRecommendations() {
    return wasteRegistry.filter((w) => w.status !== 'Compliant').sort(
      (a, b) => SEV_RANK[b.ai.severity] - SEV_RANK[a.ai.severity],
    )
  },
  get campusHandlingScore() {
    const scored = unitsRegistry
      .map((u) => this.unitScore(u.id))
      .filter((v): v is number => v !== null)
    if (scored.length === 0) return 0
    return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
  },
}
