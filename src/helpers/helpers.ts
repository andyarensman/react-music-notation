import { NoteGlyphs } from "./glyphs";
import { ClefType, NoteProps, PitchPosition } from "./types";

export const noteFlexValue: Record<NoteProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
};

// Horizontal space a note takes up, as a flex-grow value. A dot adds half
// the note's duration.
export const getNoteFlex = (props: NoteProps): number =>
  noteFlexValue[props.noteValue] * (props.dotted ? 1.5 : 1);

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
