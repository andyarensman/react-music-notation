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
}

type NoteProps = RestProps | NoteValueProps;

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

  //beaming
  const beamThickness = 3;
  const topLeftY = 90;
  const topRightY = 90;
  const bottomLeftY = topLeftY + beamThickness;
  const bottomRightY = topRightY + beamThickness;

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
          : noteGlyphs[noteTranslations[noteValue]][stem!]}
      </div>
      <div className="beam">
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          <polygon
            points={`0,${topLeftY} 100,${topRightY} 100,${bottomRightY} 0,${bottomLeftY}`}
          />
        </svg>
      </div>
    </div>
  );
};
