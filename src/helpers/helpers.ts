import { NoteGlyphs } from "./glyphs";
import {
  ArticulationType,
  ClefType,
  Lyric,
  LyricInput,
  NoteProps,
  Pitch,
  PitchPosition,
} from "./types";

export const noteFlexValue: Record<NoteProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
  "32nd": 0.5,
};

// Horizontal space a note takes up, as a flex-grow value. A dot adds half
// the note's duration.
export const getNoteFlex = (props: {
  noteValue: NoteProps["noteValue"];
  dotted?: 1;
}): number => noteFlexValue[props.noteValue] * (props.dotted ? 1.5 : 1);

// Every renderable position, top of the range (four ledger lines above the
// staff) to the bottom (four below). Each index step is half a staff-space;
// even indices are lines, odd are spaces.
export const pitchPositionOrder: PitchPosition[] = [
  "line-above-4",
  "space-above-4",
  "line-above-3",
  "space-above-3",
  "line-above-2",
  "space-above-2",
  "line-above-1",
  "space-above-1",
  "line-5",
  "space-4",
  "line-4",
  "space-3",
  "line-3",
  "space-2",
  "line-2",
  "space-1",
  "line-1",
  "space-below-1",
  "line-below-1",
  "space-below-2",
  "line-below-2",
  "space-below-3",
  "line-below-3",
  "space-below-4",
  "line-below-4",
];

export const TOP_LINE_INDEX = pitchPositionOrder.indexOf("line-5");
export const MIDDLE_LINE_INDEX = pitchPositionOrder.indexOf("line-3");
export const BOTTOM_LINE_INDEX = pitchPositionOrder.indexOf("line-1");

export const positionIndex = (position: PitchPosition): number =>
  pitchPositionOrder.indexOf(position);

/*
  The tables below are y-coordinates inside the stem/beam svg viewBox
  ("0 0 100 129"), where 129 units span the full Leland line box. One
  staff-space is 8 units, so each position step is 4, with the middle line
  at 64. They are resolution independent: the svg is stretched to the real
  rendered size. Positions far outside the staff can produce values outside
  0..129; those clip if a stem/beam is actually drawn there, but the default
  stem directions keep extreme notes' stems pointing into the staff.
*/
const stemPositionAt = (index: number): number =>
  64 + (index - MIDDLE_LINE_INDEX) * 4;

export const StemPositions = Object.fromEntries(
  pitchPositionOrder.map((position, index) => [position, stemPositionAt(index)])
) as Record<PitchPosition, number>;

export const BeamPositions: Record<
  "upStem" | "downStem",
  Record<PitchPosition, number>
> = {
  // a standard-length stem (3.5 staff-spaces = 28 units) away from the head
  upStem: Object.fromEntries(
    pitchPositionOrder.map((position, index) => [
      position,
      stemPositionAt(index) - 28,
    ])
  ) as Record<PitchPosition, number>,
  downStem: Object.fromEntries(
    pitchPositionOrder.map((position, index) => [
      position,
      stemPositionAt(index) + 24,
    ])
  ) as Record<PitchPosition, number>,
};

export const noteTranslations: Record<
  NoteProps["noteValue"],
  keyof NoteGlyphs
> = {
  whole: "wholeNote",
  half: "halfNote",
  quarter: "quarterNote",
  eighth: "eighthNote",
  "16th": "sixteenthNote",
  "32nd": "thirtySecondNote",
};

const stepIndex: Record<NonNullable<Pitch["step"]>, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Diatonic index (octave * 7 + step) of the pitch sitting on the middle line
const clefMiddleLinePitch: Record<ClefType, number> = {
  gClef: 34, // B4
  fClef: 22, // D3
  cClef: 28, // C4
};

// Derive a staff position from a pitch and clef. Returns undefined when the
// pitch is missing step or octave (e.g. accidental-only pitches).
export const derivePosition = (
  pitch: Pitch | undefined,
  clef: ClefType
): PitchPosition | undefined => {
  if (!pitch || pitch.step === undefined || pitch.octave === undefined) {
    return undefined;
  }
  const diatonicIndex = pitch.octave * 7 + stepIndex[pitch.step];
  const stepsAboveMiddle = diatonicIndex - clefMiddleLinePitch[clef];
  const arrayIndex = MIDDLE_LINE_INDEX - stepsAboveMiddle;
  const clamped = Math.min(
    pitchPositionOrder.length - 1,
    Math.max(0, arrayIndex)
  );
  if (clamped !== arrayIndex) {
    console.warn(
      `Pitch ${pitch.step}${pitch.octave} is outside the renderable range for ${clef}; clamping to ${pitchPositionOrder[clamped]}`
    );
  }
  return pitchPositionOrder[clamped];
};

