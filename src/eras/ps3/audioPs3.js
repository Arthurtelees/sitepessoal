import { agora, getCtx, getMaster, noiseBuffer, tone } from '../../lib/audio.js'

function sopro(dur, ganho, corte, q = 1) {
  const ctx = getCtx()
  const master = getMaster()
  if (!ctx || !master) return
  const t = agora()
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(dur)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(corte, t)
  bp.frequency.exponentialRampToValueAtTime(Math.max(90, corte * 0.28), t + dur)
  bp.Q.value = q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(ganho, t + dur * 0.22)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
  src.stop(t + dur + 0.02)
}

export function sfxXmbMove() {
  tone({ freq: 1560, type: 'sine', dur: 0.045, gain: 0.055 })
  tone({ freq: 2340, type: 'sine', dur: 0.03, gain: 0.022, delay: 0.008 })
}

export function sfxXmbCategoria() {
  tone({ freq: 880, type: 'sine', dur: 0.07, gain: 0.05 })
  tone({ freq: 1320, type: 'sine', dur: 0.09, gain: 0.03, delay: 0.02, send: 0.3 })
  sopro(0.14, 0.02, 2600)
}

export function sfxXmbEntra() {
  tone({ freq: 523.25, type: 'sine', dur: 0.16, gain: 0.08 })
  tone({ freq: 783.99, type: 'sine', dur: 0.22, gain: 0.055, delay: 0.05, send: 0.45 })
  tone({ freq: 1046.5, type: 'sine', dur: 0.3, gain: 0.035, delay: 0.1, send: 0.6 })
}

export function sfxXmbVolta() {
  tone({ freq: 660, type: 'sine', dur: 0.12, gain: 0.06, glide: 392 })
  sopro(0.16, 0.018, 1400)
}

export function sfxXmbLiga() {
  sopro(1.6, 0.03, 4200, 0.8)
  tone({ freq: 130.81, type: 'sine', dur: 1.5, gain: 0.07, send: 0.5 })
  tone({ freq: 261.63, type: 'sine', dur: 1.4, gain: 0.05, delay: 0.18, send: 0.6 })
  tone({ freq: 392, type: 'sine', dur: 1.5, gain: 0.038, delay: 0.36, send: 0.75 })
  tone({ freq: 523.25, type: 'sine', dur: 1.6, gain: 0.026, delay: 0.54, send: 0.85 })
}
