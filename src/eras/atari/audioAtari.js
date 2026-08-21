import { tone } from '../../lib/audio.js'

export function sfxRaquete() {
  tone({ freq: 262, type: 'square', dur: 0.05, gain: 0.14 })
}

export function sfxParede() {
  tone({ freq: 196, type: 'square', dur: 0.04, gain: 0.11 })
}

export function sfxTijolo(linha) {
  tone({ freq: 330 + linha * 110, type: 'square', dur: 0.055, gain: 0.13 })
}

export function sfxPoder() {
  ;[523, 784, 1047].forEach((f, i) =>
    tone({ freq: f, type: 'square', dur: 0.09, gain: 0.14, delay: i * 0.055 })
  )
}

export function sfxPerdeu() {
  tone({ freq: 220, type: 'square', dur: 0.45, gain: 0.16, glide: 55 })
}

export function sfxLinha() {
  ;[392, 523, 659, 784].forEach((f, i) =>
    tone({ freq: f, type: 'square', dur: 0.12, gain: 0.13, delay: i * 0.09 })
  )
}

export function sfxVitoria() {
  ;[523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
    tone({ freq: f, type: 'square', dur: 0.16, gain: 0.13, delay: i * 0.13 })
  )
}

export function sfxMenu() {
  tone({ freq: 587, type: 'square', dur: 0.04, gain: 0.1 })
}

export function sfxSeleciona() {
  tone({ freq: 440, type: 'square', dur: 0.06, gain: 0.13 })
  tone({ freq: 880, type: 'square', dur: 0.09, gain: 0.11, delay: 0.055 })
}
