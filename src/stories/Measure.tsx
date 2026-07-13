import { ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Clef } from "./MeasureMeta/Clef";
import { ClefType, KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";

interface MeasureProps {
  measureNumber?: number;
  clef?: ClefType;
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  children?: ReactNode;
}

export const Measure = ({ clef, fifths, time, children }: MeasureProps) => {
  return (
    <div className="measure-container">
      <StaffLines />
      <div className="data-container">
        <div className="meta-container">
          {clef && <Clef clef={clef} />}
          {fifths && <KeySignature fifths={fifths} clef={clef} />}
          {time && <TimeSignature {...time} />}
        </div>
        <div className="notes-container">{children}</div>
      </div>
    </div>
  );
};
