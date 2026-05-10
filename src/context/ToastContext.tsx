// src/context/ToastContext.tsx
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastCtx {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
  warning: <AlertTriangle size={16} />,
}

const COLORS: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  error:   { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
  info:    { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  warning: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }])
    if (duration > 0) setTimeout(() => remove(id), duration)
  }, [remove])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg: string) => toast(msg, 'error', 5000), [toast])
  const info    = useCallback((msg: string) => toast(msg, 'info'), [toast])
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(var(--sp-6) + 64px)',
        right: 'var(--sp-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        pointerEvents: 'none',
      }}>
        <AnimatePresence initial={false}>
          {toasts.map(t => {
            const c = COLORS[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                style={{
                  pointerEvents: 'all',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-3)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: c.bg,
                  color: c.color,
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                  fontSize: 14,
                  fontWeight: 500,
                  maxWidth: 360,
                  minWidth: 220,
                }}
              >
                {ICONS[t.type]}
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 2, display: 'flex' }}
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
