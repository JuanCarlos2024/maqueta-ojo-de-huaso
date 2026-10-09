import { formatTime } from '../../utils/time.js'

/**
 * Línea de tiempo del video completo con dos manillas (inicio y término).
 * Se construye con dos <input type="range"> superpuestos para mantener la accesibilidad del teclado.
 */
export default function IntervalTimeline({ duration, start, end, invalid, onChangeStart, onChangeEnd }) {
  const enabled = duration > 0
  const max = enabled ? duration : 1
  const startValue = clamp(start ?? 0, max)
  const endValue = clamp(end ?? max, max)
  const pct = (t) => `${(t / max) * 100}%`
  const hasBoth = start != null && end != null
  const left = Math.min(startValue, endValue)
  const right = Math.max(startValue, endValue)

  return (
    <div className={enabled ? '' : 'opacity-50'}>
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 font-mono text-[11px] text-slate-400">{formatTime(0, false)}</span>
        <div className="dual-range relative h-6 flex-1" style={{ '--track-h': '24px' }}>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200">
            {hasBoth && (
              <div
                className={`absolute inset-y-0 rounded-full ${invalid ? 'bg-red-400' : 'bg-brand'}`}
                style={{ left: pct(left), width: `calc(${pct(right)} - ${pct(left)})` }}
              />
            )}
          </div>
          <input
            type="range"
            className={`range absolute inset-0 h-6 w-full ${start == null ? 'unset' : ''}`}
            min={0}
            max={max}
            step={0.1}
            value={startValue}
            disabled={!enabled}
            onChange={(e) => onChangeStart(Number(e.target.value))}
            aria-label="Inicio del momento en la línea de tiempo"
            aria-valuetext={formatTime(startValue)}
          />
          <input
            type="range"
            className={`range absolute inset-0 h-6 w-full ${end == null ? 'unset' : ''}`}
            min={0}
            max={max}
            step={0.1}
            value={endValue}
            disabled={!enabled}
            onChange={(e) => onChangeEnd(Number(e.target.value))}
            aria-label="Término del momento en la línea de tiempo"
            aria-valuetext={formatTime(endValue)}
          />
        </div>
        <span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-400">
          {enabled ? formatTime(duration, false) : '--:--'}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> Video completo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand" /> Momento seleccionado
        </span>
      </div>
    </div>
  )
}

function clamp(value, max) {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), max)
}
