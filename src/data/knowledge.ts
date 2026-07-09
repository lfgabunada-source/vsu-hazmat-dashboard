import type { KnowledgeEntry } from './types'

// ============================================================
// Reference knowledge base — mock "AI" substance brain.
// Maps known substances → canonical identification data.
// Used by New Entry live AI panel + AI Assessment.
// ============================================================

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ---------- Chemicals ----------
  {
    aliases: ['acetone', 'propanone', 'dimethyl ketone', '2-propanone'],
    canonicalName: 'Acetone',
    category: 'Chemical',
    casOrStrain: '67-64-1',
    formula: 'C3H6O',
    substanceType: 'Ketone / solvent',
    riskLevel: 'High',
    ghs: ['flammable', 'irritant'],
    storage: 'Flammables cabinet, ≤25 °C, away from ignition & oxidizers',
    incompatibilities: ['Strong oxidizers', 'Chloroform', 'Nitric acid', 'Hydrogen peroxide'],
    notes: 'Highly volatile and flammable; ground containers when transferring.',
  },
  {
    aliases: ['sodium hydroxide', 'naoh', 'caustic soda', 'lye'],
    canonicalName: 'Sodium Hydroxide',
    category: 'Chemical',
    casOrStrain: '1310-73-2',
    formula: 'NaOH',
    substanceType: 'Inorganic strong base',
    riskLevel: 'High',
    ghs: ['corrosive'],
    storage: 'Corrosives cabinet, dry, sealed; separate from acids',
    incompatibilities: ['Acids', 'Aluminum', 'Zinc', 'Water (exothermic)'],
    notes: 'Severely corrosive to skin and eyes; store below oxidizers, never above.',
  },
  {
    aliases: ['sulfuric acid', 'sulphuric acid', 'h2so4', 'oil of vitriol'],
    canonicalName: 'Sulfuric Acid',
    category: 'Chemical',
    casOrStrain: '7664-93-9',
    formula: 'H2SO4',
    substanceType: 'Mineral acid (strong)',
    riskLevel: 'High',
    ghs: ['corrosive', 'toxic'],
    storage: 'Acid cabinet w/ secondary containment; separate from bases & organics',
    incompatibilities: ['Bases', 'Water (add acid to water)', 'Metals', 'Organic materials', 'Chlorates'],
    notes: 'Strongly corrosive and reactive; requires secondary containment tray.',
  },
  {
    aliases: ['methanol', 'methyl alcohol', 'ch3oh', 'wood alcohol'],
    canonicalName: 'Methanol',
    category: 'Chemical',
    casOrStrain: '67-56-1',
    formula: 'CH4O',
    substanceType: 'Alcohol / solvent',
    riskLevel: 'High',
    ghs: ['flammable', 'toxic', 'health-hazard'],
    storage: 'Flammables cabinet, ≤25 °C, ventilated; away from oxidizers',
    incompatibilities: ['Strong oxidizers', 'Strong acids', 'Alkali metals'],
    notes: 'Toxic if ingested/inhaled — target organ toxicity; flammable.',
  },
  {
    aliases: ['ethanol', 'ethyl alcohol', 'c2h5oh', 'etoh', 'absolute alcohol'],
    canonicalName: 'Ethanol',
    category: 'Chemical',
    casOrStrain: '64-17-5',
    formula: 'C2H6O',
    substanceType: 'Alcohol / solvent',
    riskLevel: 'Medium',
    ghs: ['flammable', 'irritant'],
    storage: 'Flammables cabinet, ≤25 °C; away from oxidizers & ignition',
    incompatibilities: ['Strong oxidizers', 'Peroxides', 'Acids'],
    notes: 'Flammable; common denatured lab solvent.',
  },
  {
    aliases: ['hydrochloric acid', 'muriatic acid', 'hcl'],
    canonicalName: 'Hydrochloric Acid',
    category: 'Chemical',
    casOrStrain: '7647-01-0',
    formula: 'HCl',
    substanceType: 'Mineral acid (strong)',
    riskLevel: 'High',
    ghs: ['corrosive', 'irritant'],
    storage: 'Acid cabinet w/ secondary containment; separate from bases & metals',
    incompatibilities: ['Bases', 'Metals', 'Oxidizers', 'Amines'],
    notes: 'Corrosive; releases irritating fumes — use fume hood.',
  },
  {
    aliases: ['formaldehyde', 'formalin', 'methanal', 'ch2o', 'hcho'],
    canonicalName: 'Formaldehyde',
    category: 'Chemical',
    casOrStrain: '50-00-0',
    formula: 'CH2O',
    substanceType: 'Aldehyde / fixative (carcinogen)',
    riskLevel: 'High',
    ghs: ['toxic', 'health-hazard', 'corrosive'],
    storage: 'Ventilated cabinet / fume hood; sealed; away from oxidizers & acids',
    incompatibilities: ['Strong oxidizers', 'Acids', 'Bases', 'Amines'],
    notes: 'Known human carcinogen (IARC Group 1) — must not be on open shelving.',
  },
  {
    aliases: ['hydrogen peroxide', 'h2o2', 'peroxide'],
    canonicalName: 'Hydrogen Peroxide',
    category: 'Chemical',
    casOrStrain: '7722-84-1',
    formula: 'H2O2',
    substanceType: 'Inorganic peroxide / oxidizer',
    riskLevel: 'Medium',
    ghs: ['oxidizer', 'corrosive', 'irritant'],
    storage: 'Cool, dark, vented cap; segregate from flammables & organics',
    incompatibilities: ['Flammables', 'Organic solvents', 'Acetone', 'Metals', 'Reducers'],
    notes: 'Strong oxidizer; decomposes with heat/light — store away from solvents.',
  },
  {
    aliases: ['chloroform', 'trichloromethane', 'chcl3'],
    canonicalName: 'Chloroform',
    category: 'Chemical',
    casOrStrain: '67-66-3',
    formula: 'CHCl3',
    substanceType: 'Halogenated solvent (carcinogen)',
    riskLevel: 'High',
    ghs: ['toxic', 'health-hazard', 'irritant'],
    storage: 'Cool, dark, ventilated; amber bottle; away from oxidizers & acetone',
    incompatibilities: ['Strong bases', 'Acetone', 'Strong oxidizers', 'Aluminum'],
    notes: 'Suspected carcinogen; forms phosgene on exposure to light/air.',
  },

  // ---------- Biologicals ----------
  {
    aliases: ['e. coli k-12', 'e coli k12', 'escherichia coli k-12', 'ecoli', 'e. coli'],
    canonicalName: 'Escherichia coli K-12',
    category: 'Biological',
    casOrStrain: 'K-12 (non-pathogenic)',
    substanceType: 'Gram-negative bacterium (lab strain)',
    riskLevel: 'Low',
    bsl: 'BSL-1',
    storage: 'Cryovial at −80 °C; working stock 2–8 °C; sealed',
    incompatibilities: ['Cross-contamination with pathogenic strains'],
    notes: 'Standard non-pathogenic teaching/cloning strain.',
  },
  {
    aliases: ['s. aureus', 'staph aureus', 'staphylococcus aureus'],
    canonicalName: 'Staphylococcus aureus',
    category: 'Biological',
    casOrStrain: 'ATCC 25923',
    substanceType: 'Gram-positive bacterium (opportunistic pathogen)',
    riskLevel: 'Medium',
    bsl: 'BSL-2',
    storage: 'Cryostock −80 °C; handle in BSC Class II; sealed secondary container',
    incompatibilities: ['Open-bench handling', 'Non-BSC aerosol-generating steps'],
    notes: 'BSL-2; skin/wound pathogen — biosafety cabinet required.',
  },
  {
    aliases: ['salmonella enterica', 'salmonella', 's. enterica'],
    canonicalName: 'Salmonella enterica',
    category: 'Biological',
    casOrStrain: 'serovar Typhimurium',
    substanceType: 'Gram-negative enteric pathogen',
    riskLevel: 'Medium',
    bsl: 'BSL-2',
    storage: 'Cryostock −80 °C; BSC Class II; enteric precautions',
    incompatibilities: ['Open-bench handling', 'Food-prep areas'],
    notes: 'BSL-2 enteric pathogen; strict aseptic + waste autoclaving.',
  },
  {
    aliases: ['m. tuberculosis', 'mycobacterium tuberculosis', 'mtb', 'tb'],
    canonicalName: 'Mycobacterium tuberculosis',
    category: 'Biological',
    casOrStrain: 'H37Rv',
    substanceType: 'Acid-fast bacterium (respiratory pathogen)',
    riskLevel: 'High',
    bsl: 'BSL-3',
    storage: 'BSL-3 containment only; sealed cryostock; validated autoclave for waste',
    incompatibilities: ['Any handling outside BSL-3', 'Non-HEPA exhaust rooms'],
    notes: 'BSL-3 — airborne transmission; requires containment lab & respiratory protection.',
  },
  {
    aliases: ['s. cerevisiae', 'saccharomyces cerevisiae', 'yeast', 'bakers yeast'],
    canonicalName: 'Saccharomyces cerevisiae',
    category: 'Biological',
    casOrStrain: 'S288C',
    substanceType: 'Yeast (fungus, non-pathogenic)',
    riskLevel: 'Low',
    bsl: 'BSL-1',
    storage: 'Glycerol stock −80 °C; agar slants 2–8 °C',
    incompatibilities: ['Cross-contamination'],
    notes: 'Non-pathogenic model organism.',
  },
  {
    aliases: ['hepatitis b', 'hbv', 'hepatitis b samples', 'hep b'],
    canonicalName: 'Hepatitis B virus samples',
    category: 'Biological',
    casOrStrain: 'HBV (clinical serum)',
    substanceType: 'Bloodborne viral pathogen',
    riskLevel: 'High',
    bsl: 'BSL-2',
    storage: 'Locked −20 °C; BSC Class II; universal/bloodborne precautions',
    incompatibilities: ['Unvaccinated personnel access', 'Open-bench handling', 'Sharps without engineering controls'],
    notes: 'BSL-2 with enhanced practices; HBV vaccination required for handlers.',
  },
]

