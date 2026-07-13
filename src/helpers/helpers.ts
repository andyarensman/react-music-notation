import { NoteGlyphs } from "./glyphs";
import { ClefType, NoteProps, Pitch, PitchPosition } from "./types";

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

/*
  The tables below are y-coordinates inside the stem/beam svg viewBox
  ("0 0 100 129"), where 129 units span the full Leland line box. One
  staff-space is 8 units, so each position step is 4. They are resolution
  independent: the svg is stretched to the real rendered size.
*/

type BeamPositionsType = Record<
  "upStem" | "downStem",
  Record<PitchPosition, number>
>;

export const BeamPositions: BeamPositionsType = {
  upStem: {
    "line-above-2": 4,
    "space-above-2": 8,
    "line-above-1": 12,
    "space-above-1": 16,
    "line-5": 20,
    "space-4": 24,
    "line-4": 28,
    "space-3": 32,
    "line-3": 36,
    "space-2": 40,
    "line-2": 44,
    "space-1": 48,
    "line-1": 52,
    "space-below-1": 56,
    "line-below-1": 60,
    "space-below-2": 64,
    "line-below-2": 68,
  },
  downStem: {
    "line-above-2": 56,
    "space-above-2": 60,
    "line-above-1": 64,
    "space-above-1": 68,
    "line-5": 72,
    "space-4": 76,
    "line-4": 80,
    "space-3": 84,
    "line-3": 88,
    "space-2": 92,
    "line-2": 96,
    "space-1": 100,
    "line-1": 104,
    "space-below-1": 108,
    "line-below-1": 112,
    "space-below-2": 116,
    "line-below-2": 120,
  },
};

export const StemPositions: Record<PitchPosition, number> = {
  "line-above-2": 32,
  "space-above-2": 36,
  "line-above-1": 40,
  "space-above-1": 44,
  "line-5": 48,
  "space-4": 52,
  "line-4": 56,
  "space-3": 60,
  "line-3": 64,
  "space-2": 68,
  "line-2": 72,
  "space-1": 76,
  "line-1": 80,
  "space-below-1": 84,
  "line-below-1": 88,
  "space-below-2": 92,
  "line-below-2": 96,
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

// Every renderable position, top of the range to bottom. line-3 (the middle
// line) sits at index 8; each index step is half a staff-space.
export const pitchPositionOrder: PitchPosition[] = [
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
];

const MIDDLE_LINE_INDEX = 8;

export const positionIndex = (position: PitchPosition): number =>
  pitchPositionOrder.indexOf(position);

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

export const getDefaultStem = (
  position: PitchPosition
): "upStem" | "downStem" => {
  const downStemPositions: PitchPosition[] = [
    "line-above-2",
    "space-above-2",
    "line-above-1",
    "space-above-1",
    "line-5",
    "space-4",
    "line-4",
    "space-3",
    "line-3",
  ];

  return downStemPositions.includes(position) ? "downStem" : "upStem";
};

export type LedgerLine = "above-1" | "above-2" | "below-1" | "below-2";

// Which ledger lines a notehead at this position needs drawn behind it
export const getLedgerLines = (position: PitchPosition): LedgerLine[] => {
  switch (position) {
    case "line-above-2":
      return ["above-1", "above-2"];
    case "space-above-2":
    case "line-above-1":
      return ["above-1"];
    case "line-below-1":
    case "space-below-2":
      return ["below-1"];
    case "line-below-2":
      return ["below-1", "below-2"];
    default:
      return [];
  }
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
