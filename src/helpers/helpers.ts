import { NoteGlyphs } from "./glyphs";
import { NoteProps, PitchPosition } from "./types";

export const noteFlexValue: Record<NoteProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
};

interface BeamPositionsType {
  [key: string]: { [key: string]: number };
}

export const BeamPositions: BeamPositionsType = {
  upStem: {
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
  },
  downStem: {
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
  },
};

export const StemPositions = {
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
