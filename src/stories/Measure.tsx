import React from "react";
import "./Measure.css";
import { Staff } from "./Staff";
import { Note } from "./Note";
import { Clef } from "./MeasureMeta/Clef";
import { KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature } from "./MeasureMeta/TimeSignature";

interface MeasureProps {
  measureNumber?: number;
  // fifths?: KeyRange;
  time?: { beats: number; beatType: number };
  clef?: { sign: "G" | "F" | "C" | "percussion" };
}

export const Measure = ({}: MeasureProps) => {
  return (
    <div className="measure-container">
      <Staff />
      <div className="data-container">
        <Clef clef="gClef" />
        <KeySignature fifths={4} />
        <TimeSignature beat="three" beatType="four" />
        <Note pitch={{ position: "line-1" }} noteValue="half" />
        <Note pitch={{ position: "space-4" }} noteValue="half" />
      </div>
    </div>
  );
};
