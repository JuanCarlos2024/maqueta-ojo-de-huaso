// Parámetros generales de la aplicación (Fase 1).

/** Duración máxima permitida para el intervalo a analizar, en segundos. */
export const MAX_INTERVAL_SECONDS = 60

/** Salto de los botones de avance / retroceso del reproductor, en segundos. */
export const SEEK_STEP_SECONDS = 5


/** Extensiones de video aceptadas. MP4 es el formato principal del proyecto. */
export const ACCEPTED_EXTENSIONS = ['.mp4', '.m4v', '.webm', '.mov']

/** Tipos MIME aceptados (algunos sistemas no informan el tipo, por eso también se revisa la extensión). */
export const ACCEPTED_MIME_TYPES = ['video/mp4', 'video/x-m4v', 'video/webm', 'video/quicktime']

/** URL base de la API de análisis (desplegada en Render). */
export const API_BASE_URL = 'https://model-ojo-huaso-production.up.railway.app'

/** Clave de autenticación de la API (ver Environment Variables en Render). */
export const API_KEY = '43e5bee6b4e5c990330005dd02629012'

/**
 * Indica si el módulo de inteligencia artificial está conectado.
 * En la Fase 1 es `false`: el botón "Analizar momento" solo informa que el módulo llegará más adelante.
 */
export const AI_MODULE_AVAILABLE = true
