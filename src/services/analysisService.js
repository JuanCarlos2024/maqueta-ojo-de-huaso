/**
 * Capa de servicios para el análisis de momentos.
 *
 * FASE 2: el módulo de inteligencia artificial está conectado al backend en Render.
 */
import { AI_MODULE_AVAILABLE, API_BASE_URL, API_KEY } from '../config/constants.js'

export class AiModuleUnavailableError extends Error {
  constructor() {
    super('El módulo de inteligencia artificial será incorporado en una próxima fase del proyecto.')
    this.name = 'AiModuleUnavailableError'
  }
}

/** Error al llamar al backend (red caída, servidor no responde, etc.). */
export class AnalysisRequestError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AnalysisRequestError'
  }
}

/** Datos mínimos que necesita el backend para analizar el momento. */
export function buildAnalysisRequest({ file, videoDuration, start, end }) {
  return {
    file, // el archivo real, lo necesitamos para subirlo
    videoName: file.name,
    videoSizeBytes: file.size,
    videoDurationSeconds: videoDuration,
    startSeconds: start,
    endSeconds: end,
    intervalSeconds: end - start,
  }
}

/**
 * Envía el video al backend y devuelve el resultado del análisis.
 *
 * Nota: el backend analiza el video completo y detecta el instante de la
 * atajada por su cuenta; todavía no usa startSeconds/endSeconds como filtro.
 */
export async function requestAnalysis(request) {
  if (!AI_MODULE_AVAILABLE) {
    throw new AiModuleUnavailableError()
  }

  const formData = new FormData()
  formData.append('video', request.file, request.videoName)

  let response
  try {
    response = await fetch(`${API_BASE_URL}/analizar?formato=resumen`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY },
      body: formData,
    })
  } catch {
    throw new AnalysisRequestError('No se pudo contactar al servidor de análisis. Revisa tu conexión e intenta de nuevo.')
  }

  if (!response.ok) {
    const detalle = await response.text().catch(() => '')
    throw new AnalysisRequestError(`El servidor respondió con un error (${response.status}). ${detalle}`)
  }

  return response.json()
}
