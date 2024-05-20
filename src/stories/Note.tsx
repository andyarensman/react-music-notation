import React from "react";
import "./Note.css";
import "../global.css";
import { Staff } from "./Staff";
import { clefGlyphs, noteGlyphs } from "../helpers/glyphs";

interface NoteProps {
  pitch: {
    step?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    alter?: -1 | 1;
    octave?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    position:
      | "line-above-1"
      | "space-above-1"
      | "line-5"
      | "space-5"
      | "line-4"
      | "space-4"
      | "line-3"
      | "space-2"
      | "line-2"
      | "space-1"
      | "line-1"
      | "space-below-1"
      | "line-below-1";
  };
  noteValue:
    | "whole"
    | "half"
    | "quarter"
    | "eighth"
    | "16th"
    | "32nd"
    | "64th"
    | "128th"
    | "256th"
    | "512th"
    | "1024th";
}

export const Note = ({ pitch, noteValue }: NoteProps) => {
  return (
    <div className="note-container">
      <div className={"leland note " + pitch.position}>
        {noteGlyphs.halfNote.downStem}
      </div>
    </div>
  );
};
