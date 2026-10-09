import { Clock, Flag, FlagTriangleRight, Info, PlayCircle } from 'lucide-react'
import { MAX_INTERVAL_SECONDS } from '../../config/constants.js'
import { formatDurationLabel, formatTime } from '../../utils/time.js'
import Card from '../ui/Card.jsx'
import IntervalTimeline from './IntervalTimeline.jsx'

/**
 * 3. Seleccionar momento a analizar.
 * Los campos de texto son la fuente de verdad; `start` y `end` son sus valores ya interpretados
 * (null = vacío, NaN = formato inválido).
 */
export default function TimeSelector({
  duration,
  startText,
  endText,
  start,
  end,
  validation,
  onStartTextChange,
  onEndTextChange,
  onMarkStart,
  onMarkEnd,
  onPlaySegment,
}) {
  const hasVideo = duration > 0
  const isValid = validation.status === 'valid'
  const isInvalid = validation.status === 'invalid'

  return (
    <Card title="3. Seleccionar momento a analizar" className="flex h-full flex-col">
      <div className="flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand-50 p-3.5 text-sm text-brand">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Define el inicio y término del momento específico de la corrida. Puedes escribir el tiempo (mm:ss o segundos) o
          capturarlo desde el reproductor. El intervalo máximo permitido es de {MAX_INTERVAL_SECONDS} segundos.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TimeField
          id="start-time"
          label="Tiempo de inicio"
          value={startText}
          onChange={onStartTextChange}
          disabled={!hasVideo}
          invalid={isInvalid && start != null && (Number.isNaN(start) || start < 0 || start > duration)}
          buttonLabel="Marcar inicio"
          buttonIcon={Flag}
          onMark={onMarkStart}
        />
        <TimeField
          id="end-time"
          label="Tiempo de término"
          value={endText}
          onChange={onEndTextChange}
          disabled={!hasVideo}
          invalid={
            isInvalid &&
            end != null &&
            (Number.isNaN(end) ||
              end < 0 ||
              end > duration ||
              (start != null && !Number.isNaN(start) && (end <= start || end - start > MAX_INTERVAL_SECONDS)))
          }
          buttonLabel="Marcar término"
          buttonIcon={FlagTriangleRight}
          onMark={onMarkEnd}
        />
      </div>

      <div
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ${
          isInvalid ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'
        }`}
      >
        <Clock className="h-4 w-4 shrink-0" />
        Duración seleccionada:
        <strong className="font-semibold text-navy tabular-nums">
          {validation.intervalDuration != null ? formatDurationLabel(validation.intervalDuration) : '—'}
        </strong>
        <span className="text-slate-400">/ máx. {MAX_INTERVAL_SECONDS} s</span>
      </div>

      <div className="mt-5">
        <IntervalTimeline
          duration={duration}
          start={Number.isNaN(start) ? null : start}
          end={Number.isNaN(end) ? null : end}
          invalid={isInvalid}
          onChangeStart={(t) => onStartTextChange(formatTime(t))}
          onChangeEnd={(t) => onEndTextChange(formatTime(t))}
        />
      </div>

      {isInvalid && (
        <ul role="alert" className="mt-4 space-y-1 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          {validation.errors.map((err) => (
            <li key={err} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {err}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onPlaySegment}
          disabled={!isValid}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand bg-white px-4 py-2.5 font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <PlayCircle className="h-5 w-5" />
          Reproducir momento seleccionado
        </button>
      </div>
    </Card>
  )
}

function TimeField({ id, label, value, onChange, disabled, invalid, buttonLabel, buttonIcon: Icon, onMark }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder="mm:ss.s"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={invalid}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 font-mono text-navy tabular-nums transition-colors outline-none placeholder:text-slate-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          invalid ? 'border-red-400 focus:ring-red-100' : 'border-slate-300 focus:border-brand focus:ring-brand/15'
        }`}
      />
      <button
        type="button"
        onClick={onMark}
        disabled={disabled}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        title="Captura el tiempo actual del reproductor"
      >
        <Icon className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  )
}
