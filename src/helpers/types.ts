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

export type PitchPosition =
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
  | "line-below-1";

interface BaseNoteProps {
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th";
  // | "32nd"
  // | "64th"
  // | "128th"
  // | "256th"
  // | "512th"
  // | "1024th";
  dotted?: 1;
}

export interface Beam {
  amount: 1 | 2;
  status: "start" | "continue" | "end";
  hook?: "forward" | "backward";
  nextNotePostion?: PitchPosition;
}

interface RestProps extends BaseNoteProps {
  rest: true;
  pitch?: never;
  position?: PitchPosition;
  stem?: never;
}

interface NoteValueProps extends BaseNoteProps {
  pitch?: {
    step?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    alter?: "sharp" | "flat" | "natural" | "doubleSharp" | "doubleFlat";
    octave?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  };
  position: PitchPosition;
  stem?: "upStem" | "downStem" | "noStem";
  rest?: false;
  beam?: Beam;
}

export type NoteProps = RestProps | NoteValueProps;
