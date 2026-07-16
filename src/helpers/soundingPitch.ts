import { KeyRange, Pitch } from "./types";

/*
  Sounding pitch vs drawn accidental.

  MusicXML keeps these separate: <alter> is the sounding chromatic
  alteration (present on every altered note, even when the key signature
  covers it), <accidental> is the drawn glyph (present only when engraving
  requires one). Our Pitch mirrors that: `soundingAlter` is the semitone
  alteration, `alter` the glyph. When one is missing it is inferred from
  the other plus context — the key signature and earlier accidentals in
  the measure — which is what a human reader does. AccidentalContext is
  that reader: the importer runs it to decide which glyphs to draw, and
  playback runs it to decide what hand-authored JSX sounds like.
*/

const SHARP_STEPS = ["F", "C", "G", "D", "A", "E", "B"] as const;
const FLAT_STEPS = ["B", "E", "A", "D", "G", "C", "F"] as const;

// step -> +1/-1 for every step the key signature alters
export const keySignatureAlterations = (
  fifths: KeyRange
): Map<string, number> => {
  const altered = new Map<string, number>();
  if (fifths > 0) {
    SHARP_STEPS.slice(0, fifths).forEach((step) => altered.set(step, 1));
  } else if (fifths < 0) {
    FLAT_STEPS.slice(0, -fifths).forEach((step) => altered.set(step, -1));
  }
  return altered;
};

const GLYPH_SEMITONES: Record<NonNullable<Pitch["alter"]>, number> = {
  sharp: 1,
  flat: -1,
  natural: 0,
  doubleSharp: 2,
  doubleFlat: -2,
};

const SEMITONE_GLYPHS: Record<number, NonNullable<Pitch["alter"]>> = {
  1: "sharp",
  "-1": "flat",
  0: "natural",
  2: "doubleSharp",
  "-2": "doubleFlat",
};

const SEMITONES_PER_STEP: Record<NonNullable<Pitch["step"]>, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/**
 * Tracks what a reader assumes each written step sounds like: the key
 * signature, overridden by accidentals earlier in the measure (an
 * accidental applies to its own step and octave until the barline).
 * Feed it notes in temporal order, one instance per staff.
 */
export class AccidentalContext {
  private key: Map<string, number>;
  private measure = new Map<string, number>();

  constructor(fifths: KeyRange = 0) {
    this.key = keySignatureAlterations(fifths);
  }

  /** A new key signature takes effect (also clears measure state). */
  setKey(fifths: KeyRange) {
    this.key = keySignatureAlterations(fifths);
    this.measure.clear();
  }

  /** Crossing a barline clears the measure's accidentals. */
  startMeasure() {
    this.measure.clear();
  }

  /** The semitone alteration a reader expects for this written note. */
  expected(step: NonNullable<Pitch["step"]>, octave: number): number {
    return this.measure.get(step + octave) ?? this.key.get(step) ?? 0;
  }

  /**
   * Reconcile one note: given whichever of the drawn glyph / sounding
   * alteration is known, fill in the other from context and update the
   * running measure state. `glyph` comes back undefined when the context
   * already implies the sounding value (no accidental needs drawing).
   */
  reconcile(
    step: NonNullable<Pitch["step"]>,
    octave: number,
    known: { glyph?: Pitch["alter"]; soundingAlter?: number }
  ): { glyph: Pitch["alter"] | undefined; soundingAlter: number } {
    const expected = this.expected(step, octave);
    const soundingAlter =
      known.soundingAlter ??
      (known.glyph !== undefined ? GLYPH_SEMITONES[known.glyph] : expected);
    const glyph =
      known.glyph ??
      (soundingAlter !== expected ? SEMITONE_GLYPHS[soundingAlter] : undefined);
    this.measure.set(step + octave, soundingAlter);
    return { glyph, soundingAlter };
  }

  /**
   * The sounding alteration of a pitch as authored: an explicit
   * `soundingAlter` wins, then a drawn glyph, then the running context.
   * Updates the measure state (a drawn accidental carries).
   */
  resolve(pitch: Pitch): number {
    if (pitch.step === undefined || pitch.octave === undefined) return 0;
    return this.reconcile(pitch.step, pitch.octave, {
      glyph: pitch.alter,
      soundingAlter: pitch.soundingAlter,
    }).soundingAlter;
  }
}

/** MIDI note number of a pitch given its resolved semitone alteration. */
export const midiOf = (pitch: Pitch, soundingAlter: number): number | null => {
  if (pitch.step === undefined || pitch.octave === undefined) return null;
  return (
    12 * (pitch.octave + 1) + SEMITONES_PER_STEP[pitch.step] + soundingAlter
  );
};
