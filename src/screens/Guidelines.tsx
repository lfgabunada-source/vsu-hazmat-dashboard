import { useRef, useState } from 'react'
import {
  FlaskConical,
  Dna,
  Trash2,
  CalendarX2,
  Database,
  ShieldCheck,
  BookOpen,
  Plus,
  Pencil,
  Save,
  X,
  Upload,
  FileText,
  Download,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '../store/app'
import { useToast } from '../components/Toast'

// icon keyword -> lucide icon + accent color
const ICONS: Record<string, { icon: LucideIcon; tone: string; label: string }> = {
  flask: { icon: FlaskConical, tone: 'var(--high)', label: 'Chemical' },
  bio: { icon: Dna, tone: 'var(--info)', label: 'Biological' },
  waste: { icon: Trash2, tone: 'var(--accent)', label: 'Waste' },
  calendar: { icon: CalendarX2, tone: 'var(--med)', label: 'Expiry' },
  data: { icon: Database, tone: 'var(--gold)', label: 'Data' },
  shield: { icon: ShieldCheck, tone: 'var(--accent)', label: 'Safety' },
  book: { icon: BookOpen, tone: 'var(--muted-2)', label: 'General' },
}
const iconMeta = (k: string) => ICONS[k] ?? ICONS.book

const fmtSize = (b?: number) =>
  !b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

interface Draft {
  title: string
  body: string
  icon: string
}
const emptyDraft: Draft = { title: '', body: '', icon: 'book' }

export default function Guidelines() {
  const { isAdmin, guidelines, guidelineDocs, saveGuideline, deleteGuideline, uploadGuidelineDoc, deleteGuidelineDoc, docUrl } =
    useApp()
  const { toast } = useToast()

  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [busy, setBusy] = useState(false)

  const [docTitle, setDocTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const startNew = () => {
    setDraft(emptyDraft)
    setEditing('new')
  }
  const startEdit = (id: string) => {
    const g = guidelines.find((x) => x.id === id)
    if (!g) return
    setDraft({ title: g.title, body: g.body, icon: g.icon })
    setEditing(id)
  }
  const save = async () => {
    if (!draft.title.trim()) {
      toast('Give the guideline a title.', 'info')
      return
    }
    setBusy(true)
    const res = await saveGuideline({
      id: editing === 'new' ? undefined : editing ?? undefined,
      title: draft.title.trim(),
      body: draft.body,
      icon: draft.icon,
    })
    setBusy(false)
    if (!res.ok) {
      toast(`Could not save: ${res.error}`, 'info')
      return
    }
    toast(editing === 'new' ? 'Guideline added.' : 'Guideline updated.')
    setEditing(null)
  }
  const remove = async (id: string, title: string) => {
    await deleteGuideline(id)
    toast(`Removed "${title}".`, 'info')
  }

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast('Choose a PDF file first.', 'info')
      return
    }
    setUploading(true)
    const res = await uploadGuidelineDoc(docTitle, file)
    setUploading(false)
    if (!res.ok) {
      toast(res.error, 'info')
      return
    }
    toast('Guideline document uploaded.')
    setDocTitle('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="stack">
      <div className="flex items-center justify-between wrap gap-3">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <p>
            Management and handling reference for the TWG and unit coordinators, aligned to
            international and Philippine regulatory standards.
            {isAdmin && ' As administrator, you can revise these guidelines and upload PDF references.'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={startNew}>
            <Plus size={16} /> Add guideline
          </button>
        )}
      </div>

      {/* Editor */}
      {isAdmin && editing !== null && (
        <div className="card card-pad">
          <div className="section-title">{editing === 'new' ? 'New guideline' : 'Edit guideline'}</div>
          <div className="stack" style={{ gap: 12 }}>
            <div className="form-grid" style={{ gap: 12 }}>
              <div className="field">
                <label>Title</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Chemical waste disposal" />
              </div>
              <div className="field">
                <label>Category / icon</label>
                <select value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
                  {Object.entries(ICONS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Guideline points <span className="muted" style={{ fontWeight: 400 }}>(one bullet per line)</span></label>
              <textarea
                rows={6}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder={'Use only DENR-accredited haulers; retain a manifest.\nSegregate waste by class.\nNever pour hazardous waste down drains.'}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                <Save size={15} /> {busy ? 'Saving…' : 'Save guideline'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guideline cards */}
      {guidelines.length === 0 ? (
        <div className="card card-pad muted" style={{ textAlign: 'center', padding: 32 }}>
          No guidelines yet.{isAdmin ? ' Click “Add guideline” to create one.' : ''}
        </div>
      ) : (
        <div className="grid grid-3">
          {guidelines.map((g) => {
            const meta = iconMeta(g.icon)
            const Icon = meta.icon
            const points = g.body.split('\n').map((s) => s.trim()).filter(Boolean)
            return (
              <div className="card guide-card" key={g.id}>
                <div className="g-icon" style={{ background: 'var(--card-2)', color: meta.tone, border: '1px solid var(--border)' }}>
                  <Icon size={20} />
                </div>
                <h3>{g.title}</h3>
                <ul>
                  {points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                {isAdmin && (
                  <div className="flex gap-2" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-ghost" style={{ height: 32 }} onClick={() => startEdit(g.id)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="icon-btn danger" onClick={() => remove(g.id, g.title)} aria-label={`Delete ${g.title}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* PDF documents */}
      <div className="card">
        <div className="card-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="var(--vsu-green)" /> Guideline documents (PDF)
          </h3>
          <span className="sub">{guidelineDocs.length} uploaded</span>
        </div>
        <div className="card-pad">
          {isAdmin && (
            <div className="doc-upload">
              <input
                className="doc-title-input"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document title (optional — defaults to file name)"
              />
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="doc-file-input" />
              <button className="btn btn-primary" onClick={onUpload} disabled={uploading} style={{ flexShrink: 0 }}>
                <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload PDF'}
              </button>
            </div>
          )}

          {guidelineDocs.length === 0 ? (
            <div className="muted" style={{ fontSize: 12.5, padding: isAdmin ? '14px 2px 2px' : 8 }}>
              No PDF guidelines uploaded yet.
            </div>
          ) : (
            <div className="doc-list">
              {guidelineDocs.map((d) => (
                <div className="doc-row" key={d.id}>
                  <span className="doc-ico">
                    <FileText size={16} />
                  </span>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="cell-main" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.title}
                    </div>
                    <div className="cell-sub">
                      PDF{d.sizeBytes ? ` · ${fmtSize(d.sizeBytes)}` : ''} ·{' '}
                      {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <a className="btn btn-ghost" style={{ height: 32 }} href={docUrl(d.filePath)} target="_blank" rel="noreferrer">
                    <Download size={14} /> View
                  </a>
                  {isAdmin && (
                    <button className="icon-btn danger" onClick={() => deleteGuidelineDoc(d)} aria-label={`Delete ${d.title}`}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
