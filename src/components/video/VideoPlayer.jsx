import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Scissors,
  Video as VideoIcon,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { SEEK_STEP_SECONDS } from '../../config/constants.js'
import { formatTime } from '../../utils/time.js'

const PLAYBACK_RATES = [1, 0.5, 0.25]

/**
 * Reproductor HTML5 con controles propios.
 *
 * API expuesta mediante `ref`:
 *   - getCurrentTime()          -> segundos actuales
 *   - seek(seconds)
 *   - playSegment(start, end)   -> reproduce solo el intervalo y se detiene exactamente en `end`
 *   - pause()
 *
 * `segment` ({ start, end }) solo se usa para resaltar el intervalo en la barra de progreso.
 */
const VideoPlayer = forwardRef(function VideoPlayer({ src, segment, onLoadedMetadata, onError }, ref) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const segmentEndRef = useRef(null) // término del intervalo en reproducción (null = reproducción normal)
  const rafRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [segmentActive, setSegmentActive] = useState(false)

  // --- Control de intervalo ------------------------------------------------
  const stopSegmentWatch = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const endSegmentMode = useCallback(() => {
    segmentEndRef.current = null
    setSegmentActive(false)
    stopSegmentWatch()
  }, [stopSegmentWatch])

  /** Detiene el video si llegó al término del intervalo. Devuelve true si lo detuvo. */
  const stopIfSegmentEnded = useCallback(() => {
    const video = videoRef.current
    const end = segmentEndRef.current
    if (!video || end == null || video.currentTime < end) return false
    segmentEndRef.current = null // evita que el evento "pause" lo trate como pausa manual
    video.pause()
    video.currentTime = end
    setCurrentTime(end)
    setSegmentActive(false)
    return true
  }, [])

  // El término se revisa en cada cuadro (≈60 veces por segundo) para detenerse con precisión.
  // El navegador pausa requestAnimationFrame si la ventana no está visible, por eso el evento
  // "timeupdate" (más lento, pero siempre activo) también revisa el término como respaldo.
  const watchSegment = useCallback(() => {
    const video = videoRef.current
    if (!video || segmentEndRef.current == null) return
    if (stopIfSegmentEnded()) {
      rafRef.current = null
      return
    }
    setCurrentTime(video.currentTime)
    rafRef.current = requestAnimationFrame(watchSegment)
  }, [stopIfSegmentEnded])

  const handleTimeUpdate = () => {
    if (stopIfSegmentEnded()) {
      stopSegmentWatch()
      return
    }
    setCurrentTime(videoRef.current.currentTime)
  }

  useImperativeHandle(
    ref,
    () => ({
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      seek: (seconds) => {
        const video = videoRef.current
        if (!video) return
        endSegmentMode()
        video.currentTime = seconds
        setCurrentTime(seconds)
      },
      playSegment: async (start, end) => {
        const video = videoRef.current
        if (!video) return
        stopSegmentWatch()
        video.currentTime = start
        setCurrentTime(start)
        segmentEndRef.current = end
        setSegmentActive(true)
        try {
          await video.play()
          rafRef.current = requestAnimationFrame(watchSegment)
        } catch {
          endSegmentMode()
        }
      },
      pause: () => videoRef.current?.pause(),
    }),
    [endSegmentMode, stopSegmentWatch, watchSegment],
  )

  // Al cambiar de video se reinicia el estado del reproductor.
  // Si los metadatos ya estaban cargados, se conserva la duración real del elemento.
  useEffect(() => {
    const video = videoRef.current
    endSegmentMode()
    setPlaying(video ? !video.paused : false)
    setCurrentTime(video?.currentTime ?? 0)
    setDuration(video && video.readyState >= 1 && Number.isFinite(video.duration) ? video.duration : 0)
  }, [src, endSegmentMode])

  useEffect(() => stopSegmentWatch, [stopSegmentWatch])

  // Pantalla completa
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // --- Acciones ------------------------------------------------------------
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      endSegmentMode()
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const seekBy = (delta) => {
    const video = videoRef.current
    if (!video) return
    endSegmentMode()
    const t = Math.min(Math.max(0, video.currentTime + delta), duration || video.duration || 0)
    video.currentTime = t
    setCurrentTime(t)
  }

  const handleSeekInput = (e) => {
    const video = videoRef.current
    if (!video) return
    endSegmentMode()
    const t = Number(e.target.value)
    video.currentTime = t
    setCurrentTime(t)
  }

  const handleVolume = (e) => {
    const video = videoRef.current
    const v = Number(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    if (video) {
      video.volume = v
      video.muted = v === 0
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const next = !muted
    video.muted = next
    setMuted(next)
    if (!next && volume === 0) {
      video.volume = 0.5
      setVolume(0.5)
    }
  }

  const cycleRate = () => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length]
    setRate(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    }
  }

  const handleKeyDown = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.key.startsWith('Arrow')) return
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      seekBy(-SEEK_STEP_SECONDS)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      seekBy(SEEK_STEP_SECONDS)
    } else if (e.key === 'f') {
      toggleFullscreen()
    }
  }

  // --- Eventos del <video> ---------------------------------------------------
  const handleLoadedMetadata = () => {
    const video = videoRef.current
    const d = video.duration
    setDuration(Number.isFinite(d) ? d : 0)
    video.volume = volume
    video.muted = muted
    video.playbackRate = rate
    onLoadedMetadata?.(d)
  }

  const handlePause = () => {
    setPlaying(false)
    // Si el usuario pausa a mitad del intervalo, se sale del modo intervalo.
    if (segmentEndRef.current != null) endSegmentMode()
  }

  if (!src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-slate-800 text-center text-slate-300">
        <VideoIcon className="h-10 w-10 text-slate-500" />
        <p className="mt-3 font-medium">Aún no hay un video cargado</p>
        <p className="mt-1 text-sm text-slate-400">Selecciona un archivo en el paso 1 para ver la vista previa.</p>
      </div>
    )
  }

  const pct = (t) => (duration > 0 ? `${(Math.min(Math.max(t, 0), duration) / duration) * 100}%` : '0%')
  const showSegment = segment && segment.start != null && segment.end != null && segment.end > segment.start && duration > 0
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`group relative overflow-hidden bg-black outline-none focus-visible:ring-4 focus-visible:ring-brand/40 ${
        fullscreen ? 'flex h-screen w-screen flex-col' : 'rounded-xl'
      }`}
      aria-label="Reproductor de video"
    >
      <div className={`relative ${fullscreen ? 'min-h-0 flex-1' : 'aspect-video'} w-full`}>
        {/* object-contain mantiene la proporción original: no deforma ni recorta */}
        <video
          ref={videoRef}
          src={src}
          className="absolute inset-0 h-full w-full object-contain"
          preload="metadata"
          playsInline
          onClick={togglePlay}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={handlePause}
          onEnded={() => {
            setPlaying(false)
            endSegmentMode()
          }}
          onError={(e) => onError?.(e.currentTarget.error)}
        />

        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/70 backdrop-blur-sm transition-transform hover:scale-105"
            aria-label="Reproducir"
          >
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </button>
        )}

        {segmentActive && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow">
            <Scissors className="h-3.5 w-3.5" />
            Reproduciendo momento seleccionado
          </span>
        )}
      </div>

      {/* Controles */}
      <div className="bg-gradient-to-t from-black/95 to-black/80 px-3 pt-2 pb-2.5 text-white sm:px-4">
        {/* Barra de progreso con el intervalo seleccionado resaltado */}
        <div className="relative h-4" style={{ '--track-h': '16px' }}>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
            {showSegment && (
              <div
                className="absolute inset-y-0 bg-sky-300/60"
                style={{ left: pct(segment.start), width: `calc(${pct(segment.end)} - ${pct(segment.start)})` }}
              />
            )}
            <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: pct(currentTime) }} />
          </div>
          <input
            type="range"
            className="range absolute inset-0 h-4 w-full"
            min={0}
            max={duration || 0}
            step="any"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeekInput}
            aria-label="Barra de progreso"
            aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
          />
        </div>

        <div className="mt-1.5 flex items-center gap-1 sm:gap-2">
          <ControlButton label={`Retroceder ${SEEK_STEP_SECONDS} segundos`} onClick={() => seekBy(-SEEK_STEP_SECONDS)}>
            <RotateCcw className="h-5 w-5" />
          </ControlButton>
          <ControlButton label={playing ? 'Pausar' : 'Reproducir'} onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </ControlButton>
          <ControlButton label={`Avanzar ${SEEK_STEP_SECONDS} segundos`} onClick={() => seekBy(SEEK_STEP_SECONDS)}>
            <RotateCw className="h-5 w-5" />
          </ControlButton>

          <div className="group/vol ml-1 flex items-center">
            <ControlButton label={muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute}>
              <VolumeIcon className="h-5 w-5" />
            </ControlButton>
            <div className="relative h-4 w-16 sm:w-20" style={{ '--track-h': '16px' }}>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                <div className="h-full bg-white" style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
              </div>
              <input
                type="range"
                className="range absolute inset-0 h-4 w-full"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                aria-label="Volumen"
              />
            </div>
          </div>

          <span className="ml-2 font-mono text-xs tabular-nums sm:text-sm">
            {formatTime(currentTime)} <span className="text-white/50">/ {formatTime(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleRate}
              className="rounded-md px-2 py-1 font-mono text-xs font-semibold text-white/90 hover:bg-white/15"
              title="Velocidad de reproducción"
              aria-label={`Velocidad de reproducción: ${rate}x`}
            >
              {rate}x
            </button>
            <ControlButton label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  )
})

function ControlButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  )
}

export default VideoPlayer
