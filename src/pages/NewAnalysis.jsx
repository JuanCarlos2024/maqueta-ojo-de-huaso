import { ArrowLeft, ArrowRight, Lightbulb, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AiModuleNotice from '../components/analysis/AiModuleNotice.jsx'
import AnalysisResult from '../components/analysis/AnalysisResult.jsx'
import AnalysisSummary, { ValidationBanner } from '../components/analysis/AnalysisSummary.jsx'
import TimeSelector from '../components/analysis/TimeSelector.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import VideoPlayer from '../components/video/VideoPlayer.jsx'
import VideoUploader from '../components/video/VideoUploader.jsx'
import { useVideoFile } from '../hooks/useVideoFile.js'
import {
  AiModuleUnavailableError,
  AnalysisRequestError,
  buildAnalysisRequest,
  requestAnalysis,
} from '../services/analysisService.js'
import { formatTime, parseTime } from '../utils/time.js'
import { validateInterval } from '../utils/validation.js'

/** Texto del campo -> segundos (null si está vacío, NaN si el formato no es válido). */
const toSeconds = (text) => {
  if (text.trim() === '') return null
  const value = parseTime(text)
  return value === null ? NaN : value
}

export default function NewAnalysis() {
  const navigate = useNavigate()
  const playerRef = useRef(null)
  const video = useVideoFile()

  const [startText, setStartText] = useState('')
  const [endText, setEndText] = useState('')
  const [pendingRequest, setPendingRequest] = useState(null)

  // Estado del análisis contra el backend: 'idle' | 'loading' | 'success' | 'error'.
  const [analysisStatus, setAnalysisStatus] = useState('idle')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')

  const start = toSeconds(startText)
  const end = toSeconds(endText)
  const validation = useMemo(
    () => validateInterval({ start, end, duration: video.duration }),
    [start, end, video.duration],
  )
  const isValid = validation.status === 'valid'
  const isAnalyzing = analysisStatus === 'loading'

  // Evita que el navegador abra el video (y salga de la app) si se suelta fuera de la zona de carga.
  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  const handleSelectFile = (file) => {
    if (video.selectFile(file)) {
      setStartText('')
      setEndText('')
      setAnalysisStatus('idle')
      setAnalysisResult(null)
      setAnalysisError('')
    }
  }

  const markCurrent = (setter) => () => {
    const t = playerRef.current?.getCurrentTime()
    if (t != null) setter(formatTime(t))
  }

  const handlePlaySegment = () => {
    if (isValid) playerRef.current?.playSegment(start, end)
  }

  const handleAnalyze = async () => {
    if (!isValid || isAnalyzing) return
    playerRef.current?.pause()
    const request = buildAnalysisRequest({ file: video.file, videoDuration: video.duration, start, end })

    setAnalysisStatus('loading')
    setAnalysisError('')
    setAnalysisResult(null)

    try {
      const result = await requestAnalysis(request)
      setAnalysisResult(result)
      setAnalysisStatus('success')
    } catch (err) {
      if (err instanceof AiModuleUnavailableError) {
        setPendingRequest(request)
        setAnalysisStatus('idle')
      } else if (err instanceof AnalysisRequestError) {
        setAnalysisError(err.message)
        setAnalysisStatus('error')
      } else {
        setAnalysisError('Ocurrió un error inesperado al analizar el video.')
        setAnalysisStatus('error')
        throw err
      }
    }
  }

  const closeNotice = useCallback(() => setPendingRequest(null), [])

  return (
    <>
      <PageHeader
        title="Nuevo análisis"
        subtitle="Carga el video de la corrida y define el momento específico que deseas analizar."
      />

      <div className="space-y-6">
        <VideoUploader
          file={video.file}
          duration={video.duration}
          error={video.error}
          onSelect={handleSelectFile}
          onDismissError={video.clearError}
        />

        <div className="grid gap-6 xl:grid-cols-12">
          <Card title="2. Vista previa del video" className="xl:col-span-7">
            <VideoPlayer
              ref={playerRef}
              src={video.url}
              segment={isValid ? { start, end } : null}
              onLoadedMetadata={video.handleLoadedMetadata}
              onError={video.handleMediaError}
            />
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Lightbulb className="h-4 w-4 shrink-0" />
              Usa los controles del video (o las teclas espacio, ← y →) para ubicar el momento que deseas analizar.
            </p>
          </Card>

          <div className="xl:col-span-5">
            <TimeSelector
              duration={video.duration ?? 0}
              startText={startText}
              endText={endText}
              start={start}
              end={end}
              validation={validation}
              onStartTextChange={setStartText}
              onEndTextChange={setEndText}
              onMarkStart={markCurrent(setStartText)}
              onMarkEnd={markCurrent(setEndText)}
              onPlaySegment={handlePlaySegment}
            />
          </div>
        </div>

        <section aria-labelledby="summary-title" className="space-y-4">
          <h2 id="summary-title" className="text-lg font-bold text-navy">
            4. Resumen del análisis
          </h2>
          <AnalysisSummary file={video.file} duration={video.duration} start={start} end={end} validation={validation} />
          <ValidationBanner hasVideo={Boolean(video.duration)} validation={validation} />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!isValid || isAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isAnalyzing ? (
              <>
                <span className="text-lg animate-bounce" role="img" aria-label="Analizando">
                  🐂
                </span>
                Analizando la atajada…
              </>
            ) : (
              <>
                Analizar momento
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>

        {analysisStatus === 'error' && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-bold">No se pudo completar el análisis</p>
            <p className="mt-1">{analysisError}</p>
          </div>
        )}

        {analysisResult && <AnalysisResult result={analysisResult} />}
      </div>

      {pendingRequest && <AiModuleNotice request={pendingRequest} onClose={closeNotice} />}
    </>
  )
}
