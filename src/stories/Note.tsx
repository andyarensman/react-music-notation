import React from "react";

interface NoteProps {
  pitch: {
    step: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    alter?: -1 | 1;
    octave: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  };
}

export const Note = ({ pitch }: NoteProps) => {
  return (
    <p>
      {pitch.step}
      {pitch.octave}
    </p>
  );
};
