import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'info'
}

interface ToastCtx {
  toast: (message: string, tone?: 'success' | 'info') => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, tone: 'success' | 'info' = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id))

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            <span className="t-icon">
              {t.tone === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
            </span>
            <span className="grow">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              style={{ color: 'rgba(255,255,255,0.7)', display: 'grid', placeItems: 'center' }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
