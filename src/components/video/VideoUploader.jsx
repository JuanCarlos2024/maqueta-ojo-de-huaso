import { AlertCircle, FileVideo, Lock, RefreshCw, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES } from '../../config/constants.js'
import { formatBytes, formatTime } from '../../utils/time.js'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

const ACCEPT = [...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(',')

export default function VideoUploader({ file, duration, error, onSelect, onDismissError }) {
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => inputRef.current?.click()

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) onSelect(selected)
    e.target.value = '' // permite volver a elegir el mismo archivo
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragDepth.current++
    setDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const files = e.dataTransfer?.files
    if (!files?.length) return
    onSelect(files[0])
  }

  const dropHandlers = {
    onDragEnter: handleDragEnter,
    onDragOver: (e) => e.preventDefault(),
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  }

  return (
    <Card
      title="1. Cargar video de la corrida"
      badge={file && <Badge variant={duration ? 'success' : 'neutral'}>{duration ? 'Video válido' : 'Leyendo…'}</Badge>}
    >
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleInputChange} data-testid="video-input" />

      {!file ? (
        <div
          {...dropHandlers}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? 'border-brand bg-brand-50' : 'border-slate-300 bg-slate-50/60'
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand">
            <Upload className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold text-navy">
            {dragging ? 'Suelta el video aquí' : 'Arrastra y suelta el video de la corrida aquí'}
          </p>
          <p className="mt-1 text-sm text-slate-500">o</p>
          <button
            type="button"
            onClick={openPicker}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none"
          >
            <FileVideo className="h-5 w-5" />
            Seleccionar video
          </button>
          <p className="mt-4 text-xs text-slate-500">Formato recomendado: MP4 (también WEBM, M4V y MOV si el navegador los soporta)</p>
        </div>
      ) : (
        <div
          {...dropHandlers}
          className={`flex flex-wrap items-center gap-4 rounded-xl border p-4 transition-colors ${
            dragging ? 'border-brand bg-brand-50' : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <FileVideo className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-navy" title={file.name}>
              {file.name}
            </p>
            <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <div className="flex gap-1">
                <dt>Tamaño:</dt>
                <dd className="font-medium text-slate-700">{formatBytes(file.size)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Duración:</dt>
                <dd className="font-medium text-slate-700">{duration ? formatTime(duration) : 'Calculando…'}</dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
          >
            <RefreshCw className="h-4 w-4" />
            Cambiar video
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">No se pudo cargar el video</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button type="button" onClick={onDismissError} className="rounded p-1 hover:bg-red-100" aria-label="Cerrar aviso">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        El video se reproduce localmente en tu navegador; no se envía a ningún servidor.
      </p>
    </Card>
  )
}
