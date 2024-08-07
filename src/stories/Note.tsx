import React from "react";
import "./Note.css";
import "../global.css";
import { NoteGlyphs, accidentalGlyphs, noteGlyphs } from "../helpers/glyphs";

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

interface BeamPositionsType {
  [key: string]: { [key: string]: number };
}

const BeamPositions: BeamPositionsType = {
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

interface Beam {
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

const noteTranslations: Record<NoteProps["noteValue"], keyof NoteGlyphs> = {
  whole: "wholeNote",
  half: "halfNote",
  quarter: "quarterNote",
  eighth: "eighthNote",
  "16th": "sixteenthNote",
};

const noteFlexValue: Record<NoteProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
};

const getDefaultStem = (position: PitchPosition): "upStem" | "downStem" => {
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

export const Note = (props: NoteProps) => {
  const { noteValue, rest } = props;
  const position = props.position || "line-3";
  const stem = !rest ? props.stem || getDefaultStem(position) : undefined;
  const pitch = !rest ? props.pitch : null;
  let beam: Beam | undefined;

  if ("beam" in props) {
    beam = props.beam;
  }

  //beaming
  const beamThickness = 4;
  const topLeftY = stem ? BeamPositions[stem][position] : 0;
  const topRightY =
    stem && beam?.nextNotePostion
      ? BeamPositions[stem][beam?.nextNotePostion]
      : 0;
  const bottomLeftY = topLeftY + beamThickness;
  const bottomRightY = topRightY + beamThickness;
  const nextBeamOffset = stem === "upStem" ? 6 : -6; //beamThickness + beamThickness / 2

  return (
    <div
      className="note-container"
      style={{ flexGrow: noteFlexValue[noteValue] }}
    >
      {pitch && pitch.alter && (
        <div className={`leland note ${pitch.alter} ${position}`}>
          {accidentalGlyphs[pitch.alter]}
        </div>
      )}
      <div className={"leland note " + position}>
        {rest
          ? noteGlyphs[noteTranslations[noteValue]]["rest"]
          : !beam
            ? noteGlyphs[noteTranslations[noteValue]][stem!]
            : noteGlyphs[noteTranslations["quarter"]][stem!]}
      </div>
      {beam && (beam.status === "start" || beam.status === "continue") && (
        <div className={"beam " + (stem === "upStem" ? "beam-above" : "")}>
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="beam"
          >
            <polygon
              points={`0,${topLeftY} 100,${topRightY} 100,${bottomRightY} 0,${bottomLeftY}`}
            />
            {beam.amount > 1 ? (
              <polygon
                points={`0,${topLeftY + nextBeamOffset} 100,${topRightY + nextBeamOffset} 100,${bottomRightY + nextBeamOffset} 0,${bottomLeftY + nextBeamOffset}`}
              />
            ) : (
              ""
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
