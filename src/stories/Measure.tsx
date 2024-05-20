import React from "react";
import "./Measure.css";
import { Staff } from "./Staff";
import { Note } from "./Note";
import { Clef } from "./MeasureMeta/Clef";

interface MeasureProps {
  measureNumber?: number;
  key?: number;
  time?: { beats: number; beatType: number };
  clef?: { sign: "G" | "F" | "C" | "percussion" };
}

export const Measure = ({}: MeasureProps) => {
  return (
    <div className="measure-container">
      <Staff />
      <div className="data-container">
        <Clef clef="gClef" />
        <Note pitch={{ position: "line-1" }} noteValue="half" />
        <Note pitch={{ position: "space-4" }} noteValue="half" />
      </div>
    </div>
  );
};
