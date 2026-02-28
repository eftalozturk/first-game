let audioCtx = null
let masterVolume = 0.5

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v))
}

function playTone(freq, duration, type = 'square', volume = 0.15) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = volume * masterVolume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch { /* audio not supported */ }
}

export function playJump() {
  playTone(400, 0.1, 'square', 0.1)
  setTimeout(() => playTone(500, 0.08, 'square', 0.08), 50)
}

export function playCoin() {
  playTone(800, 0.06, 'sine', 0.12)
  setTimeout(() => playTone(1200, 0.08, 'sine', 0.1), 60)
}

export function playDeath() {
  playTone(300, 0.15, 'sawtooth', 0.12)
  setTimeout(() => playTone(200, 0.2, 'sawtooth', 0.1), 100)
  setTimeout(() => playTone(100, 0.3, 'sawtooth', 0.08), 200)
}

export function playLevelUp() {
  playTone(523, 0.1, 'sine', 0.12)
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 100)
  setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200)
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.15), 300)
}
