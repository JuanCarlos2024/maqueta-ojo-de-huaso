import { AlertCircle, CalendarClock, Loader2, Trash2, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import {
  AnalysisRequestError,
  eliminarHistorial,
  fetchHistorial,
  historialImagenUrl,
  historialVideoUrl,
} from '../services/analysisService.js'

/** Color del número de puntaje según su valor (consistente con AnalysisResult). */
const scoreColor = (puntaje) => {
  if (puntaje == null) return 'text-slate-400'
  if (puntaje >= 4) return 'text-emerald-600'
  if (puntaje === 3) return 'text-blue-600'
  if (puntaje === 2) return 'text-amber-600'
  return 'text-slate-400'
}

/** Fecha ISO del backend -> texto legible en español. */
const formatFecha = (isoText) => {
  const fecha = new Date(isoText)
  if (Number.isNaN(fecha.getTime())) return isoText
  return fecha.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function SavedAnalyses() {
  const [estado, setEstado] = useState('loading') // 'loading' | 'success' | 'error'
  const [registros, setRegistros] = useState([])
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(null) // id del registro cuyo video se está mostrando
  const [eliminandoId, setEliminandoId] = useState(null)

  useEffect(() => {
    let cancelado = false
    setEstado('loading')
    fetchHistorial(50)
      .then((data) => {
        if (cancelado) return
        setRegistros(data)
        setEstado('success')
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof AnalysisRequestError ? err.message : 'Ocurrió un error inesperado al cargar el historial.')
        setEstado('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este análisis? Esta acción no se puede deshacer.')) return
    setEliminandoId(id)
    try {
      await eliminarHistorial(id)
      setRegistros((prev) => prev.filter((r) => r.id !== id))
      if (abierto === id) setAbierto(null)
    } catch (err) {
      window.alert(err instanceof AnalysisRequestError ? err.message : 'No se pudo eliminar el análisis.')
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Análisis guardados"
        subtitle="Historial de todos los videos analizados, con su puntaje y la posibilidad de volver a verlos."
      />

      {estado === 'loading' && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando historial…
        </div>
      )}

      {estado === 'error' && (
        <div role="alert" className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {estado === 'success' && registros.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          <CalendarClock className="h-8 w-8 text-slate-300" />
          <p className="font-semibold text-navy">Todavía no hay análisis guardados.</p>
          <p className="max-w-sm text-sm">Cuando analices un video desde "Nuevo análisis", va a aparecer aquí.</p>
        </div>
      )}

      {estado === 'success' && registros.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {registros.map((registro) => {
            const detectada = Boolean(registro.detectada)
            const mostrandoVideo = abierto === registro.id
            const eliminando = eliminandoId === registro.id

            return (
              <Card
                key={registro.id}
                badge={<Badge variant={detectada ? 'success' : 'warning'}>{detectada ? 'Detectada' : 'Sin detección'}</Badge>}
              >
                <div className="space-y-3">
                  <div className="aspect-video overflow-hidden rounded-xl bg-slate-100">
                    {mostrandoVideo ? (
                      <video
                        src={historialVideoUrl(registro.id)}
                        controls
                        autoPlay
                        className="h-full w-full bg-black object-contain"
                      />
                    ) : detectada ? (
                      <button
                        type="button"
                        onClick={() => setAbierto(registro.id)}
                        className="group relative h-full w-full"
                      >
                        <img
                          src={historialImagenUrl(registro.id)}
                          alt={`Momento de la atajada: ${registro.nombre_atajada ?? ''}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-navy/0 transition-colors group-hover:bg-navy/40">
                          <Video className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Video className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="truncate text-sm font-semibold text-navy" title={registro.nombre_video}>
                      {registro.nombre_video || 'Video sin nombre'}
                    </p>
                    <p className="text-xs text-slate-400">{formatFecha(registro.fecha)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {detectada ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span>
                          <span className="text-xs font-semibold text-slate-500">Puntaje </span>
                          <span className={`font-extrabold ${scoreColor(registro.puntaje)}`}>{registro.puntaje ?? '—'}</span>
                        </span>
                        <span className="truncate text-xs font-semibold text-slate-500">{registro.nombre_atajada}</span>
                      </div>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
