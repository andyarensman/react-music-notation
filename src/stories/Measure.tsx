import React from "react";

interface MeasureProps {
  measureNumber: number;
  key?: number;
  time?: { beats: number; beatType: number };
  clef?: { sign: "G" | "F" | "C" | "percussion" };
}

const Measure = ({}: MeasureProps) => {
  return <p></p>;
};

export default Measure;