// Fuzzy-ish match: exact alias, then substring on aliases / canonical name.
export function identifySubstance(query: string): {
  entry: KnowledgeEntry | null
  confidence: number
} {
  const q = query.trim().toLowerCase()
  if (!q) return { entry: null, confidence: 0 }

  // exact alias match
  for (const e of KNOWLEDGE_BASE) {
    if (e.aliases.includes(q) || e.canonicalName.toLowerCase() === q) {
      return { entry: e, confidence: 99 }
    }
  }
  // strong prefix / contains match
  let best: { entry: KnowledgeEntry; score: number } | null = null
  for (const e of KNOWLEDGE_BASE) {
    for (const a of [...e.aliases, e.canonicalName.toLowerCase()]) {
      if (a.startsWith(q) && q.length >= 3) {
        const score = 80 + Math.min(15, q.length)
        if (!best || score > best.score) best = { entry: e, score }
      } else if (a.includes(q) && q.length >= 4) {
        const score = 68 + Math.min(12, q.length)
        if (!best || score > best.score) best = { entry: e, score }
      }
    }
  }
  if (best) return { entry: best.entry, confidence: best.score }
  return { entry: null, confidence: 0 }
}

// Autocomplete suggestions
export function suggestSubstances(query: string, limit = 6): KnowledgeEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const seen = new Set<string>()
  const out: KnowledgeEntry[] = []
  for (const e of KNOWLEDGE_BASE) {
    const hay = [e.canonicalName.toLowerCase(), ...e.aliases]
    if (hay.some((h) => h.includes(q)) && !seen.has(e.canonicalName)) {
      seen.add(e.canonicalName)
      out.push(e)
    }
    if (out.length >= limit) break
  }
  return out
}

export const GHS_META: Record<string, { label: string; glyph: string }> = {
  flammable: { label: 'Flammable', glyph: 'flame' },
  corrosive: { label: 'Corrosive', glyph: 'corrosive' },
  toxic: { label: 'Acute toxic', glyph: 'skull' },
  'health-hazard': { label: 'Health hazard', glyph: 'health' },
  oxidizer: { label: 'Oxidizer', glyph: 'oxidizer' },
  irritant: { label: 'Irritant', glyph: 'exclaim' },
  environment: { label: 'Environmental', glyph: 'environment' },
}
