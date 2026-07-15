import { MouseEventHandler, ReactElement } from "react";

/**
 * Number of sharps (positive) or flats (negative) in a key signature,
 * `-7`..`7` — the same "fifths" convention MusicXML uses. `0` renders no
 * accidentals (C major / A minor). Positive values draw sharps, negative
 * values draw flats. Used as `Measure`'s `fifths` prop.
 */
export type KeyRange =
  | -7
  | -6
  | -5
  | -4
  | -3
  | -2
  | -1
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

/** Supported clef shapes: `"gClef"` (treble), `"fClef"` (bass), or `"cClef"` (alto/tenor). */
export type ClefType = "gClef" | "fClef" | "cClef";

/**
 * One of the 25 staff positions this library can place a notehead, rest, or
 * accidental at: four ledger-line positions above the staff, the five staff
 * lines and four spaces, and four ledger-line positions below. `"line-*"`
 * entries sit on a line, `"space-*"` entries sit in a space; `"line-3"` is
 * the middle line and `"line-5"`/`"line-1"` are the top/bottom staff lines.
 * Usually derived automatically from a `Pitch` and the active clef
 * (`derivePosition` in `helpers.ts`) rather than set directly.
 */
export type PitchPosition =
  | "line-above-4"
  | "space-above-4"
  | "line-above-3"
  | "space-above-3"
  | "line-above-2"
  | "space-above-2"
  | "line-above-1"
  | "space-above-1"
  | "line-5"
  | "space-4"
  | "line-4"
  | "space-3"
  | "line-3"
  | "space-2"
  | "line-2"
  | "space-1"
  | "line-1"
  | "space-below-1"
  | "line-below-1"
  | "space-below-2"
  | "line-below-2"
  | "space-below-3"
  | "line-below-3"
  | "space-below-4"
  | "line-below-4";

/**
 * Articulation mark placed on a `Note`/`NoteStack`: the single marks
 * (`"accent"`, `"staccato"`, `"tenuto"`, `"staccatissimo"`, `"marcato"`) plus
 * the combined forms (`"marcatoStaccato"`, `"accentStaccato"`,
 * `"tenutoStaccato"`, `"accentTenuto"`). Placement follows Gould, "Behind
 * Bars" pp. 115-121 — see `articulation` on `NoteValueProps`/`NoteStackProps`.
 */
export type ArticulationType =
  | "accent"
  | "staccato"
  | "tenuto"
  | "staccatissimo"
  | "marcato"
  | "marcatoStaccato"
  | "accentStaccato"
  | "tenutoStaccato"
  | "accentTenuto";

/**
 * Dynamic marking rendered below the staff at an event's position: the
 * standard dynamics `"p"` through `"ff"`, plus the accented/sforzando forms
 * `"fp"`, `"sf"`, `"sfz"`, `"rf"`, `"rfz"`.
 */
export type DynamicType =
  | "p"
  | "pp"
  | "mp"
  | "mf"
  | "f"
  | "ff"
  | "fp"
  | "sf"
  | "sfz"
  | "rf"
  | "rfz";

interface BaseNoteProps {
  /**
   * Duration of the note or rest, from whole down to 32nd. Finer
   * subdivisions (64th and shorter) are not implemented yet.
   */
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th" | "32nd";
  // | "64th"
  // | "128th"
  // | "256th"
  // | "512th"
  // | "1024th";
  /**
   * Adds an augmentation dot: extends the sounding duration by half and
   * multiplies the note's horizontal flex-grow by 1.5. Only a single dot is
   * supported (hence the literal `1` type).
   */
  dotted?: 1;
  /** Dynamic marking rendered below the staff at this event's position. */
  dynamic?: DynamicType;
  /** Expression text ("dolce", "cresc.") in italics below the staff. */
  text?: string;
  /**
   * Click handler for this event. Any click handler — this one or a
   * score-level `onNoteClick` — makes the event interactive: pointer
   * cursor, keyboard focus (Tab), and Enter/Space activation.
   */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /**
   * Draws the event in the selection color and, when interactive, exposes
   * the state via `aria-pressed`. Selection state lives with the consumer;
   * this is just the visual.
   */
  selected?: boolean;
}