// position wins, then pitch-derived, then the middle line
export const resolvePosition = (
  note: { position?: PitchPosition; pitch?: Pitch },
  clef: ClefType
): PitchPosition =>
  note.position ?? derivePosition(note.pitch, clef) ?? "line-3";

// Chord stem direction: the notehead farthest from the middle line decides;
// ties go down, matching getDefaultStem for single notes
export const getChordStem = (
  positions: PitchPosition[]
): "upStem" | "downStem" => {
  const indices = positions.map(positionIndex);
  const above = MIDDLE_LINE_INDEX - Math.min(...indices);
  const below = Math.max(...indices) - MIDDLE_LINE_INDEX;
  return below > above ? "upStem" : "downStem";
};

// How many beams/flags a note value carries
export const getBeamCount = (noteValue: NoteProps["noteValue"]): number => {
  if (noteValue === "32nd") return 3;
  if (noteValue === "16th") return 2;
  if (noteValue === "eighth") return 1;
  return 0;
};

/*
  Assign accidentals to horizontal columns so they don't overlap vertically.
  Input is the position indices of the accidental-bearing notes, top first;
  output is a column per note (0 = closest to the chord). Accidentals within
  6 half-steps (~ a sharp's height) of one in a column move a column left.
*/
export const assignAccidentalColumns = (indices: number[]): number[] => {
  const columns: number[][] = [];
  return indices.map((index) => {
    for (let column = 0; column < columns.length; column++) {
      const clashes = columns[column].some(
        (other) => Math.abs(other - index) < 6
      );
      if (!clashes) {
        columns[column].push(index);
        return column;
      }
    }
    columns.push([index]);
    return columns.length - 1;
  });
};

/*
  Articulation placement, following Gould ("Behind Bars", pp. 115-121):
  - staccato/tenuto marks are centred in a stave-space: a note in a space
    takes the adjacent space, a note on a line takes the next clear space
  - accents and wedges are usually best placed outside the stave
  - at a stem end (double-stemmed writing, or a mark forced onto the stem
    side), the mark goes in the first clear stave-space beyond the stem
  Positions are pitch-position indices (pitchPositionOrder): even = line,
  odd = space; the index may run past the table for ledger regions.
*/
const OUTSIDE_STAFF_FAMILIES: ArticulationType[] = [
  "accent",
  "accentStaccato",
  "accentTenuto",
  "staccatissimo",
  "marcato",
  "marcatoStaccato",
];

const FIRST_SPACE_BELOW_STAFF = BOTTOM_LINE_INDEX + 1;
const FIRST_SPACE_ABOVE_STAFF = TOP_LINE_INDEX - 1;

export const getArticulationIndex = (options: {
  articulation: ArticulationType;
  noteIndex: number;
  below: boolean;
  // Set when the mark sits at the stem end: the tip's position index
  stemTipIndex?: number;
}): number => {
  const { articulation, noteIndex, below, stemTipIndex } = options;
  let target: number;
  if (stemTipIndex !== undefined) {
    // first clear stave-space beyond the stem
    const step = stemTipIndex % 2 === 0 ? 1 : 2;
    target = below ? stemTipIndex + step : stemTipIndex - step;
  } else {
    // next to the notehead: adjacent space (from a space) or next clear
    // space (from a line)
    const step = noteIndex % 2 === 0 ? 3 : 2;
    target = below ? noteIndex + step : noteIndex - step;
  }
  if (OUTSIDE_STAFF_FAMILIES.includes(articulation)) {
    target = below
      ? Math.max(target, FIRST_SPACE_BELOW_STAFF)
      : Math.min(target, FIRST_SPACE_ABOVE_STAFF);
  }
  return target;
};

// The strong accent goes above the stave regardless of stem direction
export const articulationDefaultsAbove = (
  articulation: ArticulationType
): boolean => articulation === "marcato" || articulation === "marcatoStaccato";

