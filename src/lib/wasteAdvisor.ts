import type {
  WasteCategory,
  DisposalMethod,
  WasteRecommendation,
  Severity,
} from '../data'

// ============================================================
// Rule-based AI advisor for waste disposal.
// Given a waste category, its hazard traits, and the unit's chosen
// disposal method, it returns a recommendation grounded in factual
// international / national standards.
// ============================================================

export type ChemTrait = 'carcinogen' | 'heavyMetals' | 'halogenated' | 'flammable' | 'oxidizer' | 'corrosive' | 'toxic'
export type BioTrait = 'infectious' | 'sharps' | 'bloodborne' | 'bsl3' | 'anatomical'
export type Trait = ChemTrait | BioTrait

export const CHEM_TRAITS: { key: ChemTrait; label: string }[] = [
  { key: 'carcinogen', label: 'Carcinogen / mutagen' },
  { key: 'heavyMetals', label: 'Heavy metals' },
  { key: 'halogenated', label: 'Halogenated / chlorinated' },
  { key: 'flammable', label: 'Flammable solvent' },
  { key: 'oxidizer', label: 'Oxidizer' },
  { key: 'corrosive', label: 'Corrosive (acid/base)' },
  { key: 'toxic', label: 'Acute toxic' },
]
export const BIO_TRAITS: { key: BioTrait; label: string }[] = [
  { key: 'infectious', label: 'Infectious cultures' },
  { key: 'sharps', label: 'Sharps' },
  { key: 'bloodborne', label: 'Bloodborne (e.g. HBV)' },
  { key: 'bsl3', label: 'BSL-3 agent' },
  { key: 'anatomical', label: 'Anatomical / tissue' },
]

export const CHEM_METHODS: DisposalMethod[] = [
  'DENR-accredited hauler',
  'Neutralization',
  'Charcoal filtration / destaining',
  'Drain disposal',
  'Untreated / accumulating',
]
export const BIO_METHODS: DisposalMethod[] = [
  'On-site autoclave',
  'Non-burn treatment',
  'DENR-accredited hauler',
  'Drain disposal',
  'Untreated / accumulating',
]

export const methodsFor = (c: WasteCategory) => (c === 'Chemical' ? CHEM_METHODS : BIO_METHODS)

// Suggest a hazard class + code from the declared traits.
export function classifyHazard(
  category: WasteCategory,
  traits: Trait[],
): { hazardClass: string; hazardCode: string } {
  if (category === 'Chemical') {
    if (traits.includes('carcinogen')) return { hazardClass: 'DENR Class C — toxic carcinogen', hazardCode: 'RCRA U-listed' }
    if (traits.includes('heavyMetals')) return { hazardClass: 'DENR Class D — toxic heavy metals', hazardCode: 'RCRA D004–D011' }
    if (traits.includes('halogenated')) return { hazardClass: 'DENR Class C — toxic organic', hazardCode: 'RCRA D022' }
    if (traits.includes('oxidizer')) return { hazardClass: 'DENR Class D — reactive oxidizer', hazardCode: 'RCRA D001 (oxidizer)' }
    if (traits.includes('flammable')) return { hazardClass: 'DENR Class A — flammable', hazardCode: 'RCRA D001' }
    if (traits.includes('corrosive')) return { hazardClass: 'DENR Class B — corrosive', hazardCode: 'RCRA D002' }
    return { hazardClass: 'DENR — hazardous chemical', hazardCode: 'RCRA characteristic' }
  }
  if (traits.includes('bsl3')) return { hazardClass: 'DOH highly infectious (BSL-3)', hazardCode: 'Basel Y1 / BSL-3' }
  if (traits.includes('bloodborne') || traits.includes('sharps')) return { hazardClass: 'DOH infectious / sharps', hazardCode: 'Basel Y1 / DOH sharps' }
  if (traits.includes('anatomical')) return { hazardClass: 'DOH pathological (yellow)', hazardCode: 'Basel Y1 / anatomical' }
  return { hazardClass: 'DOH infectious (yellow)', hazardCode: 'Basel Y1 / DOH infectious' }
}

interface AdviceInput {
  category: WasteCategory
  traits: Trait[]
  method: DisposalMethod
  hasHauler: boolean
  hasManifest: boolean
}

const has = (t: Trait[], k: Trait) => t.includes(k)