interface RestProps extends BaseNoteProps {
  /** Marks this as a rest rather than a pitched note. */
  rest: true;
  /** Rests have no pitch. */
  pitch?: never;
  /**
   * Explicit staff position for the rest glyph. Defaults to the middle line
   * (`"line-3"`) when omitted; inside a `Voice`, defaults to `"space-4"`
   * (up voice) or `"space-1"` (down voice) instead.
   */
  position?: PitchPosition;
  /** Rests have no stem. */
  stem?: never;
  /** Rests have no stem. */
  stemEndValue?: never;
  /** Rests cannot be tied. */
  tie?: never;
  /** Rests cannot be tied. */
  tieDirection?: never;
  /** Rests cannot carry slur markers. */
  slur?: never;
  /** Rests cannot carry an articulation mark. */
  articulation?: never;
  /** Rests cannot carry an articulation mark. */
  articulationPlacement?: never;
  /** Rests cannot carry lyrics. */
  lyrics?: never;
  /** Rests cannot carry grace notes. */
  grace?: never;
}

/**
 * What the score-level `onNoteClick`/`onNoteHover` callbacks receive:
 * enough to identify the note musically and locate it in the score.
 */
export interface NoteInteractionInfo {
  /**
   * 1-based measure number. Auto-assigned by `Staff`/`GrandStaff`/`Score`
   * in source order when the `Measure` doesn't set `measureNumber` itself.
   */
  measureNumber?: number;
  /** Sounding pitches — one for a note, several for a chord, none for a rest. */
  pitches: Pitch[];
  /** Resolved staff positions (after clef and any octave line). */
  positions: PitchPosition[];
  /** The event's duration value. */
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th" | "32nd";
  /** Whether the event is dotted. */
  dotted: boolean;
  /** Whether the event is a rest. */
  rest: boolean;
}

/**
 * Marks a note as the start and/or end of a slur that may cross barlines
 * and system breaks. Paired by id: an `end` matches the nearest unmatched
 * `start` with the same id (`true` is shorthand for the default id). A
 * note may end one slur and start another.
 */
export interface SlurMarker {
  /** Starts a slur at this note. `true` uses the default pairing id. */
  start?: string | boolean;
  /** Ends a slur begun at an earlier `start` with the same id. */
  end?: string | boolean;
  /**
   * Which side the curve sits on. Defaults to `"below"` when every covered
   * stem points up, otherwise `"above"` (same rule as the `Slur` wrapper).
   * Only read from the `start` note.
   */
  direction?: "above" | "below";
}

/** One lyric syllable under a note. */
export interface Lyric {
  /** The syllable text. */
  text: string;
  /**
   * How the syllable relates to its word: `"single"` (a whole word, the
   * default), or `"begin"`/`"middle"`/`"end"` for hyphenated word parts —
   * `begin` and `middle` draw a hyphen toward the next syllable.
   */
  syllabic?: "single" | "begin" | "middle" | "end";
}

/**
 * A lyric entry: a `Lyric` object or a plain string shorthand for
 * `{ text, syllabic: "single" }`.
 */
export type LyricInput = string | Lyric;

