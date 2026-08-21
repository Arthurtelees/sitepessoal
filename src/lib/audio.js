let ctx = null
let master = null
let muted = false

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)
  return ctx
}

export function toggleMute() {
  muted = !muted
  if (master) master.gain.value = muted ? 0 : 0.5
  return muted
}

export function isMuted() {
  return muted
}

function now() {
  return ctx ? ctx.currentTime : 0
}

export const getCtx = () => ctx
export const getMaster = () => master
export const agora = now

const amostras = new Map()

export function carregarAmostra(nome, url) {
  if (!ctx || amostras.has(nome)) return
  amostras.set(nome, null)
  fetch(url)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .then((buffer) => amostras.set(nome, buffer))
    .catch(() => amostras.delete(nome))
}

export function tocarAmostra(nome, ganho = 1) {
  const buffer = amostras.get(nome)
  if (!ctx || !buffer) return false
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const g = ctx.createGain()
  g.gain.value = ganho
  src.connect(g).connect(master)
  src.start()
  return true
}

let reverb = null
function getReverb() {
  if (!ctx) return null
  if (reverb) return reverb
  const len = Math.floor(ctx.sampleRate * 1.6)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  const wet = ctx.createGain()
  wet.gain.value = 0.28
  conv.connect(wet).connect(master)
  reverb = conv
  return reverb
}

export function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

export function tone({ freq = 440, type = 'square', dur = 0.08, gain = 0.2, glide = null, delay = 0, send = 0 }) {
  if (!ctx) return
  const t = now() + delay
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  if (send > 0) {
    const s = ctx.createGain()
    s.gain.value = send
    g.connect(s).connect(getReverb())
  }
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export function sfxMove() {
  tone({ freq: 1180, type: 'square', dur: 0.045, gain: 0.09 })
}

export function sfxConfirm() {
  tone({ freq: 660, type: 'square', dur: 0.05, gain: 0.11 })
  tone({ freq: 1320, type: 'square', dur: 0.09, gain: 0.09, delay: 0.045 })
}

export function sfxCancel() {
  tone({ freq: 320, type: 'square', dur: 0.09, gain: 0.1, glide: 180 })
}

export function sfxDeny() {
  tone({ freq: 200, type: 'sawtooth', dur: 0.16, gain: 0.1, glide: 110 })
}

export function sfxPickup() {
  tone({ freq: 880, type: 'triangle', dur: 0.09, gain: 0.12 })
  tone({ freq: 1320, type: 'triangle', dur: 0.12, gain: 0.1, delay: 0.07 })
  tone({ freq: 1760, type: 'triangle', dur: 0.18, gain: 0.08, delay: 0.15, send: 0.5 })
}

export function sfxType() {
  if (!ctx) return
  const t = now()
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(0.03)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2600 + Math.random() * 900
  bp.Q.value = 6
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.06, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
}

export function sfxSave() {
  if (!ctx) return
  for (let i = 0; i < 7; i++) {
    setTimeout(sfxType, i * 70)
  }
  setTimeout(() => {
    tone({ freq: 2100, type: 'sine', dur: 0.5, gain: 0.12, send: 0.7 })
  }, 560)
}

export function sfxDoor() {
  if (!ctx) return
  const t = now()

  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(1.5)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 22
  bp.frequency.setValueAtTime(320, t)
  bp.frequency.exponentialRampToValueAtTime(1500, t + 0.9)
  bp.frequency.exponentialRampToValueAtTime(700, t + 1.35)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.13, t + 0.25)
  g.gain.setValueAtTime(0.13, t + 0.9)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
  const send = ctx.createGain()
  send.gain.value = 0.6
  src.connect(bp).connect(g).connect(master)
  g.connect(send).connect(getReverb())
  src.start(t)
  src.stop(t + 1.5)

  tone({ freq: 90, type: 'sine', dur: 0.5, gain: 0.3, glide: 42, delay: 1.15, send: 0.5 })
  const thud = ctx.createBufferSource()
  thud.buffer = noiseBuffer(0.25)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 380
  const tg = ctx.createGain()
  tg.gain.setValueAtTime(0.22, t + 1.15)
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 1.5)
  thud.connect(lp).connect(tg).connect(master)
  thud.start(t + 1.15)
}

