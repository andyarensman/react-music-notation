import { Children, ReactNode, isValidElement, useContext } from "react";
import "./Slur.css";
import {
  getChordStem,
  getDefaultStem,
  positionIndex,
  resolvePosition,
  StemPositions,
} from "../helpers/helpers";
import { ClefType, PitchPosition, StackedNote } from "../helpers/types";
import { ClefContext } from "./ClefContext";
import { BeamContainer } from "./BeamContainer";
import { getEventFlex, getLastLeafFlex } from "./layout";

interface SlurProps {
  /**
   * Which side the curve sits on. Defaults to `"below"` when every stem in
   * the group points up (the slur sits at the noteheads, per Gould),
   * otherwise `"above"`; inside a `Voice`, defaults to the voice's outer
   * side.
   */
  direction?: "above" | "below";
  /**
   * @internal Injected by `Voice` so slurs go on the voice's outer side;
   * not usually set manually.
   */
  stem?: "upStem" | "downStem";
  /** The contiguous run of events under the slur (notes, chords, beam groups). */
  children?: ReactNode;
}

interface SlurNote {
  topPosition: PitchPosition;
  bottomPosition: PitchPosition;
  stemUp: boolean;
}

interface NoteLikeProps {
  noteValue?: unknown;
  rest?: boolean;
  position?: PitchPosition;
  pitch?: StackedNote["pitch"];
  pitches?: StackedNote[];
  stem?: "upStem" | "downStem" | "noStem";
  children?: ReactNode;
}

// Flatten the slurred region to its sounding notes, in order. Notes inside
// a BeamContainer take the beam's stem direction.
const collectNotes = (
  nodes: ReactNode,
  clef: ClefType,
  forcedStem?: "upStem" | "downStem"
): SlurNote[] => {
  const notes: SlurNote[] = [];
  Children.toArray(nodes).forEach((child) => {
    if (!isValidElement<NoteLikeProps>(child)) {
      return;
    }
    const props = child.props;
    if (child.type === BeamContainer) {
      const beamStem =
        props.stem && props.stem !== "noStem" ? props.stem : "upStem";
      notes.push(...collectNotes(props.children, clef, beamStem));
      return;
    }
    if (props.pitches && props.pitches.length > 0) {
      const positions = props.pitches.map((stackedNote) =>
        resolvePosition(stackedNote, clef)
      );
      const sorted = [...positions].sort(
        (a, b) => positionIndex(a) - positionIndex(b)
      );
      const stem =
        props.stem && props.stem !== "noStem"
          ? props.stem
          : forcedStem ?? getChordStem(positions);
      notes.push({
        topPosition: sorted[0],
        bottomPosition: sorted[sorted.length - 1],
        stemUp: stem === "upStem",
      });
      return;
    }
    if (props.noteValue !== undefined) {
      if (props.rest) return;
      const position = resolvePosition(props, clef);
      const stem =
        props.stem && props.stem !== "noStem"
          ? props.stem
          : forcedStem ?? getDefaultStem(position);
      notes.push({
        topPosition: position,
        bottomPosition: position,
        stemUp: stem === "upStem",
      });
      return;
    }
    if (props.children) {
      notes.push(...collectNotes(props.children, clef, forcedStem));
    }
  });
  return notes;
};

/*
  A slur over a contiguous run of events. The curve spans from the first
  notehead to the last leaf notehead (flex ratios give both x positions), in
  the same 129-unit viewBox space the stems use.
*/
const SlurComponent = ({ direction, stem, children }: SlurProps) => {
  const clef = useContext(ClefContext);
  const childArray = Children.toArray(children);
  const totalFlex = childArray.reduce(
    (sum: number, child) => sum + getEventFlex(child),
    0
  );
  const notes = collectNotes(children, clef);

  if (notes.length < 2 || totalFlex === 0) {
    return <>{children}</>;
  }

  const above = direction
    ? direction === "above"
    : stem
      ? stem === "upStem" // voice context: the voice's outer side
      : !notes.every((note) => note.stemUp);

  const first = notes[0];
  const last = notes[notes.length - 1];
  // Anchor near the notehead on the slur side; when the stem is on that
  // side, clear the stem tip instead (Gould: the slur stays at stem ends)
  const anchorY = (note: SlurNote) => {
    const base = StemPositions[above ? note.topPosition : note.bottomPosition];
    if (above) {
      return note.stemUp ? base - 34 : base - 8;
    }
    return note.stemUp ? base + 8 : base + 34;
  };
  const y1 = anchorY(first);
  const y2 = anchorY(last);
  /*
    The curve must stay outside every stem and beam it spans (Gould: a slur
    "should always remain outside a beam"), so the bulge clears the most
    extreme stem-tip line of ALL covered notes, not just the endpoints. For
    beamed notes the beam sits at (or below) the standard tip, so standard
    tips are a safe bound.
  */
  const obstacle = above
    ? Math.min(
        ...notes.map((note) =>
          note.stemUp
            ? StemPositions[note.topPosition] - 28
            : StemPositions[note.topPosition] - 8
        )
      )
    : Math.max(
        ...notes.map((note) =>
          note.stemUp
            ? StemPositions[note.bottomPosition] + 8
            : StemPositions[note.bottomPosition] + 28
        )
      );
  const bulge = above
    ? Math.min(y1, y2, obstacle) - 14
    : Math.max(y1, y2, obstacle) + 14;
  const innerBulge = bulge + (above ? 4 : -4);

  const spanPercentage =
    ((totalFlex - getLastLeafFlex(children)) / totalFlex) * 100;

  return (
    <div
      className="slur-group"
      style={{ flexGrow: totalFlex, display: "flex" }}
    >
      {children}
      <div className="slur-overlay" style={{ width: `${spanPercentage}%` }}>
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="slur-svg">
          {/* cubic so the curve holds its height across the group and only
              rises/falls near the endpoints — keeps it clear of beams that
              end mid-span */}
          <path
            d={`M2,${y1} C25,${bulge} 85,${bulge} 98,${y2} C85,${innerBulge} 25,${innerBulge} 2,${y1} Z`}
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * A slur over a contiguous run of events: the curve spans from the first
 * notehead to the last, staying clear of every stem and beam it covers.
 * Same-measure only — a slur cannot cross a barline yet.
 *
 * @example
 * ```tsx
 * <Slur>
 *   <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
 *   <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
 *   <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
 * </Slur>
 * ```
 */
export const Slur = Object.assign(SlurComponent, {
  musicRole: "slur" as const,
});
