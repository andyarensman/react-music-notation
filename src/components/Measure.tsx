import { CSSProperties, ReactNode } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Clef } from "./MeasureMeta/Clef";
import { ClefType, KeyRange } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";
import { Tempo, TempoProps } from "./MeasureMeta/Tempo";
import { Volta, EndingProps } from "./MeasureMeta/Volta";
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
  /**
   * Optional identifier for this measure. Currently not rendered by the
   * library (no measure-number glyph is drawn) — reserved for consumers
   * that want to track/display numbering externally.
   */
  measureNumber?: number;
  /**
   * Clef for this measure. When omitted, inherits the running clef from
   * earlier measures (tracked by `Staff`/`GrandStaff`/`Score`), defaulting
   * to `"gClef"` if none has been set yet.
   */
  clef?: ClefType;
  /**
   * @internal Set by `Staff`/`GrandStaff`/`Score` when an earlier measure's
   * clef is still in effect; not usually set manually.
   */
  inheritedClef?: ClefType;
  /**
   * Key signature for this measure. When omitted, inherits the running key
   * from earlier measures, the same way `clef` does.
   */
  fifths?: KeyRange;
  /**
   * @internal Set by `Staff`/`GrandStaff`/`Score`: the key still in effect
   * from earlier measures; not usually set manually.
   */
  inheritedFifths?: KeyRange;
  /** Tempo indication rendered above the staff at the measure's start. */
  tempo?: TempoProps;
  /**
   * Volta (ending) bracket over the measure: a label string (`"1."`) or
   * `EndingProps` for open/continuing brackets spanning several measures.
   */
  ending?: string | EndingProps;
  /**
   * @internal Set by `Staff`/`GrandStaff`/`Score` on the first measure of
   * each system: restate the running clef and key signature.
   */
  systemStart?: boolean;
  /**
   * @internal Set by `Staff`/`GrandStaff`/`Score` for non-justified (loose)
   * final systems; not usually set manually.
   */
  style?: CSSProperties;
  /**
   * Time signature for this measure. Unlike `clef`/`fifths`, time signatures
   * are not restated automatically on later measures or systems — set it
   * again explicitly when the meter changes.
   */
  time?: TimeSignatureProps;
  /**
   * Barline drawn at the measure's right edge. Defaults to `"regular"`.
   * `"none"` is used by `GrandMeasure`/`ScoreMeasure`, which draw one
   * barline spanning all their staves instead of one per `Measure`.
   */
  barline?: BarlineType | "none";
  /** Draws a `"repeatStart"` barline at the measure's left edge. */
  startRepeat?: boolean;
  /**
   * @internal Onset boundaries (in flex units) shared with the other
   * staff(s) of a grand measure or score measure; set by `GrandMeasure`/
   * `ScoreMeasure`. When present, notes lay out on a grid of these columns
   * instead of plain flex, so every staff aligns. Not usually set manually.
   */
  grid?: number[];
  /**
   * @internal Which staff of a grand measure / score measure this is
   * (upper = 0, lower = 1, or the part index); set by `GrandMeasure`/
   * `ScoreMeasure` so the curve overlay can pair cross-measure ties and
   * slurs within one staff. Not usually set manually.
   */
  staffTrack?: number;
  /** The measure's content: `Note`, `NoteStack`, `BeamContainer`, `Voice`, `Tuplet`, `Slur`, and `Hairpin` elements. */
  children?: ReactNode;
}

/**
 * Renders one measure of a single staff: the five staff lines, an optional
 * clef/key-signature/time-signature/tempo header, a barline at the right
 * edge (and optionally a repeat barline at the left), and the measure's
 * notes/rests. Typically used inside a `Staff` (or as the `upper`/`lower`
 * of a `GrandMeasure`, or a part of a `ScoreMeasure`), which supply the
 * running clef/key and system-start behavior automatically.
 *
 * @example
 * ```tsx
 * <Staff>
 *   <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
 *     <Note position="line-4" noteValue="quarter" dotted={1} />
 *     <Note position="space-3" noteValue="eighth" />
 *   </Measure>
 * </Staff>
 * ```
 */
export const Measure = ({
  clef,
  inheritedClef,
  fifths,
  inheritedFifths,
  tempo,
  ending,
  systemStart,
  style,
  time,
  barline,
  startRepeat,
  grid,
  staffTrack,
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
      <div
        className="measure-container"
        data-staff-track={staffTrack}
        style={style}
      >
        <StaffLines />
        {tempo && <Tempo {...tempo} />}
        {ending && (
          <Volta {...(typeof ending === "string" ? { text: ending } : ending)} />
        )}
        {barline !== "none" && (
          <Barline type={barline ?? "regular"} placement="end" />
        )}
        <div className="data-container">
          <div className="meta-container">
            {displayClef && <Clef clef={displayClef} />}
            {/* !! guard: fifths={0} (C major) draws nothing and must not
                render a literal React "0" */}
            {!!displayFifths && (
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
