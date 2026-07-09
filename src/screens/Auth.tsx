import { useMemo, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, LogIn, UserPlus, AlertTriangle, CheckCircle2, Mail } from 'lucide-react'
import { useApp, isVsuEmail, ADMIN_EMAIL } from '../store/app'
import BrandMark from '../components/BrandMark'

type Mode = 'login' | 'register'

export default function Auth({ initialMode = 'login' }: { initialMode?: Mode }) {
  const { session, initializing, units, login, register } = useApp()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [busy, setBusy] = useState(false)

  // login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // register state
  const [rName, setRName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rUnit, setRUnit] = useState('')
  const [rPass, setRPass] = useState('')
  const [rConfirm, setRConfirm] = useState('')
  const [rError, setRError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = useMemo(() => !rEmail || isVsuEmail(rEmail), [rEmail])

  if (initializing) return <div className="app-loading"><div className="app-loading-mark"><BrandMark size={28} /></div><span>Loading…</span></div>
  if (session) return <Navigate to="/" replace />

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await login(email, password)
    setBusy(false)
    if (!res.ok) setError(res.error)
  }

  const onRegister = async (e: FormEvent) => {
    e.preventDefault()
    setRError('')
    if (rPass !== rConfirm) {
      setRError('Passwords do not match.')
      return
    }
    setBusy(true)
    const res = await register({ name: rName, email: rEmail, unitId: rUnit, password: rPass })
    setBusy(false)
    if (!res.ok) {
      setRError(res.error)
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand header */}
        <div className="auth-brand">
          <div className="brand-mark" style={{ width: 46, height: 46 }}>
            <BrandMark size={27} />
          </div>
          <div>
            <b>VSU HazMat</b>
            <span>Lab Safety Registry</span>
          </div>
        </div>
        <p className="auth-lede">
          University-wide inventory & profiling of hazardous laboratory materials.
          Focal persons sign in to submit their unit's data; the University Safety Officer
          approves accounts and manages units.
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setSubmitted(false)
            }}
          >
            <LogIn size={15} /> Sign in
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            <UserPlus size={15} /> Request account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin} className="auth-form">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vsu.edu.ph"
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="auth-alert err">
                <AlertTriangle size={15} /> {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', height: 44 }}>
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="auth-demo">
              <div className="auth-demo-title">First-time setup</div>
              <div>
                Admin (<span className="mono">{ADMIN_EMAIL}</span>): use <b>Request account</b>
                once, then run the one-line “promote to admin” SQL from{' '}
                <span className="mono">supabase/schema.sql</span>.
              </div>
              <div>Focal persons: request an account, then wait for admin approval.</div>
            </div>
          </form>
        ) : submitted ? (
          <div className="auth-success">
            <span className="auth-success-icon">
              <CheckCircle2 size={30} />
            </span>
            <h3>Request submitted</h3>
            <p>
              Your account request has been sent to the University Safety Officer for
              approval. You'll be able to sign in and submit entries once it's approved.
            </p>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setMode('login')
                setSubmitted(false)
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={onRegister} className="auth-form">
            <div className="field">
              <label>Full name & designation</label>
              <input
                value={rName}
                onChange={(e) => setRName(e.target.value)}
                placeholder="e.g. Dr. J. Ferrer"
                required
              />
            </div>
            <div className="field">
              <label>Academic unit</label>
              <select value={rUnit} onChange={(e) => setRUnit(e.target.value)} required>
                <option value="">Select your unit…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.short} — {u.building}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Official email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 11, top: 12, color: 'var(--muted)' }} />
                <input
                  type="email"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  placeholder="you@vsu.edu.ph"
                  style={{ paddingLeft: 34, borderColor: emailValid ? undefined : 'var(--high)' }}
                  required
                />
              </div>
              {!emailValid && (
                <span style={{ fontSize: 11.5, color: 'var(--high)' }}>
                  Must be an official @vsu.edu.ph address.
                </span>
              )}
            </div>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={rPass}
                  onChange={(e) => setRPass(e.target.value)}
                  placeholder="min. 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={rConfirm}
                  onChange={(e) => setRConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            {rError && (
              <div className="auth-alert err">
                <AlertTriangle size={15} /> {rError}
              </div>
            )}
            <div className="auth-alert info">
              <ShieldCheck size={15} /> New accounts require admin approval before entries can be added.
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 44 }}
              disabled={!emailValid || busy}
            >
              <UserPlus size={16} /> {busy ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
