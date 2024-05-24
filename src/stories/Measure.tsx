import React, { ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Note } from "./Note";
import { Clef } from "./MeasureMeta/Clef";
import { KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";

interface MeasureProps {
  measureNumber?: number;
  clef?: "gClef" | "fClef" | "cClef";
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  children?: ReactNode;
}

export const Measure = ({
  measureNumber,
  clef,
  fifths,
  time,
  children,
}: MeasureProps) => {
  return (
    <div className="measure-container">
      <StaffLines />
      <div className="data-container">
        <div className="meta-container">
          {clef && <Clef clef={clef} />}
          {fifths && <KeySignature fifths={fifths} />}
          {time && <TimeSignature {...time} />}
        </div>
        <div className="notes-container">{children}</div>
      </div>
    </div>
  );
};