/*
  Horizontal centering: articulation is centred in line with the notehead
  (Gould p. 118), but the glyphs vary in width — a staccato dot is a third
  of a notehead, a tenuto is exactly a notehead — so each mark needs its own
  left offset (in staff-spaces from the notehead's left edge) to center on
  the ~1.18 staff-space notehead.
*/
export const articulationLeftSs: Record<ArticulationType, number> = {
  staccato: 0.43,
  staccatissimo: 0.37,
  tenuto: 0,
  accent: -0.05,
  marcato: 0.12,
  marcatoStaccato: 0.12,
  accentStaccato: -0.05,
  tenutoStaccato: 0,
  accentTenuto: -0.05,
};

// Staccato dots at a stem end look best centred on the stem (Gould p. 118);
// the stem sits at the notehead's right edge (up) or left edge (down)
export const articulationCentersOnStem = (
  articulation: ArticulationType
): boolean => articulation === "staccato" || articulation === "staccatissimo";

/** Expand the string shorthand for a lyric entry. */
export const normalizeLyric = (entry: LyricInput): Lyric =>
  typeof entry === "string" ? { text: entry } : entry;

// The default minimum width every note slot gets, in staff-spaces
export const NOTE_MIN_WIDTH_SS = 2.2;

/*
  Minimum slot width (in staff-spaces) a note needs so its widest lyric
  syllable doesn't collide with its neighbors'. Estimated per character at
  the lyric font size (1.6 staff-spaces, ~0.55em average glyph width) —
  no DOM measurement, so it also feeds the system-breaking estimates.
*/
export const lyricsMinWidthSs = (lyrics?: LyricInput[]): number => {
  if (!lyrics || lyrics.length === 0) return NOTE_MIN_WIDTH_SS;
  return Math.max(
    NOTE_MIN_WIDTH_SS,
    ...lyrics.map(
      (entry) => normalizeLyric(entry).text.length * 0.88 + 0.6
    )
  );
};

// Notes on or above the middle line take down-stems by default
export const getDefaultStem = (
  position: PitchPosition
): "upStem" | "downStem" =>
  positionIndex(position) <= MIDDLE_LINE_INDEX ? "downStem" : "upStem";

export type LedgerLine = `above-${1 | 2 | 3 | 4}` | `below-${1 | 2 | 3 | 4}`;

// Which ledger lines a notehead at this position needs drawn behind it:
// one per full staff-space beyond the outer staff line
export const getLedgerLines = (position: PitchPosition): LedgerLine[] => {
  const index = positionIndex(position);
  const ledgers: LedgerLine[] = [];
  if (index < TOP_LINE_INDEX) {
    const count = Math.floor((TOP_LINE_INDEX - index) / 2);
    for (let n = 1; n <= count; n++) {
      ledgers.push(`above-${n}` as LedgerLine);
    }
  } else if (index > BOTTOM_LINE_INDEX) {
    const count = Math.floor((index - BOTTOM_LINE_INDEX) / 2);
    for (let n = 1; n <= count; n++) {
      ledgers.push(`below-${n}` as LedgerLine);
    }
  }
  return ledgers;
};

/*
  Key signature accidental positions per clef, in the order they are drawn.
  Sharps: F C G D A E B. Flats: B E A D G C F.
*/
export const keySignaturePositions: Record<
  ClefType,
  { sharp: PitchPosition[]; flat: PitchPosition[] }
> = {
  gClef: {
    sharp: [
      "line-5",
      "space-3",
      "space-above-1",
      "line-4",
      "space-2",
      "space-4",
      "line-3",
    ],
    flat: [
      "line-3",
      "space-4",
      "space-2",
      "line-4",
      "line-2",
      "space-3",
      "space-1",
    ],
  },
  cClef: {
    sharp: [
      "space-4",
      "line-3",
      "line-5",
      "space-3",
      "line-2",
      "line-4",
      "space-2",
    ],
    flat: [
      "space-2",
      "line-4",
      "line-2",
      "space-3",
      "space-1",
      "line-3",
      "line-1",
    ],
  },
  fClef: {
    sharp: [
      "line-4",
      "space-2",
      "space-4",
      "line-3",
      "space-1",
      "space-3",
      "line-2",
    ],
    flat: [
      "line-2",
      "space-3",
      "space-1",
      "line-3",
      "line-1",
      "space-2",
      "space-below-1",
    ],
  },
};
