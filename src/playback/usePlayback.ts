import { useEffect, useRef, useState } from "react";
import { PlaybackEvent, PlaybackScore } from "./extract";
import { Instrument, createWebAudioInstrument } from "./instrument";

export interface UsePlaybackOptions {
  /** Audio backend; defaults to the built-in Web Audio synth. */
  instrument?: Instrument;
  /**
   * Fires when an event starts sounding (use it to move a cursor or
   * highlight notes via `selected`), and with `null` when playback ends
   * or stops.
   */
  onEvent?: (event: PlaybackEvent | null) => void;
}

/**
 * Plays a `PlaybackScore` (see `extractPlaybackScore`). All notes are
 * scheduled on the audio clock at `play()`; a rAF loop reports each
 * event through `onEvent` as it starts sounding.
 *
 * @example
 * ```tsx
 * const score = useMemo(() => extractPlaybackScore(element), [element]);
 * const { play, stop, isPlaying } = usePlayback(score, {
 *   onEvent: (e) => setActive(e?.noteIndices ?? []),
 * });
 * ```
 */
export const usePlayback = (
  score: PlaybackScore | null,
  options: UsePlaybackOptions = {}
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const instrumentRef = useRef<Instrument | null>(options.instrument ?? null);
  const onEventRef = useRef(options.onEvent);
  onEventRef.current = options.onEvent;
  const rafRef = useRef(0);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    instrumentRef.current?.stopAll();
    onEventRef.current?.(null);
    setIsPlaying(false);
  };

  const play = async () => {
    if (!score || score.events.length === 0) return;
    const instrument = (instrumentRef.current ??= createWebAudioInstrument());
    cancelAnimationFrame(rafRef.current);
    instrument.stopAll();
    await instrument.start();

    const startTime = instrument.now() + 0.1;
    for (const event of score.events) {
      const midis: (number | null)[] =
        event.midi.length === 0 ? [null] : event.midi;
      for (const midi of midis) {
        instrument.playNote(
          midi,
          startTime + event.timeSec,
          event.durationSec
        );
      }
    }
    setIsPlaying(true);

    let pointer = 0;
    const tick = () => {
      const elapsed = instrument.now() - startTime;
      while (
        pointer < score.events.length &&
        score.events[pointer].timeSec <= elapsed
      ) {
        onEventRef.current?.(score.events[pointer]);
        pointer += 1;
      }
      if (elapsed > score.durationSec + 0.2) {
        onEventRef.current?.(null);
        setIsPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // silence on unmount
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      instrumentRef.current?.stopAll();
    },
    []
  );

  return { play, stop, isPlaying };
};
