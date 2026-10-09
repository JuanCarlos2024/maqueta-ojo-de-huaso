// Utilidades para mostrar e interpretar tiempos de video.

const pad = (n) => String(n).padStart(2, '0')

/**
 * Convierte segundos a texto legible.
 * - formatTime(75.4)        -> "01:15.4"
 * - formatTime(3725, false) -> "1:02:05"
 */
export function formatTime(seconds, withTenths = true) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return withTenths ? '--:--.-' : '--:--'
  }
  // Se trabaja en décimas para evitar casos como 59.96 -> "00:60.0".
  const totalTenths = withTenths ? Math.round(seconds * 10) : Math.floor(seconds) * 10
  const h = Math.floor(totalTenths / 36000)
  const m = Math.floor((totalTenths % 36000) / 600)
  const s = Math.floor((totalTenths % 600) / 10)
  const tenths = totalTenths % 10

  const base = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  return withTenths ? `${base}.${tenths}` : base
}

/**
 * Interpreta un tiempo escrito por el usuario. Acepta:
 * "75", "75.5", "75,5", "1:15", "01:15.5", "1:02:05".
 * Devuelve el valor en segundos, o `null` si el texto no es válido.
 * Los negativos se devuelven tal cual para que la validación pueda informarlos.
 */
export function parseTime(text) {
  if (text == null) return null
  let value = String(text).trim().replace(',', '.')
  if (value === '') return null

  let sign = 1
  if (value.startsWith('-')) {
    sign = -1
    value = value.slice(1).trim()
  }

  const parts = value.split(':')
  if (parts.length > 3) return null

  // Solo la última parte puede tener decimales; minutos y segundos deben ser < 60 si hay unidad superior.
  const numberPattern = /^\d+(\.\d+)?$/
  const integerPattern = /^\d+$/
  for (let i = 0; i < parts.length; i++) {
    const pattern = i === parts.length - 1 ? numberPattern : integerPattern
    if (!pattern.test(parts[i])) return null
  }

  const nums = parts.map(Number)
  if (nums.length >= 2 && nums[nums.length - 1] >= 60) return null
  if (nums.length === 3 && nums[1] >= 60) return null

  const seconds = nums.reduce((acc, n) => acc * 60 + n, 0)
  return sign * seconds
}

/** Formatea un tamaño en bytes: 1536 -> "1.5 KB". */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[unit]}`
}

/** Duración en texto amigable: 12.3 -> "12.3 s", 75 -> "1 min 15.0 s". */
export function formatDurationLabel(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return '—'
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return `${m} min ${s.toFixed(1)} s`
}
