import React from "react";
import "./Note.css";
import "../global.css";
import { NoteGlyphs, noteGlyphs } from "../helpers/glyphs";

interface NoteProps {
  pitch: {
    step?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    alter?: -1 | 1;
    octave?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    position:
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
  };
  noteValue: "whole" | "half" | "quarter" | "eighth" | "16th";
  // | "32nd"
  // | "64th"
  // | "128th"
  // | "256th"
  // | "512th"
  // | "1024th";
}

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

export const Note = ({ pitch, noteValue }: NoteProps) => {
  return (
    <div
      className="note-container"
      style={{ flexGrow: noteFlexValue[noteValue] }}
    >
      <div className={"leland note " + pitch.position}>
        {noteGlyphs[noteTranslations[noteValue]]["downStem"]}
      </div>
    </div>
  );
};
