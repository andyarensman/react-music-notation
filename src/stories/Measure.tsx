import { ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Clef } from "./MeasureMeta/Clef";
import { ClefType, KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefContext } from "./ClefContext";

interface MeasureProps {
  measureNumber?: number;
  clef?: ClefType;
  // Set by Staff when an earlier measure's clef is still in effect
  inheritedClef?: ClefType;
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  barline?: BarlineType;
  startRepeat?: boolean;
  children?: ReactNode;
}

export const Measure = ({
  clef,
  inheritedClef,
  fifths,
  time,
  barline,
  startRepeat,
  children,
}: MeasureProps) => {
  const activeClef = clef ?? inheritedClef ?? "gClef";

  return (
    <ClefContext.Provider value={activeClef}>
      <div className="measure-container">
        <StaffLines />
        <Barline type={barline ?? "regular"} placement="end" />
        <div className="data-container">
          <div className="meta-container">
            {clef && <Clef clef={clef} />}
            {fifths && <KeySignature fifths={fifths} clef={activeClef} />}
            {time && <TimeSignature {...time} />}
          </div>
          {startRepeat && <Barline type="repeatStart" placement="start" />}
          <div className="notes-container">{children}</div>
        </div>
      </div>
    </ClefContext.Provider>
  );
};
