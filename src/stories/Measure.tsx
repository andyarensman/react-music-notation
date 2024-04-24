import React from "react";

interface MeasureProps {
  measureNumber?: number;
  key?: number;
  time?: { beats: number; beatType: number };
  clef?: { sign: "G" | "F" | "C" | "percussion" };
}

export const Measure = ({}: MeasureProps) => {
  return <p></p>;
};
