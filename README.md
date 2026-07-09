# VSU HazMat — Lab Safety Registry

A **University-Wide Dashboard for the Survey, Inventory & Profiling of Chemical and Biological Hazardous Laboratory Materials** for Visayas State University (VSU), Baybay City, Leyte.

Built for a Technical Working Group (TWG) mandate covering data collection, inventory, risk assessment, waste profiling, and executive reporting.

## Stack

- **React 18 + Vite + TypeScript**
- **React Router** for the 11 screens
- **lucide-react** icons
- **Token-driven CSS** design system (VSU brand palette, no CSS framework needed)
- Google Fonts: **Archivo** (headings), **Public Sans** (body), **IBM Plex Mono** (codes/numbers)
- No backend — all data is mock, centralized in `src/data/` so counts stay consistent across every screen.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Accounts & roles

The app now opens on a **sign-in screen**. Authentication and unit configuration are
client-side and persisted in `localStorage` (this is a front-end prototype — there is no
server; passwords are stored locally in plain text).

**Demo credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin (University Safety Officer) | `lfgabuanda@vsu.edu.ph` | `vsuadmin` |
| Approved focal person (Chemistry) | `m.delgado@vsu.edu.ph` | `focal123` |

**Flow**
1. **Focal persons** request an account from the sign-in screen ("Request account"),
   choosing their unit and using an official `@vsu.edu.ph` email. Requests start as *pending*.
2. The **admin** signs in and approves/rejects requests under **Administration → Approvals**.
   Only approved focal persons can sign in.
3. **Only approved focal persons and the admin can submit waste entries.** A focal
   person's New Waste Entry is locked to their own unit; the admin can file for any unit.
4. The admin configures the unit roster and assigns focal persons + emails under
   **Administration → Units & Focal Persons**. These units drive the registration
   dropdown, coordination, and reporting.

To reset all accounts, unit edits, and submitted waste streams back to seed data, clear
the site's `localStorage` (key `vsu-hazmat-app-v2`) in your browser dev tools.

> Note: the admin email is seeded as `lfgabuanda@vsu.edu.ph` (as you provided). If your
> actual address is spelled differently, change `ADMIN_EMAIL` in `src/store/app.tsx`.

## Primary focus: waste generation, disposal & AI recommendations

The dashboard centers on **what chemical and biological wastes each unit produces and how
they dispose of them** — not the chemical/biological inventory. For every waste stream the
app records the **generating activity** (e.g. "histology tissue fixation"), the unit's
**current disposal activity** (e.g. "spent formalin poured to drain"), and an
**AI recommendation** on whether it is handled properly.

Every recommendation cites **real international / national standards**, including WHO
Laboratory Biosafety Manual (4th ed.), CDC/NIH BMBL, WHO & DOH health-care-waste guidance,
OSHA (1910.1450 / 1910.1048 / 1910.1030), US EPA RCRA (40 CFR 261), NFPA 30 / 430, UN GHS,
Basel Convention, and Philippine RA 6969 / RA 9275 / RA 8749 and DENR DAO 2013-22. The
waste dataset lives in `src/data/index.ts` (`WASTE_STREAMS`, `WASTE_STANDARDS`,
`wasteStats`), so the Dashboard, Waste Register, AI Waste Assessment, and Consolidated
Report all stay consistent.

### Submitting waste entries (focal persons)

Focal persons submit waste streams directly on **New Waste Entry** (`/new`):

- Category (Chemical / Biological), waste name, and the **generating activity** that
  produces it.
- **Hazard characteristics** (e.g. carcinogen, heavy metals, halogenated; infectious,
  sharps, bloodborne, BSL-3) — these drive the AI's classification and recommendation.
- Volume, interim storage, **disposal method**, a description of the current disposal
  activity, treatment, and (for hauler consignment) hauler + manifest.

As the method is chosen, a **live AI panel** (`src/lib/wasteAdvisor.ts`) returns a verdict
(*Properly handled / Needs improvement / Improperly handled*), severity, concrete actions,
and cited standards. Submitting adds the stream to the store (persisted in `localStorage`)
and it immediately appears on the Dashboard, Waste Register, AI Waste Assessment, and
Report. Improper disposal is still recorded — and flagged for correction — so real (even
non-compliant) practice is captured honestly. The **Survey Instrument** preview mirrors
these exact fields.

## Screens

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| — | Sign in / Request account | `/login`, `/register` | Focal-person registration + admin login |
| — | Approvals *(admin)* | `/admin/approvals` | Approve/reject focal-person accounts |
| — | Units & Focal Persons *(admin)* | `/admin/units` | Configure units, assign focal persons + emails |
| 1 | Dashboard | `/` | Waste generated per unit, disposal handling status, AI recommendations |
| 2 | New Waste Entry | `/new` | Submit a waste stream; live AI disposal recommendation (showcase) |
| 3 | Waste Register | `/waste` | Wastes per unit, source & disposal activities, AI recommendations |
| 4 | AI Waste Assessment | `/assessment` | Per-unit waste-handling scores + recommendations vs. standards |
| 5 | Hazard Zone Map | `/map` | Schematic risk diagram of campus buildings |
| 6 | Survey Instrument | `/survey` | Mandate 1 — standardized waste questionnaire |
| 7 | Unit Coordination | `/coordination` | Mandate 2 — submission tracking |
| 8 | Corrective Actions | `/actions` | Mandate 6 — kanban of remediation tasks |
| 9 | Guidelines | `/guidelines` | Management & handling reference |
| 10 | Consolidated Report | `/report` | Mandate 8 — print-ready executive report |

## Project structure

```
src/
  data/
    types.ts        # typed models: Material, Unit, WasteStream, Assessment, Finding, Action
    knowledge.ts    # reference "AI brain" — substance identification KB
    index.ts        # all seed data + derived aggregations (single source of truth)
  lib/
    wasteAdvisor.ts # rule-based AI advisor: disposal method → recommendation + standards
  store/
    app.tsx         # auth + unit config + waste submissions (localStorage)
  components/
    Layout.tsx, Sidebar.tsx, TopBar.tsx, Toast.tsx, ui.tsx
  screens/          # the 10 screens + Auth, Approvals, UnitsAdmin
  index.css         # design tokens + component styles
  main.tsx          # router + providers (AppProvider → ToastProvider → Router)
```

## Key features

- **AI-assisted New Waste Entry** — as a focal person describes a waste stream and picks a
  disposal method, a live AI panel returns a verdict (*Properly handled / Needs improvement
  / Improperly handled*), severity, concrete actions, and cited standards, plus a submission
  checklist. Improper disposal is still recorded — and flagged for correction.
- **Standards-grounded recommendations** — every recommendation cites real standards (WHO,
  CDC/NIH BMBL, DOH, OSHA, US EPA RCRA, NFPA, Basel, and Philippine RA 6969 / 9275 / 8749 and
  DENR DAO 2013-22), computed in `src/lib/wasteAdvisor.ts`.
- **Consistent data** — dashboard KPIs, waste register, assessment scores, coordination
  units, actions, and the report all read from the same `src/data` module + store.
- **Print-ready report** — the Consolidated Report uses `window.print()` with print CSS
  that hides the app chrome and renders the paper document cleanly.

## Notes

- The demo's "today" is anchored to **2026-07-08** (`TODAY` in `src/data/index.ts`) so
  expiry semantics (expired / expiring-soon / valid) are deterministic.
- This is a front-end prototype: all "AI" behavior is a deterministic reference-base
  match, not a live model call.
