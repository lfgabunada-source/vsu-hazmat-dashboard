import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import {
  setUnits as syncUnits,
  setWasteStreams as syncWaste,
  type AcademicUnit,
  type UnitStatus,
  type WasteStream,
} from '../data'

// ============================================================
// App store backed by Supabase (Postgres + Auth).
// Auth = Supabase Auth; data = units / profiles / waste_streams tables.
// Row-Level Security (see supabase/schema.sql) governs what each role can do.
// Module registries (setUnits/setWasteStreams) stay synced so the non-hook
// resolvers (unitName, wasteStats) used across screens keep working.
// ============================================================

export type Role = 'admin' | 'focal'
export type AccountStatus = 'pending' | 'approved' | 'rejected'

export interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  unitId?: string
  status: AccountStatus
  requestedAt: string
}

export interface RegisterInput {
  name: string
  email: string
  unitId: string
  password: string
}
export type Result = { ok: true } | { ok: false; error: string }

export const ADMIN_EMAIL = 'lfgabuanda@vsu.edu.ph'
export const VSU_EMAIL_RE = /^[^\s@]+@([a-z0-9-]+\.)*vsu\.edu\.ph$/i
export const isVsuEmail = (e: string) => VSU_EMAIL_RE.test(e.trim())

const HANDLE_SCORE: Record<string, number> = {
  Compliant: 100,
  'Partially compliant': 60,
  'Non-compliant': 20,
}

// ---- DB row → app type mappers ----
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProfile(r: any): AppUser {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    unitId: r.unit_id ?? undefined,
    status: r.status,
    requestedAt: (r.created_at ?? '').slice(0, 10),
  }
}

function mapWaste(r: any): WasteStream {
  return {
    id: r.id,
    unitId: r.unit_id,
    category: r.category,
    name: r.name,
    sourceActivity: r.source_activity,
    hazardClass: r.hazard_class,
    hazardCode: r.hazard_code,
    physicalState: r.physical_state,
    volumePerMonth: r.volume_per_month,
    storage: r.storage,
    disposalActivity: r.disposal_activity,
    method: r.method,
    treatment: r.treatment,
    hauler: r.hauler,
    manifest: r.manifest,
    status: r.status,
    ai: r.ai,
  }
}