export function advise(input: AdviceInput): WasteRecommendation {
  const { category, traits, method, hasHauler, hasManifest } = input

  const mk = (
    verdict: WasteRecommendation['verdict'],
    severity: Severity,
    summary: string,
    actions: string[],
    standards: string[],
  ): WasteRecommendation => ({ verdict, severity, summary, actions, standards })

  if (category === 'Chemical') {
    switch (method) {
      case 'Drain disposal':
        if (has(traits, 'carcinogen'))
          return mk('Improperly handled', 'CRITICAL',
            'Carcinogenic/mutagenic chemical waste must never be poured down the drain. It has to be collected, neutralized/recovered or consigned to a licensed hauler, with vapor controls at the point of use.',
            ['Stop drain disposal immediately; collect in sealed, labelled containers.', 'Neutralize/recover (e.g. formalin neutralizer) or consign to a DENR-accredited hauler.', 'Provide local exhaust and an exposure-control plan.'],
            ['OSHA 29 CFR 1910.1048', 'RA 9275 (Clean Water Act)', 'RA 6969', 'DENR DAO 2013-22'])
        if (has(traits, 'heavyMetals'))
          return mk('Improperly handled', 'HIGH',
            'Heavy-metal-bearing waste cannot be drained. It is toxicity-characteristic hazardous waste requiring separate collection and licensed disposal.',
            ['Collect metals separately — never to the sewer (RA 9275).', 'Consign to a DENR-accredited TSD hauler with manifest.', 'Label with the metals present for correct treatment.'],
            ['US EPA RCRA 40 CFR 261 (D004–D011)', 'RA 9275', 'RA 6969', 'DENR DAO 2013-22'])
        if (has(traits, 'halogenated'))
          return mk('Improperly handled', 'HIGH',
            'Halogenated/chlorinated solvents must not be drained. Collect separately and route to a TSD facility for high-temperature treatment.',
            ['Segregate halogenated from non-halogenated solvents.', 'Consign to a DENR-registered TSD hauler with manifest.'],
            ['RA 6969', 'DENR DAO 2013-22', 'US EPA RCRA 40 CFR 261', 'RA 9275'])
        if (has(traits, 'corrosive'))
          return mk('Needs improvement', 'MEDIUM',
            'Simple acid/base waste may be drained only after neutralization to pH 6–9 and confirmation it is free of metals or toxic anions — RA 9275 prohibits hazardous discharge to water.',
            ['Neutralize to pH 6–9 before any drain disposal and log the pH/volume.', 'Confirm the effluent contains no heavy metals or toxic salts.'],
            ['RA 9275 (Clean Water Act)', 'DENR DAO 2013-22', 'OSHA 29 CFR 1910.1450'])
        return mk('Improperly handled', 'HIGH',
          'Hazardous chemical waste should not be discharged to the drain. Collect it and consign to a licensed hauler.',
          ['Stop drain disposal; collect in labelled containers.', 'Consign to a DENR-accredited hauler with manifest.'],
          ['RA 6969', 'RA 9275', 'DENR DAO 2013-22'])

      case 'Neutralization':
        if (has(traits, 'heavyMetals') || has(traits, 'carcinogen'))
          return mk('Improperly handled', 'HIGH',
            'Neutralization does not detoxify heavy metals or carcinogens. This stream must be collected and consigned to a licensed hauler, not neutralized and drained.',
            ['Collect as hazardous waste; do not rely on neutralization.', 'Consign to a DENR-accredited TSD hauler with manifest.'],
            ['US EPA RCRA 40 CFR 261', 'RA 6969', 'DENR DAO 2013-22', 'RA 9275'])
        return mk('Needs improvement', 'MEDIUM',
          'Neutralizing simple acid/base waste to pH 6–9 is acceptable only if the effluent is verified free of metals/toxic anions. Document each batch.',
          ['Record pH and volume in a neutralization log.', 'Divert any metal-bearing or organic batches to the hazardous stream.'],
          ['RA 9275 (Clean Water Act)', 'DENR DAO 2013-22', 'OSHA 29 CFR 1910.1450'])

      case 'DENR-accredited hauler':
        if (hasHauler && hasManifest) {
          const std = ['RA 6969', 'DENR DAO 2013-22', 'US EPA RCRA 40 CFR 261']
          if (has(traits, 'flammable')) std.push('NFPA 30')
          return mk('Properly handled', 'OK',
            'Consigning this hazardous chemical waste to a DENR-registered TSD facility with a manifest is the recommended disposal route.',
            ['Retain manifests for at least 5 years (DAO 2013-22).', 'Keep incompatible wastes (e.g. halogenated vs. non-halogenated, acids vs. bases) segregated.'],
            std)
        }
        return mk('Needs improvement', 'MEDIUM',
          'The hauler route is correct, but a manifest and accredited hauler must be recorded for every consignment.',
          ['Use only a DENR-registered TSD hauler.', 'Record and retain the manifest number for each pickup.'],
          ['DENR DAO 2013-22', 'RA 6969'])

      case 'Charcoal filtration / destaining':
        return mk('Needs improvement', 'MEDIUM',
          'Charcoal destaining is good practice for dilute mutagenic dyes (e.g. ethidium bromide), but the spent charcoal and any concentrate are hazardous waste and must be tracked to a licensed hauler.',
          ['Consign spent charcoal and concentrates to a DENR-accredited hauler with manifest.', 'Monitor charcoal breakthrough/capacity; consider safer stains.'],
          ['NRC Prudent Practices in the Laboratory', 'RA 6969', 'DENR DAO 2013-22'])

      case 'Untreated / accumulating':
        return mk('Improperly handled', 'HIGH',
          'Hazardous chemical waste is accumulating without treatment or a scheduled hauler. Register as a waste generator and arrange licensed disposal.',
          ['Provide secondary containment and correct labelling now.', 'Schedule pickup by a DENR-accredited TSD hauler with manifest.'],
          ['RA 6969', 'DENR DAO 2013-22'])

      default:
        return mk('Needs improvement', 'MEDIUM',
          'Autoclaving/non-burn treatment is intended for biological waste. Chemical waste requires chemical treatment or consignment to a licensed hauler.',
          ['Route chemical waste to a DENR-accredited hauler or appropriate chemical treatment.'],
          ['DENR DAO 2013-22', 'RA 6969'])
    }
  }

  // ---------------- Biological ----------------
  switch (method) {
    case 'On-site autoclave':
    case 'Non-burn treatment':
      if (has(traits, 'bsl3'))
        return mk('Needs improvement', 'HIGH',
          'BSL-3 waste must be decontaminated by a validated autoclave inside containment before any removal. The workflow is correct, but sterilization must be verified.',
          ['Run monthly Geobacillus stearothermophilus biological-indicator validation.', 'Quarantine treated waste until a passing indicator cycle is documented.', 'Never remove untreated BSL-3 waste from containment.'],
          ['WHO Laboratory Biosafety Manual, 4th ed. (2020)', 'CDC/NIH BMBL, 6th ed.', 'ISO 11138 (biological indicators)'])
      if (has(traits, 'sharps') || has(traits, 'bloodborne'))
        return mk('Needs improvement', 'MEDIUM',
          'Treatment then licensed disposal is the right route, but sharps/bloodborne handling needs engineering and administrative controls.',
          ['Use rigid, puncture-resistant sharps containers filled to ≤ ¾.', 'Restrict handling to HBV-vaccinated staff with an exposure-control plan.', 'Verify autoclave cycles with indicators.'],
          ['OSHA 29 CFR 1910.1030 (Bloodborne Pathogens)', 'WHO Safe Management of Health-Care Wastes (2014)', 'DOH HCWM Manual'])
      return mk('Properly handled', 'OK',
        'Decontaminating infectious waste by validated autoclaving / non-burn treatment and segregating it into the DOH health-care-waste stream is the recommended route (RA 8749 favours non-burn treatment).',
        ['Continue validated cycles with chemical and monthly biological indicators.', 'Do not compact untreated cultures.'],
        ['WHO Laboratory Biosafety Manual, 4th ed. (2020)', 'CDC/NIH BMBL, 6th ed.', 'DOH HCWM Manual', 'RA 8749 (Clean Air Act)'])

    case 'Drain disposal':
      return mk('Improperly handled', 'CRITICAL',
        'Infectious waste must be decontaminated (autoclave or chemical disinfection) before any disposal. Untreated cultures must never be poured down the drain.',
        ['Stop drain disposal; autoclave or chemically disinfect all cultures first.', 'Then segregate to the DOH infectious-waste stream for licensed pickup.'],
        ['WHO Laboratory Biosafety Manual, 4th ed. (2020)', 'CDC/NIH BMBL, 6th ed.', 'DOH HCWM Manual'])

    case 'Untreated / accumulating':
      return mk('Improperly handled', 'HIGH',
        'Infectious waste is accumulating untreated. It must be decontaminated and consigned to a DOH-licensed health-care-waste hauler.',
        ['Autoclave / non-burn treat before storage.', 'Segregate into DOH yellow-bag stream and schedule licensed pickup.'],
        ['WHO Laboratory Biosafety Manual, 4th ed. (2020)', 'CDC/NIH BMBL, 6th ed.', 'DOH HCWM Manual'])

    case 'DENR-accredited hauler':
      if (has(traits, 'anatomical'))
        return mk('Properly handled', 'OK',
          'Anatomical/pathological waste consigned for authorized treatment is acceptable. Confirm the hauler uses a DENR/DOH-authorized non-burn or approved process (RA 8749 restricts incineration).',
          ['Confirm the treatment method is authorized (RA 8749).', 'Maintain cold storage before pickup.'],
          ['WHO Safe Management of Health-Care Wastes (2014)', 'DOH HCWM Manual', 'RA 8749 (Clean Air Act)', 'Basel Convention (Y1)'])
      return mk('Needs improvement', 'MEDIUM',
        'Infectious waste should be decontaminated and segregated into the DOH health-care-waste (non-burn) stream rather than routed as general hazardous waste.',
        ['Autoclave / non-burn treat, then use a DOH-licensed health-care-waste hauler.', 'Confirm non-burn/authorized treatment (RA 8749).'],
        ['DOH HCWM Manual', 'WHO Safe Management of Health-Care Wastes (2014)', 'RA 8749'])

    default:
      return mk('Needs improvement', 'MEDIUM',
        'This method does not match infectious waste. Decontaminate by autoclave/non-burn treatment and segregate to the DOH health-care-waste stream.',
        ['Autoclave or non-burn treat, then consign to a DOH-licensed hauler.'],
        ['WHO Laboratory Biosafety Manual, 4th ed. (2020)', 'DOH HCWM Manual'])
  }
}
