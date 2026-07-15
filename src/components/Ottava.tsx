import { Children, ReactNode } from "react";
import "./Ottava.css";
import { ottavaGlyphs } from "../helpers/glyphs";
import { OttavaContext } from "./OttavaContext";
import { getEventFlex } from "./layout";

/** Which octave line to draw and how far the written pitches shift. */
export type OttavaType = "8va" | "8vb" | "15ma" | "15mb";

// Octaves added to the written octave before resolving staff positions:
// under an 8va the sounding pitch renders one octave lower, etc.
const DISPLAY_SHIFT: Record<OttavaType, number> = {
  "8va": -1,
  "8vb": 1,
  "15ma": -2,
  "15mb": 2,
};

// Width of each label ligature at font-size 4ss (advance / 1000 * 4),
// so the dashed line starts just after it
const LABEL_WIDTH_SS: Record<OttavaType, number> = {
  "8va": 3.4,
  "8vb": 3.4,
  "15ma": 5.3,
  "15mb": 5.2,
};

interface OttavaProps {
  /**
   * `"8va"`/`"15ma"` draw the line above the staff and render pitches one/
   * two octaves lower than written; `"8vb"`/`"15mb"` draw below and render
   * higher. Defaults to `"8va"`.
   */
  type?: OttavaType;
  /** The passage under the octave line. */
  children?: ReactNode;
}

/*
  An octave-shift line: the SMuFL label ligature, a dashed line across the
  group, and a closing hook toward the staff. Pitches inside resolve their
  staff positions through OttavaContext (explicit `position` props are
  unaffected). Timing-transparent for the onset grid, like Slur/Hairpin.
*/
const OttavaComponent = ({ type = "8va", children }: OttavaProps) => {
  const totalFlex = Children.toArray(children).reduce(
    (sum: number, child) => sum + getEventFlex(child),
    0
  );
  const above = type === "8va" || type === "15ma";
  return (
    <div className="ottava-group" style={{ flexGrow: totalFlex }}>
      <OttavaContext.Provider value={DISPLAY_SHIFT[type]}>
        {children}
      </OttavaContext.Provider>
      <div
        className={`ottava-line ${above ? "ottava-above" : "ottava-below"}`}
      >
        <span className="leland ottava-glyph">{ottavaGlyphs[type]}</span>
        <span
          className="ottava-dashes"
          style={{
            left: `calc(var(--staff-space) * ${LABEL_WIDTH_SS[type] + 0.4})`,
          }}
        />
        <span className="ottava-hook" />
      </div>
    </div>
  );
};

/**
 * Wraps a passage in an octave line (8va/8vb/15ma/15mb): the dashed line
 * with its label and closing hook, and the automatic re-octaving of the
 * staff positions beneath it. Give notes their sounding pitch — an 8va
 * passage draws them an octave lower on the staff.
 *
 * @example
 * ```tsx
 * <Ottava type="8va">
 *   <Note pitch={{ step: "C", octave: 6 }} noteValue="quarter" />
 *   <Note pitch={{ step: "E", octave: 6 }} noteValue="quarter" />
 * </Ottava>
 * ```
 */
export const Ottava = Object.assign(OttavaComponent, {
  musicRole: "ottava" as const,
});
