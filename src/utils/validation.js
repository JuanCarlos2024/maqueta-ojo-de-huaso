// Validaciones del archivo de video y del intervalo seleccionado.
import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_INTERVAL_SECONDS } from '../config/constants.js'
import { formatTime } from './time.js'

/**
 * Valida el archivo antes de intentar reproducirlo.
 * `canPlayType` es opcional (se inyecta desde el navegador) para poder probar esta función sin DOM.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateVideoFile(file, canPlayType) {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo.' }
  }

  const name = file.name ?? ''
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : ''
  const type = (file.type ?? '').toLowerCase()

  const extensionOk = ACCEPTED_EXTENSIONS.includes(extension)
  const typeOk = type === '' || ACCEPTED_MIME_TYPES.includes(type)

  if (!extensionOk || !typeOk) {
    return {
      valid: false,
      error: `"${name}" no es un video compatible. Selecciona un archivo MP4 (también se aceptan ${ACCEPTED_EXTENSIONS.filter((e) => e !== '.mp4').join(', ')}).`,
    }
  }

  if (file.size === 0) {
    return { valid: false, error: `El archivo "${name}" está vacío.` }
  }

  if (canPlayType && type && canPlayType(type) === '') {
    return {
      valid: false,
      error: `Este navegador no puede reproducir archivos del tipo ${type}. Prueba con un MP4 (H.264) o usa Chrome / Edge.`,
    }
  }

  return { valid: true }
}

/**
 * Valida el intervalo [start, end] respecto a la duración del video.
 * Estados posibles:
 * - "no-video":   aún no hay video cargado.
 * - "incomplete": falta el inicio o el término.
 * - "invalid":    hay al menos un error (ver `errors`).
 * - "valid":      el intervalo está listo para analizar.
 * @returns {{ status: string, errors: string[], intervalDuration: number|null }}
 */
export function validateInterval({ start, end, duration }) {
  const hasVideo = Number.isFinite(duration) && duration > 0
  if (!hasVideo) {
    return { status: 'no-video', errors: [], intervalDuration: null }
  }

  const errors = []
  const hasStart = start != null
  const hasEnd = end != null

  if (hasStart && Number.isNaN(start)) errors.push('El tiempo de inicio no tiene un formato válido. Usa mm:ss (ej. 01:15.5) o segundos.')
  if (hasEnd && Number.isNaN(end)) errors.push('El tiempo de término no tiene un formato válido. Usa mm:ss (ej. 01:20) o segundos.')
  if (errors.length) return { status: 'invalid', errors, intervalDuration: null }

  if (hasStart && start < 0) errors.push('El tiempo de inicio no puede ser negativo.')
  if (hasStart && start > duration) errors.push(`El tiempo de inicio supera la duración del video (${formatTime(duration)}).`)
  if (hasEnd && end > duration) errors.push(`El tiempo de término no puede superar la duración del video (${formatTime(duration)}).`)
  if (hasEnd && end < 0) errors.push('El tiempo de término no puede ser negativo.')

  if (!hasStart || !hasEnd) {
    return { status: errors.length ? 'invalid' : 'incomplete', errors, intervalDuration: null }
  }

  const intervalDuration = end - start
  if (intervalDuration <= 0) {
    errors.push('El tiempo de término debe ser posterior al tiempo de inicio.')
  } else if (intervalDuration > MAX_INTERVAL_SECONDS + 1e-6) {
    errors.push(`El intervalo seleccionado dura ${intervalDuration.toFixed(1)} s y no puede superar ${MAX_INTERVAL_SECONDS} segundos.`)
  }

  return {
    status: errors.length ? 'invalid' : 'valid',
    errors,
    intervalDuration: intervalDuration > 0 ? intervalDuration : null,
  }
}
