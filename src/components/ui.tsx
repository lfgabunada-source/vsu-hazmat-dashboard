import type { ReactNode } from 'react'
import {
  Flame,
  Droplets,
  Skull,
  HeartPulse,
  Zap,
  AlertTriangle,
  Leaf,
} from 'lucide-react'
import type { RiskLevel, Severity } from '../data'

// ---- Risk dot ----
export function RiskDot({ level }: { level: RiskLevel }) {
  const cls = level === 'High' ? 'high' : level === 'Medium' ? 'med' : 'low'
  return <span className={`dot ${cls}`} aria-label={`${level} risk`} />
}

// ---- Generic pill ----
export function Pill({
  tone,
  children,
}: {
  tone: 'high' | 'med' | 'low' | 'info' | 'neutral' | 'dark'
  children: ReactNode
}) {
  return <span className={`pill ${tone}`}>{children}</span>
}

// ---- Status → pill tone maps ----
export function riskTone(level: RiskLevel): 'high' | 'med' | 'low' {
  return level === 'High' ? 'high' : level === 'Medium' ? 'med' : 'low'
}

export function statusTone(
  status: string,
): 'high' | 'med' | 'low' | 'info' | 'neutral' {
  switch (status) {
    case 'Compliant':
    case 'Validated':
    case 'Disposed':
      return 'low'
    case 'Non-compliant':
    case 'Expired':
    case 'Unmanaged':
      return 'high'
    case 'Under review':
    case 'In progress':
    case 'Awaiting pickup':
    case 'Scheduled':
    case 'Partially compliant':
      return 'med'
    case 'Submitted':
      return 'info'
    case 'Not started':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function severityTone(
  s: Severity,
): 'high' | 'med' | 'low' | 'info' | 'neutral' {
  switch (s) {
    case 'CRITICAL':
    case 'HIGH':
      return 'high'
    case 'MEDIUM':
      return 'med'
    case 'LOW':
      return 'info'
    case 'OK':
      return 'low'
  }
}

// ---- KPI card ----
export function KpiCard({
  icon,
  value,
  label,
  tone,
  trend,
}: {
  icon: ReactNode
  value: ReactNode
  label: string
  tone: 'high' | 'med' | 'low' | 'info'
  trend?: string
}) {
  const tint: Record<string, string> = {
    high: 'var(--high-tint)',
    med: 'var(--med-tint)',
    low: 'var(--low-tint)',
    info: 'var(--info-tint)',
  }
  const col: Record<string, string> = {
    high: 'var(--high)',
    med: 'var(--med)',
    low: 'var(--low)',
    info: 'var(--info)',
  }
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <span className="kpi-icon" style={{ background: tint[tone], color: col[tone] }}>
          {icon}
        </span>
        {trend && (
          <span className="kpi-trend" style={{ color: 'var(--muted)' }}>
            {trend}
          </span>
        )}
      </div>
      <span className="kpi-val">{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  )
}

// ---- Score ring (SVG donut) ----
export function ScoreRing({
  score,
  size = 148,
}: {
  score: number
  size?: number
}) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score))
  const offset = c - (pct / 100) * c
  const color =
    pct >= 85
      ? 'var(--low)'
      : pct >= 70
        ? 'var(--info)'
        : pct >= 55
          ? 'var(--med)'
          : 'var(--high)'
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-val" style={{ color }}>
          {score}
        </span>
        <span className="ring-sub">/ 100</span>
      </div>
    </div>
  )
}

// ---- GHS pictogram diamond ----
const GHS_ICON: Record<string, ReactNode> = {
  flammable: <Flame size={17} />,
  corrosive: <Droplets size={17} />,
  toxic: <Skull size={17} />,
  'health-hazard': <HeartPulse size={17} />,
  oxidizer: <Zap size={17} />,
  irritant: <AlertTriangle size={16} />,
  environment: <Leaf size={16} />,
}
const GHS_LABEL: Record<string, string> = {
  flammable: 'Flammable',
  corrosive: 'Corrosive',
  toxic: 'Toxic',
  'health-hazard': 'Health',
  oxidizer: 'Oxidizer',
  irritant: 'Irritant',
  environment: 'Environ.',
}

export function GhsDiamond({ hazard }: { hazard: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="ghs">
        <span className="diamond" />
        <span className="glyph">{GHS_ICON[hazard] ?? <AlertTriangle size={16} />}</span>
      </div>
      <span className="ghs-label">{GHS_LABEL[hazard] ?? hazard}</span>
    </div>
  )
}
