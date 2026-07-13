import { ReactElement } from "react";

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

export type ClefType = "gClef" | "fClef" | "cClef";

export type PitchPosition =
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
  | "line-below-2";

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
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th" | "32nd";
  // | "64th"
  // | "128th"
  // | "256th"
  // | "512th"
  // | "1024th";
  dotted?: 1;
  // Rendered below the staff at this event's position
  dynamic?: DynamicType;
}

interface RestProps extends BaseNoteProps {
  rest: true;
  pitch?: never;
  position?: PitchPosition;
  stem?: never;
  stemEndValue?: never;
  tie?: never;
  tieDirection?: never;
  articulation?: never;
}

export interface Pitch {
  step?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  alter?: "sharp" | "flat" | "natural" | "doubleSharp" | "doubleFlat";
  octave?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export interface NoteValueProps extends BaseNoteProps {
  pitch?: Pitch;
  // When omitted, the position is derived from pitch.step/octave and the
  // measure's clef
  position?: PitchPosition;
  stem?: "upStem" | "downStem" | "noStem";
  rest?: false;
  stemEndValue?: number;
  // "start" draws a tie curve to the next note (same measure); "stop" marks
  // the receiving note
  tie?: "start" | "stop";
  // Default: opposite the stem. Voices override this so ties curve toward
  // the voice's outer side (up voice above, down voice below).
  tieDirection?: "above" | "below";
  // Rendered on the notehead side (opposite the stem)
  articulation?: ArticulationType;
}

// One notehead within a NoteStack chord
export interface StackedNote {
  pitch?: Pitch;
  position?: PitchPosition;
}

export type NoteProps = RestProps | NoteValueProps;

export type NoteElement = ReactElement<NoteValueProps>; //Nonrest
