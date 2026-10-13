import { AlertCircle, CheckCircle2, Image as ImageIcon, Video } from 'lucide-react'
import { useRef, useState } from 'react'
import { historialImagenUrl, historialVideoUrl } from '../../services/analysisService.js'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

/** Color del número de puntaje según su valor (de un vistazo, sin leer el texto). */
const scoreColor = (puntaje) => {
  if (puntaje >= 4) return 'text-emerald-600'
  if (puntaje === 3) return 'text-blue-600'
  if (puntaje === 2) return 'text-amber-600'
  return 'text-slate-400'
}

/** Resultado del análisis devuelto por el backend (formato "resumen"). */
export default function AnalysisResult({ result }) {
  const videoRef = useRef(null)
  const [vista, setVista] = useState(null) // null | 'video' | 'imagen'
  const [camaraLenta, setCamaraLenta] = useState(true)

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
    historial_id: historialId,
  } = result

  const toggleVelocidad = () => {
    const nuevaLenta = !camaraLenta
    setCamaraLenta(nuevaLenta)
    if (videoRef.current) videoRef.current.playbackRate = nuevaLenta ? 0.5 : 1
  }

  return (
    <Card
      title="Resultado del análisis"
      className="animate-fade-in-up"
      badge={
        <Badge variant={detectada ? 'success' : 'warning'}>{detectada ? 'Atajada detectada' : 'Sin detección'}</Badge>
      }
    >
      {detectada ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Puntaje recomendado</p>
              <p className={`mt-1 text-2xl font-extrabold ${scoreColor(puntaje)}`}>{puntaje ?? '—'}</p>
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

          {historialId != null && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVista(vista === 'video' ? null : 'video')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    vista === 'video'
                      ? 'border-brand bg-brand-50 text-brand-600'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <Video className="h-4 w-4" />
                  Ver repetición en cámara lenta
                </button>
                <button
                  type="button"
                  onClick={() => setVista(vista === 'imagen' ? null : 'imagen')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    vista === 'imagen'
                      ? 'border-brand bg-brand-50 text-brand-600'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Ver imagen del momento
                </button>
              </div>

              {vista === 'video' && (
                <div className="space-y-2">
                  <video
                    ref={videoRef}
                    key={historialId}
                    src={historialVideoUrl(historialId)}
                    controls
                    autoPlay
                    className="w-full rounded-xl bg-black"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = camaraLenta ? 0.5 : 1
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleVelocidad}
                    className="text-sm font-semibold text-brand hover:text-brand-600"
                  >
                    Velocidad: {camaraLenta ? '0.5x (cámara lenta)' : '1x (normal)'} — cambiar
                  </button>
                </div>
              )}

              {vista === 'imagen' && (
                <img
                  src={historialImagenUrl(historialId)}
                  alt="Momento de la atajada"
                  className="w-full rounded-xl bg-slate-100"
                />
              )}
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
