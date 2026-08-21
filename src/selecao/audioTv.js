import { agora, getCtx, getMaster, noiseBuffer, tone } from '../lib/audio.js'

function chuvisco(dur, ganho, corte) {
  const ctx = getCtx()
  const master = getMaster()
  if (!ctx || !master) return
  const t = agora()
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(dur)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = corte
  const g = ctx.createGain()
  g.gain.setValueAtTime(ganho, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(hp).connect(g).connect(master)
  src.start(t)
  src.stop(t + dur + 0.02)
}




export function sfxLigaHoje() {
  chuvisco(0.08, 0.018, 5400)
  tone({ freq: 300, type: 'sine', dur: 0.52, gain: 0.055, glide: 600 })
  tone({ freq: 600, type: 'sine', dur: 0.6, gain: 0.045, delay: 0.11, send: 0.45 })
  tone({ freq: 900, type: 'sine', dur: 0.72, gain: 0.03, delay: 0.23, send: 0.55 })
}

export function sfxRescan() {
  tone({ freq: 64, type: 'square', dur: 0.09, gain: 0.11 })
  chuvisco(0.3, 0.09, 850)
  tone({ freq: 3400, type: 'sine', dur: 0.4, gain: 0.038, glide: 880, delay: 0.04 })
}

export function sfxCorteHoje() {
  chuvisco(0.08, 0.026, 4400)
  tone({ freq: 840, type: 'sine', dur: 0.08, gain: 0.06 })
  tone({ freq: 1260, type: 'sine', dur: 0.14, gain: 0.045, delay: 0.045, send: 0.4 })
}

export function sfxAcende(tubo) {
  tone({ freq: 96, type: 'square', dur: 0.05, gain: 0.14 })
  tone({ freq: 52, type: 'square', dur: 0.09, gain: 0.1, delay: 0.05 })
  if (tubo) {
    chuvisco(0.34, 0.07, 900)
    tone({ freq: 4200, type: 'sine', dur: 0.5, gain: 0.04, glide: 1000, delay: 0.12 })
    tone({ freq: 15700, type: 'sine', dur: 0.8, gain: 0.014, delay: 0.4 })
  } else {
    chuvisco(0.1, 0.02, 5000)
    tone({ freq: 300, type: 'sine', dur: 0.5, gain: 0.05, glide: 600, delay: 0.1 })
    tone({ freq: 600, type: 'sine', dur: 0.6, gain: 0.035, delay: 0.24, send: 0.5 })
  }
}
