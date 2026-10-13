import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { MAX_INTERVAL_SECONDS } from '../../config/constants.js'
import { formatBytes, formatDurationLabel, formatTime } from '../../utils/time.js'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

const STATUS = {
  'no-video': { label: 'Sin video', variant: 'neutral' },
  incomplete: { label: 'Incompleto', variant: 'neutral' },
  invalid: { label: 'Con errores', variant: 'error' },
  valid: { label: 'Intervalo válido', variant: 'success' },
}

/** 4. Resumen del análisis: información del video y del intervalo seleccionado. */
export default function AnalysisSummary({ file, duration, start, end, validation }) {
  const status = STATUS[validation.status]
  const showTime = (t) => (t == null || Number.isNaN(t) ? '—' : formatTime(t))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        title="Información del video"
        badge={file && duration ? <Badge variant="success">Video válido</Badge> : <Badge>Sin video</Badge>}
      >
        <SummaryList
          rows={[
            [
              'Nombre del video',
              file ? (
                <span className="block truncate" title={file.name}>
                  {file.name}
                </span>
              ) : (
                '—'
              ),
            ],
            ['Tamaño del archivo', file ? formatBytes(file.size) : '—'],
            ['Duración total', duration ? formatTime(duration) : '—'],
            ['Origen', file ? 'Archivo local(se guardara en la nube de la misma web)' : '—'],
          ]}
        />
      </Card>

      <Card title="Intervalo seleccionado" badge={<Badge variant={status.variant}>{status.label}</Badge>}>
        <SummaryList
          rows={[
            ['Tiempo de inicio', showTime(start)],
            ['Tiempo de término', showTime(end)],
            [
              'Duración seleccionada',
              validation.intervalDuration != null ? formatDurationLabel(validation.intervalDuration) : '—',
            ],
            ['Límite máximo permitido', `${MAX_INTERVAL_SECONDS} segundos`],
            ['Estado de validación', <span className={statusTextClass(validation.status)}>{status.label}</span>],
          ]}
        />
      </Card>
    </div>
  )
}

/** Banner de estado general (verde, rojo o informativo), según los mockups. */
export function ValidationBanner({ hasVideo, validation }) {
  if (validation.status === 'valid') {
    return (
      <Banner tone="success" icon={CheckCircle2} title="Todo listo para analizar">
        Video cargado correctamente. El momento seleccionado está listo para analizar.
      </Banner>
    )
  }
  if (validation.status === 'invalid') {
    return (
      <Banner tone="error" icon={AlertCircle} title="No se puede analizar el momento todavía">
        Corrige los errores indicados en el paso 3: {validation.errors[0]}
      </Banner>
    )
  }
  return (
    <Banner tone="info" icon={Info} title={hasVideo ? 'Selecciona el momento a analizar' : 'Carga un video para comenzar'}>
      {hasVideo
        ? 'Marca el tiempo de inicio y de término de la atajada (máximo 60 segundos).'
        : 'Selecciona o arrastra un archivo MP4 de la corrida en el paso 1.'}
    </Banner>
  )
}

const BANNER_TONES = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800 [&_svg]:text-emerald-600',
  error: 'border-red-200 bg-red-50 text-red-700 [&_svg]:text-red-600',
  info: 'border-brand/20 bg-brand-50 text-brand [&_svg]:text-brand',
}

function Banner({ tone, icon: Icon, title, children }) {
  return (
    <div role="status" className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${BANNER_TONES[tone]}`}>
      <Icon className="h-8 w-8 shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm opacity-90">{children}</p>
      </div>
    </div>
  )
}

function SummaryList({ rows }) {
  return (
    <dl className="divide-y divide-slate-100">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <dt className="shrink-0 text-slate-500">{label}</dt>
          <dd className="min-w-0 text-right font-semibold text-navy tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function statusTextClass(status) {
  if (status === 'valid') return 'text-emerald-600'
  if (status === 'invalid') return 'text-red-600'
  return 'text-slate-500'
}
