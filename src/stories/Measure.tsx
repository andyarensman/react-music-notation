import React from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
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
      <StaffLines />
      <div className="data-container">
        <div className="meta-container">
          <Clef clef="gClef" />
          <KeySignature fifths={4} />
          <TimeSignature beat="four" beatType="four" />
        </div>
        <div className="notes-container">
          <Note pitch={{ position: "line-1" }} noteValue="half" />
          <Note pitch={{ position: "space-4" }} noteValue="eighth" />
          <Note pitch={{ position: "space-4" }} noteValue="eighth" />
          <Note pitch={{ position: "space-4" }} noteValue="quarter" />
        </div>
      </div>
    </div>
  );
};
