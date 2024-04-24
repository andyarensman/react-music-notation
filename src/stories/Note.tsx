import React from "react";

interface NoteProps {
  pitch: {
    step: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    alter?: -1 | 1;
    octave: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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
    <p>
      {noteValue}
      {pitch.step}
      {pitch.octave}
    </p>
  );
};