export function sfxStart() {
  tone({ freq: 140, type: 'sine', dur: 0.7, gain: 0.28, glide: 60, send: 0.6 })
  tone({ freq: 990, type: 'square', dur: 0.1, gain: 0.1 })
}

let ambientNodes = null

export function startAmbience(variante = 'frio') {
  if (!ctx || ambientNodes) return
  const quente = variante === 'quente'
  const g = ctx.createGain()
  g.gain.value = 0.0001
  g.gain.exponentialRampToValueAtTime(quente ? 0.07 : 0.05, now() + 3)
  g.connect(master)

  const o1 = ctx.createOscillator()
  o1.type = 'sine'
  o1.frequency.value = quente ? 48 : 55
  const o2 = ctx.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = quente ? 72 : 82.5
  const og = ctx.createGain()
  og.gain.value = 0.5
  o1.connect(og)
  o2.connect(og)
  og.connect(g)

  const air = ctx.createBufferSource()
  air.buffer = noiseBuffer(4)
  air.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = quente ? 900 : 420
  const ag = ctx.createGain()
  ag.gain.value = quente ? 0.14 : 0.09
  air.connect(lp).connect(ag).connect(g)

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.05
  lfo.connect(lfoGain).connect(ag.gain)

  o1.start()
  o2.start()
  air.start()
  lfo.start()
  ambientNodes = { o1, o2, air, lfo, g }
}

export function stopAmbience() {
  if (!ambientNodes) return
  const { o1, o2, air, lfo, g } = ambientNodes
  const t = now()
  g.gain.cancelScheduledValues(t)
  g.gain.setValueAtTime(g.gain.value || 0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
  ;[o1, o2, air, lfo].forEach((n) => {
    try {
      n.stop(t + 0.7)
    } catch {}
  })
  ambientNodes = null
}

let ultimoTitulo = -99

export function sfxTituloRe2(comReserva = true) {
  if (!ctx) return false
  if (now() - ultimoTitulo < 1.2) return true
  if (tocarAmostra('re2-titulo', 0.92)) {
    ultimoTitulo = now()
    return true
  }
  if (!comReserva) return false
  ultimoTitulo = now()
  tone({ freq: 58, type: 'sine', dur: 1.5, gain: 0.16, glide: 34 })
  tone({ freq: 116, type: 'triangle', dur: 1.1, gain: 0.09, glide: 70, send: 0.6 })
  tone({ freq: 233, type: 'sine', dur: 2.2, gain: 0.05, delay: 0.1, send: 0.8 })
  tone({ freq: 349, type: 'sine', dur: 2.6, gain: 0.03, delay: 0.24, send: 0.9 })
  return true
}

export function sfxSaMove() {
  if (tocarAmostra('sa-menu', 0.55)) return
  tone({ freq: 520, type: 'triangle', dur: 0.04, gain: 0.09 })
  tone({ freq: 1040, type: 'sine', dur: 0.03, gain: 0.05 })
}

export function sfxSaConfirm() {
  tone({ freq: 300, type: 'triangle', dur: 0.09, gain: 0.14, glide: 200 })
  tone({ freq: 880, type: 'sine', dur: 0.11, gain: 0.07, delay: 0.02 })
}

export function sfxSaBack() {
  tone({ freq: 220, type: 'triangle', dur: 0.11, gain: 0.11, glide: 130 })
}

export function sfxTerritorio() {
  ;[392, 523.25, 659.25].forEach((f, i) => {
    tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.11, delay: i * 0.09, send: 0.5 })
  })
}