// Units table holds the roster; the coordination fields (item count, progress,
// status, compliance score) are DERIVED from each unit's waste submissions.
function deriveUnits(rows: any[], waste: WasteStream[]): AcademicUnit[] {
  return rows.map((r) => {
    const streams = waste.filter((w) => w.unitId === r.id)
    const score = streams.length
      ? Math.round(streams.reduce((a, w) => a + (HANDLE_SCORE[w.status] ?? 0), 0) / streams.length)
      : 0
    const status: UnitStatus = streams.length ? 'Submitted' : 'Not started'
    return {
      id: r.id,
      name: r.name,
      short: r.short,
      building: r.building ?? '—',
      coordinator: r.coordinator ?? '—',
      focalEmail: r.focal_email ?? '',
      itemCount: streams.length,
      progress: streams.length ? 100 : 0,
      deadline: r.deadline ?? '2026-07-31',
      status,
      complianceScore: score,
    }
  })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function authErr(msg?: string): string {
  const m = (msg ?? '').toLowerCase()
  if (m.includes('invalid login')) return 'Incorrect email or password.'
  if (m.includes('email not confirmed'))
    return 'Email not yet confirmed. Please contact the administrator.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'An account with this email already exists.'
  return msg || 'Something went wrong. Please try again.'
}

interface AppCtx {
  users: AppUser[]
  units: AcademicUnit[]
  wasteStreams: WasteStream[]
  session: AppUser | null
  isAdmin: boolean
  initializing: boolean
  pendingCount: number
  login: (email: string, password: string) => Promise<Result>
  logout: () => Promise<void>
  register: (input: RegisterInput) => Promise<Result>
  approve: (userId: string) => Promise<void>
  reject: (userId: string) => Promise<void>
  addUnit: (u: Partial<AcademicUnit>) => Promise<void>
  updateUnit: (id: string, patch: Partial<AcademicUnit>) => Promise<void>
  removeUnit: (id: string) => Promise<Result>
  addWasteStream: (w: WasteStream) => Promise<Result>
}

const Ctx = createContext<AppCtx | null>(null)
export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [users, setUsers] = useState<AppUser[]>([])
  const [unitRows, setUnitRows] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [wasteStreams, setWaste] = useState<WasteStream[]>([])
  const [initializing, setInitializing] = useState(true)

  // Derive units from roster + waste, and keep module registries in sync so
  // non-hook resolvers (unitName / wasteStats) used by screens read fresh data.
  const units = useMemo(() => deriveUnits(unitRows, wasteStreams), [unitRows, wasteStreams])
  syncUnits(units)
  syncWaste(wasteStreams)

  // ---- data fetchers ----
  const fetchProfile = useCallback(async (id: string): Promise<AppUser | null> => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    return data ? mapProfile(data) : null
  }, [])

  const loadData = useCallback(async (isAdmin: boolean) => {
    const [unitsRes, wasteRes] = await Promise.all([
      supabase.from('units').select('*').order('name'),
      supabase.from('waste_streams').select('*').order('created_at', { ascending: false }),
    ])
    setUnitRows(unitsRes.data ?? [])
    setWaste((wasteRes.data ?? []).map(mapWaste))
    if (isAdmin) {
      const { data } = await supabase.from('profiles').select('*').order('created_at')
      setUsers((data ?? []).map(mapProfile))
    }
  }, [])

  // Resolve a Supabase session into app state (profile + data).
  const applySession = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setProfile(null)
        setUsers([])
        setUnitRows([])
        setWaste([])
        setInitializing(false)
        return
      }
      const prof = await fetchProfile(userId)
      // Only admin or approved focal may enter the app.
      if (!prof || (prof.role !== 'admin' && prof.status !== 'approved')) {
        await supabase.auth.signOut()
        setProfile(null)
        setInitializing(false)
        return
      }
      setProfile(prof)
      setUsers([prof])
      await loadData(prof.role === 'admin')
      setInitializing(false)
    },
    [fetchProfile, loadData],
  )

  useEffect(() => {
    let active = true
    // Units roster is public — load it up front so the (logged-out) registration
    // page can list units even before there's a session.
    supabase
      .from('units')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (active && data) setUnitRows(data)
      })
    supabase.auth.getSession().then(({ data }) => {
      if (active) applySession(data.session?.user.id ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer to avoid re-entrancy issues inside the auth callback.
      setTimeout(() => {
        if (active) applySession(session?.user.id ?? null)
      }, 0)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [applySession])

  // ---- auth ----
  const login = useCallback(async (email: string, password: string): Promise<Result> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error || !data.user) return { ok: false, error: authErr(error?.message) }
    const prof = await fetchProfile(data.user.id)
    if (!prof) {
      await supabase.auth.signOut()
      return { ok: false, error: 'No profile found for this account.' }
    }
    if (prof.role !== 'admin' && prof.status !== 'approved') {
      await supabase.auth.signOut()
      return {
        ok: false,
        error:
          prof.status === 'pending'
            ? 'Your account is still pending admin approval.'
            : 'Your registration was not approved. Please contact the administrator.',
      }
    }
    // applySession (via onAuthStateChange) will populate state.
    return { ok: true }
  }, [fetchProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const register = useCallback(async (input: RegisterInput): Promise<Result> => {
    const name = input.name.trim()
    const email = input.email.trim()
    if (!name || !email || !input.unitId || !input.password)
      return { ok: false, error: 'All fields are required.' }
    if (!isVsuEmail(email))
      return { ok: false, error: 'Please use your official @vsu.edu.ph email address.' }
    if (input.password.length < 6)
      return { ok: false, error: 'Password must be at least 6 characters.' }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: { data: { name, unit_id: input.unitId } },
    })
    if (error) return { ok: false, error: authErr(error.message) }
    // If email confirmation is off, signUp auto-signs-in; sign out so the
    // account stays "pending" until an admin approves it.
    if (data.session) await supabase.auth.signOut()
    return { ok: true }
  }, [])

  // ---- admin: approvals ----
  const setStatus = useCallback(
    async (userId: string, status: AccountStatus) => {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
      if (!error) setUsers((us) => us.map((u) => (u.id === userId ? { ...u, status } : u)))
    },
    [],
  )
  const approve = useCallback((id: string) => setStatus(id, 'approved'), [setStatus])
  const reject = useCallback((id: string) => setStatus(id, 'rejected'), [setStatus])

  // ---- admin: units ----
  const refreshUnits = useCallback(async () => {
    const { data } = await supabase.from('units').select('*').order('name')
    setUnitRows(data ?? [])
  }, [])

  const addUnit = useCallback(
    async (u: Partial<AcademicUnit>) => {
      const base = (u.short ?? u.name ?? 'unit')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      let id = base || `unit-${Date.now()}`
      if (unitRows.some((x) => x.id === id)) id = `${id}-${Date.now().toString().slice(-4)}`
      const { error } = await supabase.from('units').insert({
        id,
        name: u.name ?? 'New academic unit',
        short: u.short ?? u.name ?? 'New unit',
        building: u.building ?? '—',
        coordinator: u.coordinator ?? '—',
        focal_email: u.focalEmail ?? null,
        deadline: u.deadline ?? '2026-07-31',
      })
      if (!error) await refreshUnits()
    },
    [unitRows, refreshUnits],
  )

  const updateUnit = useCallback(
    async (id: string, patch: Partial<AcademicUnit>) => {
      const row: Record<string, unknown> = {}
      if (patch.name !== undefined) row.name = patch.name
      if (patch.short !== undefined) row.short = patch.short
      if (patch.building !== undefined) row.building = patch.building
      if (patch.coordinator !== undefined) row.coordinator = patch.coordinator
      if (patch.focalEmail !== undefined) row.focal_email = patch.focalEmail || null
      if (patch.deadline !== undefined) row.deadline = patch.deadline
      const { error } = await supabase.from('units').update(row).eq('id', id)
      if (!error) await refreshUnits()
    },
    [refreshUnits],
  )

  const removeUnit = useCallback(
    async (id: string): Promise<Result> => {
      if (users.some((u) => u.unitId === id && u.status !== 'rejected'))
        return {
          ok: false,
          error: 'Cannot remove a unit that still has an assigned focal person.',
        }
      const { error } = await supabase.from('units').delete().eq('id', id)
      if (error) return { ok: false, error: error.message }
      await refreshUnits()
      return { ok: true }
    },
    [users, refreshUnits],
  )

  // ---- waste submission ----
  const addWasteStream = useCallback(
    async (w: WasteStream): Promise<Result> => {
      const { data, error } = await supabase
        .from('waste_streams')
        .insert({
          unit_id: w.unitId,
          category: w.category,
          name: w.name,
          source_activity: w.sourceActivity,
          hazard_class: w.hazardClass,
          hazard_code: w.hazardCode,
          physical_state: w.physicalState,
          volume_per_month: w.volumePerMonth,
          storage: w.storage,
          disposal_activity: w.disposalActivity,
          method: w.method,
          treatment: w.treatment,
          hauler: w.hauler,
          manifest: w.manifest,
          status: w.status,
          ai: w.ai,
          created_by: profile?.id ?? null,
        })
        .select('*')
        .single()
      if (error) return { ok: false, error: error.message }
      setWaste((ws) => [mapWaste(data), ...ws])
      return { ok: true }
    },
    [profile],
  )

  const value: AppCtx = {
    users,
    units,
    wasteStreams,
    session: profile,
    isAdmin: profile?.role === 'admin',
    initializing,
    pendingCount: users.filter((u) => u.status === 'pending').length,
    login,
    logout,
    register,
    approve,
    reject,
    addUnit,
    updateUnit,
    removeUnit,
    addWasteStream,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
