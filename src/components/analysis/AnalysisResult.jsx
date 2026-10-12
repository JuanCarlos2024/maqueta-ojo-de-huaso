import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

/** Resultado del análisis devuelto por el backend (formato "resumen"). */
export default function AnalysisResult({ result }) {
  if (!result) return null

  const {
    detectada,
    puntaje,
    nombre_atajada: nombreAtajada,
    momento_segundos: momentoSegundos,
    confianza_deteccion: confianzaDeteccion,
    confianza_tipo: confianzaTipo,
    justificacion,
    fundamento,
  } = result

  return (
    <Card
      title="Resultado del análisis"
      badge={
        <Badge variant={detectada ? 'success' : 'warning'}>{detectada ? 'Atajada detectada' : 'Sin detección'}</Badge>
      }
    >
      {detectada ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Puntaje recomendado</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">{puntaje ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Tipo de atajada</p>
              <p className="mt-1 text-lg font-bold text-navy">{nombreAtajada ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Momento detectado</p>
              <p className="mt-1 text-lg font-bold text-navy">
                {typeof momentoSegundos === 'number' ? `${momentoSegundos.toFixed(1)} s` : '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {typeof confianzaDeteccion === 'number' && (
              <Badge variant="neutral">Confianza detección: {(confianzaDeteccion * 100).toFixed(0)}%</Badge>
            )}
            {typeof confianzaTipo === 'number' && (
              <Badge variant="neutral">Confianza tipo: {(confianzaTipo * 100).toFixed(0)}%</Badge>
            )}
          </div>

          {(justificacion || fundamento) && (
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>{justificacion || fundamento}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{justificacion || fundamento || 'No se detectó una atajada en el video analizado.'}</p>
        </div>
      )}
    </Card>
  )
}