/** A single pitch: diatonic step, optional accidental, and octave. */
export interface Pitch {
  /** Diatonic letter name of the pitch. */
  step?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  /** Accidental drawn beside the notehead. */
  alter?: "sharp" | "flat" | "natural" | "doubleSharp" | "doubleFlat";
  /** Octave number, scientific pitch notation (middle C = octave 4). */
  octave?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export interface NoteValueProps extends BaseNoteProps {
  /**
   * Pitch of the note. When `position` is omitted, the staff position is
   * derived from `pitch.step`/`pitch.octave` and the measure's active clef.
   */
  pitch?: Pitch;
  /**
   * Explicit staff position for the notehead; wins over `pitch` when both
   * are given. When omitted, the position is derived from `pitch.step`/
   * `pitch.octave` and the measure's clef, falling back to the middle line
   * (`"line-3"`) if neither is given.
   */
  position?: PitchPosition;
  /**
   * Stem direction. Defaults to the direction implied by the note's
   * position (notes on/above the middle line point down, others point up)
   * unless overridden here, by a `Voice` (forces one direction), or by
   * `BeamContainer` (sets `"noStem"` and drives the stem via
   * `stemEndValue` instead).
   */
  stem?: "upStem" | "downStem" | "noStem";
  /** Discriminates this variant from `RestProps`; omit or leave `false` for a pitched note. */
  rest?: false;
  /**
   * @internal Set by `BeamContainer` to draw a custom-length stem that
   * meets the beam line; not usually set manually.
   */
  stemEndValue?: number;
  /**
   * `"start"` draws a tie curve to the next note; `"stop"` marks the
   * receiving note. When the next note is in a following measure (or on
   * the next system), the enclosing `Staff`/`GrandStaff`/`Score` draws the
   * curve across the barline — splitting it into two half-curves at a
   * system break. Marking the receiving note with `"stop"` makes the
   * cross-measure pairing explicit; without it, the tie connects to the
   * next note in the same voice.
   */
  tie?: "start" | "stop";
  /**
   * Slur boundary markers for slurs that cross barlines (and system
   * breaks). Set `{ start: true }` on the first note and `{ end: true }`
   * on the last; the enclosing `Staff`/`GrandStaff`/`Score` draws the
   * curve. Concurrent slurs disambiguate with string ids
   * (`{ start: "a" }` … `{ end: "a" }`). For a slur contained in one
   * measure, the `Slur` wrapper component is usually more convenient.
   */
  slur?: SlurMarker;
  /**
   * Tie curve direction. Defaults to the side opposite the stem. Inside a
   * `Voice`, defaults to the voice's outer side instead (above for the
   * up-stem voice, below for the down-stem voice); set this explicitly to
   * override either default.
   */
  tieDirection?: "above" | "below";
  /**
   * Rendered on the notehead side (opposite the stem) by default;
   * accents/marcato go outside the staff per engraving convention.
   */
  articulation?: ArticulationType;
  /**
   * Forces the mark's side, overriding the notehead-side default. Inside a
   * `Voice`, this is set automatically so articulation sits at the stem end
   * (Gould's double-stemmed rule) instead of the notehead side; set this
   * explicitly to override either default.
   */
  articulationPlacement?: "above" | "below";
  /**
   * Lyric syllables under the note, one entry per verse (verse 1 first).
   * Strings are shorthand for whole words; use `{ text, syllabic }` for
   * hyphenated word parts. Long syllables widen the note's slot so
   * neighboring lyrics don't collide.
   */
  lyrics?: LyricInput[];
  /**
   * Grace notes rendered small before this note (and before its
   * accidental), in playing order. Accidentals on the grace notes
   * themselves are not drawn yet.
   */
  grace?: GraceNote[];
}

/** One grace note preceding a host note or chord. */
export interface GraceNote {
  /** Pitch of the grace note (same derivation rules as a normal note). */
  pitch?: Pitch;
  /** Explicit staff position; wins over `pitch` when both are given. */
  position?: PitchPosition;
  /**
   * Draws the acciaccatura slash through the stem. Omit for an
   * appoggiatura (no slash).
   */
  slash?: boolean;
}

/** One notehead within a `NoteStack` chord. */
export interface StackedNote {
  /**
   * Pitch of this notehead. Same derivation rule as `NoteValueProps.pitch`:
   * used only when `position` is omitted.
   */
  pitch?: Pitch;
  /** Explicit staff position for this notehead; wins over `pitch` when both are given. */
  position?: PitchPosition;
}

/**
 * Props accepted by `Note`: either `RestProps` (`rest: true`, no pitch/stem/
 * tie) or `NoteValueProps` (a pitched note, optionally with `pitch`/
 * `position`, `stem`, `tie`, articulation, etc).
 */
export type NoteProps = RestProps | NoteValueProps;

export type NoteElement = ReactElement<NoteValueProps>; //Nonrest
