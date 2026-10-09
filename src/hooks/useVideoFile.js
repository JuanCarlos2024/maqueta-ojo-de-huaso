import { useCallback, useEffect, useState } from 'react'
import { validateVideoFile } from '../utils/validation.js'

const MEDIA_ERRORS = {
  1: 'La carga del video fue interrumpida.',
  2: 'Ocurrió un error de lectura al cargar el video.',
  3: 'El video está dañado o usa un códec que el navegador no puede decodificar.',
  4: 'El formato o códec del video no es compatible con este navegador. Prueba con un MP4 (H.264) o usa Chrome / Edge.',
}

/**
 * Administra el video seleccionado por el usuario.
 * El archivo se abre con `URL.createObjectURL`: se reproduce directamente desde el computador
 * y NUNCA se envía a un servidor.
 */
export function useVideoFile() {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState(null)
  const [duration, setDuration] = useState(null)
  const [error, setError] = useState(null)

  // Libera la memoria del video anterior cuando cambia o al salir de la pantalla.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  const selectFile = useCallback((newFile) => {
    const probe = document.createElement('video')
    const result = validateVideoFile(newFile, (type) => probe.canPlayType(type))
    if (!result.valid) {
      setError(result.error)
      return false
    }
    setError(null)
    setDuration(null)
    setFile(newFile)
    setUrl(URL.createObjectURL(newFile))
    return true
  }, [])

  /** Se llama cuando el elemento <video> obtiene los metadatos. */
  const handleLoadedMetadata = useCallback((seconds) => {
    setDuration(Number.isFinite(seconds) && seconds > 0 ? seconds : null)
  }, [])

  /** Se llama cuando el elemento <video> no puede reproducir el archivo. */
  const handleMediaError = useCallback(
    (mediaError) => {
      setError(
        `No se pudo reproducir "${file?.name ?? 'el video'}". ${MEDIA_ERRORS[mediaError?.code] ?? 'Error desconocido al cargar el video.'}`,
      )
      setFile(null)
      setUrl(null)
      setDuration(null)
    },
    [file],
  )

  const clearError = useCallback(() => setError(null), [])

  return { file, url, duration, error, selectFile, handleLoadedMetadata, handleMediaError, clearError }
}
