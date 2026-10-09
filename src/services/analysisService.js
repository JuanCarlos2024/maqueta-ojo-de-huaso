/**
 * Capa de servicios para el análisis de momentos.
 *
 * FASE 1: el módulo de inteligencia artificial NO está conectado.
 * Este archivo define el punto de integración con el futuro backend en Python:
 *   - `buildAnalysisRequest` arma los datos del momento seleccionado.
 *   - `requestAnalysis` será el que envíe el fragmento al backend y reciba el resultado
 *     (tipo de atajada, puntaje recomendado 0/2/3/4, faltas, % de confianza).
 *
 * Mientras `AI_MODULE_AVAILABLE` sea `false`, no se genera ni se simula ningún resultado.
 */
import { AI_MODULE_AVAILABLE } from '../config/constants.js'

export class AiModuleUnavailableError extends Error {
  constructor() {
    super('El módulo de inteligencia artificial será incorporado en una próxima fase del proyecto.')
    this.name = 'AiModuleUnavailableError'
  }
}

/** Datos mínimos que necesitará el backend para analizar el momento. */
export function buildAnalysisRequest({ file, videoDuration, start, end }) {
  return {
    videoName: file.name,
    videoSizeBytes: file.size,
    videoDurationSeconds: videoDuration,
    startSeconds: start,
    endSeconds: end,
    intervalSeconds: end - start,
  }
}

/**
 * Solicita el análisis del momento.
 * TODO (Fase 2): enviar el fragmento al backend en Python, por ejemplo:
 *   POST /api/analisis  (multipart: video o fragmento + startSeconds + endSeconds)
 */
// eslint-disable-next-line no-unused-vars
export async function requestAnalysis(request) {
  if (!AI_MODULE_AVAILABLE) {
    throw new AiModuleUnavailableError()
  }
  throw new Error('Integración con el backend pendiente.')
}
