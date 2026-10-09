import { AlertTriangle, Check, X } from 'lucide-react'

const VARIANTS = {
  success: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: Check },
  error: { className: 'bg-red-50 text-red-600 ring-red-200', icon: X },
  warning: { className: 'bg-amber-50 text-amber-700 ring-amber-200', icon: AlertTriangle },
  neutral: { className: 'bg-slate-100 text-slate-500 ring-slate-200', icon: null },
}

export default function Badge({ variant = 'neutral', children }) {
  const { className, icon: Icon } = VARIANTS[variant]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={3} />}
      {children}
    </span>
  )
}
