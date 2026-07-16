/*
  The audio backend contract and a dependency-free default. The default
  is a small Web Audio synth (triangle wave + envelope; a filtered click
  for unpitched events) so playback works with zero assets. Swap in a
  soundfont or Tone.js by implementing Instrument yourself.
*/

export interface Instrument {
  /** Prepare/resume audio (must be called from a user gesture). */
  start(): Promise<void> | void;
  /** Current audio-clock time in seconds (schedule against this). */
  now(): number;
  /**
   * Schedule one note. `midi` null = unpitched (percussion click);
   * `when` is in audio-clock time, `duration` in seconds.
   */
  playNote(midi: number | null, when: number, duration: number): void;
  /** Cut everything currently scheduled or sounding. */
  stopAll(): void;
}

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** The built-in Web Audio synth. Browser-only; created lazily. */
export const createWebAudioInstrument = (): Instrument => {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;

  const ensure = () => {
    if (!context) {
      context = new AudioContext();
    }
    if (!master) {
      master = context.createGain();
      master.gain.value = 0.9;
      master.connect(context.destination);
    }
    return { context, master };
  };

  return {
    async start() {
      const { context: ctx } = ensure();
      if (ctx.state === "suspended") await ctx.resume();
    },
    now() {
      return ensure().context.currentTime;
    },
    playNote(midi, when, duration) {
      const { context: ctx, master: out } = ensure();
      const gain = ctx.createGain();
      gain.connect(out);

      if (midi === null) {
        // unpitched: a short bright blip
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 1800;
        osc.connect(gain);
        gain.gain.setValueAtTime(0.12, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
        osc.start(when);
        osc.stop(when + 0.08);
        return;
      }

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = midiToFreq(midi);
      osc.connect(gain);
      const release = Math.min(0.12, duration * 0.5);
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.28, when + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.14, when + duration * 0.6);
      gain.gain.setValueAtTime(0.14, when + duration - release);
      gain.gain.linearRampToValueAtTime(0.0001, when + duration);
      osc.start(when);
      osc.stop(when + duration + 0.05);
    },
    stopAll() {
      // dropping the master silences everything scheduled through it;
      // the next start() builds a fresh one
      if (master) {
        master.disconnect();
        master = null;
      }
    },
  };
};
