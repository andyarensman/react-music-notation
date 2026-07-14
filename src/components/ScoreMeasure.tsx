import { CSSProperties, ReactElement, cloneElement } from "react";
import "./Score.css";
import { MeasureProps } from "./Measure";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefType, KeyRange } from "../helpers/types";
import { getOnsetBoundaries, unionBoundaries } from "./layout";

// Vertical distance from one part's staff to the next (their 16.125
// staff-space line boxes overlap by 4, leaving an 8 staff-space gap)
export const PART_STRIDE_SS = 12.125;

export interface ScoreMeasureProps {
  // One Measure per part, top staff first
  parts: ReactElement<MeasureProps>[];
  barline?: BarlineType;
  startRepeat?: boolean;
  // Set by Score: running clef/key per part, system-start restating, and
  // loose-system sizing
  inheritedClefs?: ClefType[];
  inheritedFifths?: (KeyRange | undefined)[];
  systemStart?: boolean;
  style?: CSSProperties;
}

/*
  One measure of a multi-part score: every part shares the union onset grid
  so simultaneous notes align across all staves, and one barline spans from
  the top staff to the bottom staff.
*/
export const ScoreMeasure = ({
  parts,
  barline,
  startRepeat,
  inheritedClefs,
  inheritedFifths,
  systemStart,
  style,
}: ScoreMeasureProps) => {
  const boundaries = parts
    .map((part) => getOnsetBoundaries(part.props.children))
    .reduce(unionBoundaries);

  // Repeat-end dots belong on each staff individually
  const perStaffBarline = barline === "repeatEnd";
  const barlineHeight = `calc(var(--staff-space) * ${
    4 + (parts.length - 1) * PART_STRIDE_SS
  } + var(--staff-line-thickness))`;

  return (
    <div
      className="score-measure"
      style={
        {
          ...style,
          "--score-barline-height": barlineHeight,
        } as CSSProperties
      }
    >
      {parts.map((part, index) => (
        <div
          key={index}
          className={
            index > 0 ? "score-part score-part-following" : "score-part"
          }
        >
          {cloneElement(part, {
            grid: boundaries,
            barline: perStaffBarline ? "repeatEnd" : "none",
            startRepeat,
            inheritedClef: inheritedClefs?.[index],
            inheritedFifths: inheritedFifths?.[index],
            systemStart,
          })}
        </div>
      ))}
      {!perStaffBarline && (
        <Barline type={barline ?? "regular"} placement="end" />
      )}
    </div>
  );
};
