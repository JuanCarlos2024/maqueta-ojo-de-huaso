import { describe, expect, it } from 'vitest'
import { formatBytes, formatTime, parseTime } from './time.js'

describe('formatTime', () => {
  it('formatea minutos, segundos y décimas', () => {
    expect(formatTime(0)).toBe('00:00.0')
    expect(formatTime(75.44)).toBe('01:15.4')
    expect(formatTime(3725, false)).toBe('1:02:05')
  })

  it('redondea sin producir 60 segundos', () => {
    expect(formatTime(59.96)).toBe('01:00.0')
  })

  it('maneja valores inválidos', () => {
    expect(formatTime(NaN)).toBe('--:--.-')
    expect(formatTime(Infinity, false)).toBe('--:--')
  })
})

describe('parseTime', () => {
  it('acepta segundos y mm:ss', () => {
    expect(parseTime('75')).toBe(75)
    expect(parseTime('75,5')).toBe(75.5)
    expect(parseTime('1:15')).toBe(75)
    expect(parseTime('01:15.5')).toBe(75.5)
    expect(parseTime('1:02:05')).toBe(3725)
  })

  it('devuelve null para textos vacíos o inválidos', () => {
    expect(parseTime('')).toBeNull()
    expect(parseTime('abc')).toBeNull()
    expect(parseTime('1:75')).toBeNull()
    expect(parseTime('1.5:10')).toBeNull()
  })

  it('conserva el signo negativo para que la validación lo informe', () => {
    expect(parseTime('-3')).toBe(-3)
  })

  it('es inverso de formatTime', () => {
    expect(parseTime(formatTime(83.7))).toBeCloseTo(83.7)
  })
})

describe('formatBytes', () => {
  it('usa la unidad adecuada', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(1536)).toBe('1.50 KB')
    expect(formatBytes(250 * 1024 * 1024)).toBe('250.0 MB')
  })
})
