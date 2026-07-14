import { CSSProperties, ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Clef } from "./MeasureMeta/Clef";
import { ClefType, KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";
import { Tempo, TempoProps } from "./MeasureMeta/Tempo";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefContext } from "./ClefContext";
import { GridContext } from "./GridContext";
import {
  getOnsetBoundaries,
  gridTemplateFromBoundaries,
  hasVoices,
  placeEventsOnGrid,
} from "./layout";

export interface MeasureProps {
  measureNumber?: number;
  clef?: ClefType;
  // Set by Staff/GrandStaff when an earlier measure's clef is still in effect
  inheritedClef?: ClefType;
  fifths?: KeyRange;
  // Set by Staff/GrandStaff: the key still in effect from earlier measures
  inheritedFifths?: KeyRange;
  // Tempo indication rendered above the staff at the measure's start
  tempo?: TempoProps;
  // Set by Staff/GrandStaff on the first measure of each system: restate
  // the running clef and key signature
  systemStart?: boolean;
  // Set by Staff/GrandStaff for non-justified (loose) final systems
  style?: CSSProperties;
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
  inheritedFifths,
  tempo,
  systemStart,
  style,
  time,
  barline,
  startRepeat,
  grid,
  children,
}: MeasureProps) => {
  const activeClef = clef ?? inheritedClef ?? "gClef";
  const displayClef = clef ?? (systemStart ? activeClef : undefined);
  const displayFifths = fifths ?? (systemStart ? inheritedFifths : undefined);
  // Voice layers always lay out on an onset grid (their own union if the
  // measure isn't part of a grand staff) so the voices align with each other
  const voiceMode = hasVoices(children);
  const voiceBoundaries = voiceMode
    ? grid ?? getOnsetBoundaries(children)
    : null;
  const gridMode = !voiceMode && grid !== undefined && grid.length > 1;

  return (
    <ClefContext.Provider value={activeClef}>
      <div className="measure-container" style={style}>
        <StaffLines />
        {tempo && <Tempo {...tempo} />}
        {barline !== "none" && (
          <Barline type={barline ?? "regular"} placement="end" />
        )}
        <div className="data-container">
          <div className="meta-container">
            {displayClef && <Clef clef={displayClef} />}
            {displayFifths && (
              <KeySignature fifths={displayFifths} clef={activeClef} />
            )}
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
            {voiceMode ? (
              <GridContext.Provider value={voiceBoundaries}>
                {children}
              </GridContext.Provider>
            ) : gridMode ? (
              placeEventsOnGrid(children, grid)
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </ClefContext.Provider>
  );
};
