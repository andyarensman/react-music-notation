import React from "react";
import "./Note.css";
import "../global.css";
import { NoteGlyphs, noteGlyphs } from "../helpers/glyphs";
import { PitchPosition } from "./Note";

interface Note {
  position: PitchPosition;
}

interface NoteStackProps {
  pitches: Note[];
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th";
  dotted?: 1;
  stem?: "upStem" | "downStem" | "noStem";
}

const noteTranslations: Record<NoteStackProps["noteValue"], keyof NoteGlyphs> =
  {
    whole: "wholeNote",
    half: "halfNote",
    quarter: "quarterNote",
    eighth: "eighthNote",
    "16th": "sixteenthNote",
  };

const noteFlexValue: Record<NoteStackProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
};

export const NoteStack = ({ pitches, noteValue }: NoteStackProps) => {
  return (
    <div
      className="note-container"
      style={{ flexGrow: noteFlexValue[noteValue] }}
    >
      {pitches.map((pitch) => (
        <div className={"leland note " + pitch.position}>
          {noteGlyphs[noteTranslations[noteValue]]["noStem"]}
        </div>
      ))}
    </div>
  );
};
