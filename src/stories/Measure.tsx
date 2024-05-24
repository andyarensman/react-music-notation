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
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  clef?: "gClef" | "fClef" | "cClef";
  children?: ReactNode;
}

export const Measure = ({
  measureNumber,
  fifths,
  time,
  clef,
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
