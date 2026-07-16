import { CSSProperties } from "react";
import "./TabNote.css";
import { getNoteFlex } from "../helpers/helpers";
import { NoteProps } from "../helpers/types";

/** One fretted string of a `TabNote`: string 1 is the top line (high E). */
export interface TabFret {
  /** String number, 1 (top line, highest string) through 6 (bottom line). */
  string: 1 | 2 | 3 | 4 | 5 | 6;
  /** Fret number to print on the string (0 = open). */
  fret: number;
}

interface TabNoteProps {
  /** The strings sounded at this moment, each with its fret number. */
  frets: TabFret[];
  /**
   * Duration of the event — used for horizontal spacing only (rhythm-less
   * tab); no stems or flags are drawn yet.
   */
  noteValue: NoteProps["noteValue"];
  /** Extends the event's spacing by half, like a dotted note. */
  dotted?: 1;
}

/**
 * One tablature event: fret numbers printed on their string lines inside a
 * `Measure` with `clef="tab"`. Takes part in the same duration-proportional
 * flex layout as `Note`, so tab measures align and break into systems like
 * any others. Rhythm-less (no stems); combine with a parallel notation
 * staff when rhythms matter.
 *
 * @example
 * ```tsx
 * <Measure clef="tab" time={{ beat: 4, beatType: 4 }}>
 *   <TabNote noteValue="quarter" frets={[{ string: 5, fret: 3 }]} />
 *   <TabNote
 *     noteValue="half"
 *     frets={[
 *       { string: 4, fret: 5 },
 *       { string: 3, fret: 5 },
 *     ]}
 *   />
 * </Measure>
 * ```
 */
export const TabNote = (props: TabNoteProps) => {
  const { frets, noteValue, dotted } = props;
  const ariaLabel =
    frets.length === 0
      ? `${noteValue} tab event`
      : `${frets
          .map(({ fret, string }) => `fret ${fret} on string ${string}`)
          .join(", ")}, ${dotted ? "dotted " : ""}${noteValue}`;
  return (
    <div
      className="note-container tab-note"
      role="img"
      aria-label={ariaLabel}
      style={{ flexGrow: getNoteFlex(props) } as CSSProperties}
    >
      {frets.map(({ string, fret }) => (
        <div
          key={string}
          className="tab-fret"
          style={{
            // string n's line: half a space above the 5-line staff top,
            // then one staff-space per string
            top: `calc((var(--staff-space) * 12.125 - var(--staff-line-thickness)) / 2 + var(--staff-space) * ${string - 1.5})`,
          }}
        >
          {fret}
        </div>
      ))}
    </div>
  );
};
