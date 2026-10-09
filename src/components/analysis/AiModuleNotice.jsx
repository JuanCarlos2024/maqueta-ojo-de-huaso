import { BrainCircuit, X } from 'lucide-react'
import { useEffect } from 'react'
import { formatDurationLabel, formatTime } from '../../utils/time.js'

/**
 * Aviso que se muestra al presionar "Analizar momento" en la Fase 1.
 * No genera puntajes ni resultados: solo informa que el módulo de IA llegará en una próxima fase.
 */
export default function AiModuleNotice({ request, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-notice-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <BrainCircuit className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h2 id="ai-notice-title" className="text-lg font-bold text-navy">
              Módulo de inteligencia artificial en desarrollo
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              El análisis automático de atajadas será incorporado en una próxima fase del proyecto. En esta versión no se
              generan puntajes, detecciones ni resultados de inteligencia artificial.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-navy">Momento preparado para el futuro análisis</p>
          <dl className="mt-2 grid grid-cols-2 gap-y-1 text-slate-600">
            <dt>Video</dt>
            <dd className="truncate text-right font-medium text-navy" title={request.videoName}>
              {request.videoName}
            </dd>
            <dt>Intervalo</dt>
            <dd className="text-right font-medium text-navy tabular-nums">
              {formatTime(request.startSeconds)} – {formatTime(request.endSeconds)}
            </dd>
            <dt>Duración</dt>
            <dd className="text-right font-medium text-navy">{formatDurationLabel(request.intervalSeconds)}</dd>
          </dl>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
