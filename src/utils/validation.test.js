import { describe, expect, it } from 'vitest'
import { validateInterval, validateVideoFile } from './validation.js'

describe('validateVideoFile', () => {
  it('acepta un MP4', () => {
    expect(validateVideoFile({ name: 'corrida.MP4', type: 'video/mp4', size: 1000 }).valid).toBe(true)
  })

  it('acepta un MP4 sin tipo MIME informado', () => {
    expect(validateVideoFile({ name: 'corrida.mp4', type: '', size: 1000 }).valid).toBe(true)
  })

  it('rechaza archivos que no son video', () => {
    const r = validateVideoFile({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 })
    expect(r.valid).toBe(false)
    expect(r.error).toMatch(/no es un video compatible/)
  })

  it('rechaza archivos vacíos', () => {
    expect(validateVideoFile({ name: 'a.mp4', type: 'video/mp4', size: 0 }).valid).toBe(false)
  })

  it('rechaza tipos que el navegador no puede reproducir', () => {
    const r = validateVideoFile({ name: 'a.mov', type: 'video/quicktime', size: 10 }, () => '')
    expect(r.valid).toBe(false)
  })
})

describe('validateInterval', () => {
  const duration = 120

  it('sin video', () => {
    expect(validateInterval({ start: 1, end: 2, duration: 0 }).status).toBe('no-video')
  })

  it('incompleto', () => {
    expect(validateInterval({ start: 10, end: null, duration }).status).toBe('incomplete')
  })

  it('intervalo válido', () => {
    const r = validateInterval({ start: 10, end: 25.5, duration })
    expect(r.status).toBe('valid')
    expect(r.intervalDuration).toBeCloseTo(15.5)
  })

  it('inicio negativo', () => {
    const r = validateInterval({ start: -1, end: 5, duration })
    expect(r.status).toBe('invalid')
    expect(r.errors.join()).toMatch(/negativo/)
  })

  it('término anterior o igual al inicio', () => {
    expect(validateInterval({ start: 20, end: 20, duration }).errors.join()).toMatch(/posterior/)
    expect(validateInterval({ start: 20, end: 10, duration }).status).toBe('invalid')
  })

  it('término mayor a la duración', () => {
    expect(validateInterval({ start: 100, end: 130, duration }).errors.join()).toMatch(/duración del video/)
  })

  it('intervalo mayor a 60 segundos', () => {
    expect(validateInterval({ start: 0, end: 60, duration }).status).toBe('valid')
    const r = validateInterval({ start: 0, end: 61, duration })
    expect(r.status).toBe('invalid')
    expect(r.errors.join()).toMatch(/60 segundos/)
  })

  it('formato no válido', () => {
    expect(validateInterval({ start: NaN, end: 10, duration }).status).toBe('invalid')
  })
})
