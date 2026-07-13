import { ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Clef } from "./MeasureMeta/Clef";
import { ClefType, KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefContext } from "./ClefContext";
import { gridTemplateFromBoundaries, placeEventsOnGrid } from "./layout";

export interface MeasureProps {
  measureNumber?: number;
  clef?: ClefType;
  // Set by Staff/GrandStaff when an earlier measure's clef is still in effect
  inheritedClef?: ClefType;
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  // "none" is used by GrandMeasure, which draws one barline across both staves
  barline?: BarlineType | "none";
  startRepeat?: boolean;
  // Onset boundaries (in flex units) shared with the other staff of a grand
  // measure; set by GrandMeasure. When present the notes lay out on a grid
  // of these columns instead of plain flex, so both staves align.
  grid?: number[];
  children?: ReactNode;
}

export const Measure = ({
  clef,
  inheritedClef,
  fifths,
  time,
  barline,
  startRepeat,
  grid,
  children,
}: MeasureProps) => {
  const activeClef = clef ?? inheritedClef ?? "gClef";
  const gridMode = grid !== undefined && grid.length > 1;

  return (
    <ClefContext.Provider value={activeClef}>
      <div className="measure-container">
        <StaffLines />
        {barline !== "none" && (
          <Barline type={barline ?? "regular"} placement="end" />
        )}
        <div className="data-container">
          <div className="meta-container">
            {clef && <Clef clef={clef} />}
            {fifths && <KeySignature fifths={fifths} clef={activeClef} />}
            {time && <TimeSignature {...time} />}
          </div>
          {startRepeat && <Barline type="repeatStart" placement="start" />}
          <div
            className="notes-container"
            style={
              gridMode
                ? {
                    display: "grid",
                    gridTemplateColumns: gridTemplateFromBoundaries(grid),
                  }
                : undefined
            }
          >
            {gridMode ? placeEventsOnGrid(children, grid) : children}
          </div>
        </div>
      </div>
    </ClefContext.Provider>
  );
};
