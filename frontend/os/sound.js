/**
 * RizkyOS 95 - Retro Web Audio Synthesizer & Sound Manager
 * Lazy AudioContext unlocked on first user gesture; completely safe if blocked.
 */

const STORAGE_KEY = 'rizkyos_sound_muted';

let audioCtx = null;
let gestureUnlocked = false;
let muted = readStoredMute();

function readStoredMute() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredMute(val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
    }
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function unlockAudio() {
  if (gestureUnlocked) return;
  gestureUnlocked = true;
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const opts = { capture: true, passive: true, once: true };
  window.addEventListener('pointerdown', unlockAudio, opts);
  window.addEventListener('keydown', unlockAudio, opts);
  window.addEventListener('touchstart', unlockAudio, opts);
}

/**
 * Play a shaped synth note safely.
 */
function playTone(ctx, {
  freq = 440,
  endFreq = null,
  type = 'sine',
  startOffset = 0,
  duration = 0.12,
  gain = 0.08,
  attack = 0.008,
}) {
  try {
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gain, now + Math.min(attack, duration * 0.4));
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    env.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    // Ignore audio scheduling errors
  }
}

function emitSoundChange() {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rizkyos:soundchange', { detail: { muted } }));
    }
  } catch {
    // Ignore
  }
}

export const sound = {
  /**
   * Nostalgic Brian-Eno-inspired Windows 95 startup bloom chord (~1.7s).
   */
  playStartup() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;

    // Warm nostalgic chord swell: Eb4 - Bb4 - G5 -> F4 - C5 - A5 -> Eb4 - G4 - Bb4 - D5 - G5
    const notes = [
      // Opening lush shimmer
      { freq: 311.13, type: 'triangle', startOffset: 0.0, duration: 0.75, gain: 0.055, attack: 0.08 },
      { freq: 466.16, type: 'sine',     startOffset: 0.06, duration: 0.7,  gain: 0.05,  attack: 0.08 },
      { freq: 622.25, type: 'sine',     startOffset: 0.14, duration: 0.65, gain: 0.045, attack: 0.07 },
      // Mid rising chime
      { freq: 698.46, type: 'triangle', startOffset: 0.34, duration: 0.65, gain: 0.05,  attack: 0.05 },
      { freq: 932.33, type: 'sine',     startOffset: 0.46, duration: 0.75, gain: 0.04,  attack: 0.06 },
      // Warm resolving major-9 pad
      { freq: 311.13, type: 'sine',     startOffset: 0.68, duration: 1.05, gain: 0.06,  attack: 0.12 },
      { freq: 392.00, type: 'triangle', startOffset: 0.72, duration: 1.0,  gain: 0.045, attack: 0.12 },
      { freq: 587.33, type: 'sine',     startOffset: 0.78, duration: 0.95, gain: 0.04,  attack: 0.12 },
      { freq: 783.99, type: 'sine',     startOffset: 0.84, duration: 0.9,  gain: 0.035, attack: 0.10 },
    ];

    for (const n of notes) {
      playTone(ctx, n);
    }
  },

  /**
   * Subtle crisp tactile Win95 UI click.
   */
  playClick() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    playTone(ctx, {
      freq: 1350,
      endFreq: 520,
      type: 'triangle',
      duration: 0.022,
      gain: 0.05,
      attack: 0.002,
    });
  },

  /**
   * Classic soft ascending window open tone.
   */
  playOpen() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    playTone(ctx, { freq: 440, type: 'triangle', startOffset: 0,    duration: 0.06, gain: 0.045, attack: 0.005 });
    playTone(ctx, { freq: 660, type: 'sine',     startOffset: 0.04, duration: 0.08, gain: 0.045, attack: 0.005 });
  },

  /**
   * Classic soft descending window close tone.
   */
  playClose() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    playTone(ctx, { freq: 540, type: 'triangle', startOffset: 0,    duration: 0.055, gain: 0.045, attack: 0.004 });
    playTone(ctx, { freq: 330, type: 'sine',     startOffset: 0.038, duration: 0.075, gain: 0.04,  attack: 0.004 });
  },

  /**
   * Cheerful retro Messenger incoming message chime.
   */
  playMessage() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    playTone(ctx, { freq: 783.99,  type: 'sine',     startOffset: 0,     duration: 0.09, gain: 0.055, attack: 0.005 });
    playTone(ctx, { freq: 1046.50, type: 'triangle', startOffset: 0.075, duration: 0.14, gain: 0.055, attack: 0.005 });
    playTone(ctx, { freq: 1318.51, type: 'sine',     startOffset: 0.14,  duration: 0.16, gain: 0.04,  attack: 0.006 });
  },

  /**
   * Iconic Windows 95 "Chord" error thud.
   */
  playError() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    playTone(ctx, { freq: 196.00, type: 'sawtooth', startOffset: 0,     duration: 0.24, gain: 0.045, attack: 0.006 });
    playTone(ctx, { freq: 233.08, type: 'triangle', startOffset: 0.008, duration: 0.24, gain: 0.05,  attack: 0.006 });
    playTone(ctx, { freq: 293.66, type: 'sine',     startOffset: 0.014, duration: 0.26, gain: 0.05,  attack: 0.006 });
  },

  /**
   * Classic PC-speaker / arcade beep (used by BIOS POST, MS-DOS, and games).
   * @param {number} [freq=800]
   * @param {number} [duration=0.08]
   */
  playBeep(freq = 800, duration = 0.08) {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const safeFreq = Number.isFinite(freq) ? Math.max(40, Math.min(8000, freq)) : 800;
    const safeDur = Number.isFinite(duration) ? Math.max(0.015, Math.min(2, duration)) : 0.08;
    playTone(ctx, {
      freq: safeFreq,
      type: 'square',
      duration: safeDur,
      gain: 0.04,
      attack: 0.003,
    });
  },

  /**
   * @returns {boolean}
   */
  isMuted() {
    return muted;
  },

  /**
   * Toggle mute state, persist in localStorage, and notify listeners.
   * @returns {boolean} new muted state
   */
  toggleMute() {
    muted = !muted;
    writeStoredMute(muted);
    emitSoundChange();
    if (!muted) {
      this.playClick();
    }
    return muted;
  },

  /**
   * Explicitly set mute state.
   * @param {boolean} val
   * @returns {boolean}
   */
  setMuted(val) {
    muted = Boolean(val);
    writeStoredMute(muted);
    emitSoundChange();
    return muted;
  },
};
