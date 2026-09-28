import { useEffect, useRef, useSyncExternalStore } from 'react'

// Short sound effects synthesised with WebAudio (no audio files to download),
// and read-aloud with the device's own Hebrew voice. One mute switch covers both.

export type Sound = 'correct' | 'wrong' | 'win' | 'lose' | 'pop' | 'hit' | 'bomb'

const MUTE_KEY = 'brogan-muted'
const listeners = new Set<() => void>()

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

let muted = loadMuted()

export function isMuted() {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // not critical
  }
  if (value) stopSpeaking()
  listeners.forEach((l) => l())
}

export function useMuted() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    isMuted,
  )
}

let audio: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

// [frequency Hz, start s, duration s]
type Note = [number, number, number]

const TUNES: Record<Exclude<Sound, 'bomb'>, { wave: OscillatorType; volume: number; notes: Note[] }> = {
  correct: { wave: 'triangle', volume: 0.25, notes: [[660, 0, 0.1], [880, 0.09, 0.16]] },
  wrong: { wave: 'sawtooth', volume: 0.08, notes: [[220, 0, 0.14], [165, 0.13, 0.22]] },
  win: { wave: 'triangle', volume: 0.25, notes: [[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.12], [1047, 0.33, 0.3]] },
  lose: { wave: 'triangle', volume: 0.2, notes: [[440, 0, 0.16], [370, 0.15, 0.16], [311, 0.3, 0.32]] },
  pop: { wave: 'sine', volume: 0.3, notes: [[880, 0, 0.05], [1320, 0.04, 0.07]] },
  hit: { wave: 'square', volume: 0.08, notes: [[392, 0, 0.06]] },
}

export function play(sound: Sound) {
  if (muted) return
  const ctx = context()
  if (!ctx) return
  const now = ctx.currentTime
  if (sound === 'bomb') {
    // A short burst of fading noise.
    const length = Math.floor(ctx.sampleRate * 0.35)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2
    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    gain.gain.value = 0.35
    src.buffer = buffer
    src.connect(gain).connect(ctx.destination)
    src.start(now)
    return
  }
  const { wave, volume, notes } = TUNES[sound]
  for (const [freq, start, duration] of notes) tone(ctx, wave, volume, freq, now + start, duration)
}

function tone(ctx: AudioContext, wave: OscillatorType, volume: number, freq: number, at: number, duration: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = wave
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + duration + 0.02)
}

/** A single musical note (e.g. a game button's own sound). */
export function playNote(freq: number, seconds: number) {
  if (muted) return
  const ctx = context()
  if (ctx) tone(ctx, 'triangle', 0.3, freq, ctx.currentTime, seconds)
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function hebrewVoice() {
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('he'))
}

/** Reads text aloud in Hebrew, replacing anything already being read. */
export function speak(text: string) {
  if (muted || !canSpeak()) return
  speechSynthesis.cancel()
  // Emoji would be read out by name ("snake"), so they're dropped.
  const plain = text.replace(/\p{Extended_Pictographic}\uFE0F?/gu, '').replace(/\s+/g, ' ').trim()
  const utterance = new SpeechSynthesisUtterance(plain)
  utterance.lang = 'he-IL'
  utterance.rate = 0.9
  const voice = hebrewVoice()
  if (voice) utterance.voice = voice
  speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel()
}

/** Plays `sound` whenever `value` goes up (e.g. score, apples eaten). */
export function useSoundOnIncrease(value: number, sound: Sound) {
  const prev = useRef(value)
  useEffect(() => {
    if (value > prev.current) play(sound)
    prev.current = value
  }, [value, sound])
}

/** Plays `sound` each time `condition` turns true (e.g. game over). */
export function useSoundWhen(condition: boolean, sound: Sound) {
  const prev = useRef(condition)
  useEffect(() => {
    if (condition && !prev.current) play(sound)
    prev.current = condition
  }, [condition, sound])
}
