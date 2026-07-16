import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
} from "react";
import {
  applyOttavaShift,
  getBeamCount,
  getNoteFlex,
  leadingMarginSs,
  positionIndex,
  resolvePosition,
} from "../helpers/helpers";
import {
  ClefType,
  GraceNote,
  NoteProps,
  Pitch,
  PitchPosition,
  StackedNote,
} from "../helpers/types";
import "./Note.css";
import { beamCreator } from "../helpers/beamCreator";
import { ClefContext } from "./ClefContext";
import { OttavaContext } from "./OttavaContext";
import { CrossStaffContext } from "./CrossStaffContext";

interface BeamContainerProps {
  /** Two or more `Note`/`NoteStack` elements to beam together. */
  children?: ReactNode;
  /**
   * Stem direction for the whole group. Defaults to `"upStem"`; inside a
   * `Voice` the voice's direction is injected automatically.
   */
  stem?: "upStem" | "downStem";
}

// The prop surface shared by Note and NoteStack that beaming relies on
interface BeamableProps {
  noteValue: NoteProps["noteValue"];
  dotted?: 1;
  position?: PitchPosition;
  pitch?: Pitch;
  pitches?: StackedNote[];
  stem?: "upStem" | "downStem" | "noStem";
  stemEndValue?: number;
  crossStaff?: boolean;
  grace?: GraceNote[];
  clefChange?: ClefType;
  rest?: boolean;
}

const isBeamable = (child: ReactNode): child is ReactElement<BeamableProps> => {
  return (
    isValidElement(child) &&
    (child.props as BeamableProps).noteValue !== undefined
  );
};

const BEAM_THICKNESS = 4; // half a staff-space, in viewBox units
const SECOND_BEAM_GAP = 2; // quarter staff-space between beams
const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Beams a run of eighth-or-shorter notes/chords together: it overrides each
 * child's stem, draws the beam (sloped per engraving rules, clamped to one
 * staff-space of rise), and adds secondary beams for 16ths and 32nds —
 * mixed groups get per-level segments and partial stubs (dotted-8th + 16th
 * works). Beam geometry is margin-exact: accidentals, grace notes, and
 * mid-measure clefs inside the group shift their notes, and the beam
 * segments compensate so every stem meets the beam precisely.
 *
 * @example
 * ```tsx
 * <BeamContainer stem="upStem">
 *   <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
 *   <Note pitch={{ step: "D", octave: 5 }} noteValue="16th" />
 *   <Note pitch={{ step: "E", octave: 5 }} noteValue="16th" />
 * </BeamContainer>
 * ```
 */
export const BeamContainer = ({ stem = "upStem", children }: BeamContainerProps) => {
  const clef = useContext(ClefContext);
  const ottava = useContext(OttavaContext);
  const crossContext = useContext(CrossStaffContext);
  const beamedNotesArray = Children.toArray(children).filter(isBeamable);

  if (beamedNotesArray.length < 2) {
    return <>{children}</>;
  }

  const resolve = (note: { position?: PitchPosition; pitch?: Pitch }) =>
    resolvePosition(applyOttavaShift(note, ottava), clef);

  /*
    Cross-staff groups (some notes marked crossStaff inside a grand
    measure) share one horizontal beam between the staves — a standard
    stem-length beyond this staff's outer line, which is the same spot in
    both staves' coordinates. Stems reach it from both sides; each note's
    stem side falls out of its own head-vs-beam comparison.
  */
  const crossFlags = beamedNotesArray.map((note) =>
    Boolean(note.props.crossStaff)
  );
  const isCross = crossContext !== null && crossFlags.some(Boolean);
  const crossBeamY = crossContext
    ? crossContext.directionSign > 0
      ? 108 // 3.5 staff-spaces below the bottom line, toward the lower staff
      : 20 // 3.5 staff-spaces above the top line, toward the upper staff
    : 0;
  // whether note i's head sits above the beam (stem points down to it)
  const fromAbove = (index: number): boolean =>
    isCross &&
    (crossContext!.directionSign > 0 ? !crossFlags[index] : crossFlags[index]);
  // flip-walk direction each note's chord layout will use
  const walkUpFor = (index: number): boolean =>
    isCross ? !fromAbove(index) : stem === "upStem";

  // The effective position of a chord is its notehead nearest the beam
  const effectivePosition = (props: BeamableProps): PitchPosition => {
    if (props.pitches && props.pitches.length > 0) {
      const positions = props.pitches.map(resolve);
      return positions.reduce((nearest, position) => {
        const closer =
          stem === "upStem"
            ? positionIndex(position) < positionIndex(nearest)
            : positionIndex(position) > positionIndex(nearest);
        return closer ? position : nearest;
      });
    }
    return resolve(props);
  };

  /*
    Geometry, margin-exact. Slot widths are flex-proportional over the
    space REMAINING after each note's leading margin (accidentals, grace
    notes, mid-measure clefs), so a stem's true x is
      W·(cf/F) + ss·(margins so far + own margin + stem side − (cf/F)·ΣM)
    — expressible as calc(% + staff-spaces). Each inter-stem interval
    becomes its own absolutely-positioned beam segment, so every stem
    meets the beam exactly no matter what pushed it sideways.
  */
  const flexes = beamedNotesArray.map((note) => getNoteFlex(note.props));
  const totalFlexGrowth = flexes.reduce((sum, value) => sum + value, 0);
  const margins = beamedNotesArray.map((note, index) =>
    leadingMarginSs(note.props, resolve, walkUpFor(index))
  );
  const marginSum = margins.reduce((sum, value) => sum + value, 0);
  const beamFlexSpan = totalFlexGrowth - flexes[flexes.length - 1];

  const sideSs = (index: number): number => {
    const rightSide = isCross ? !fromAbove(index) : stem === "upStem";
    return rightSide ? 1.25 : 0;
  };

  let cumulativeFlex = 0;
  let cumulativeMargin = 0;
  const stems = beamedNotesArray.map((_, index) => {
    const fraction = cumulativeFlex / totalFlexGrowth;
    const stemInfo = {
      pct: fraction * 100,
      offSs: round2(
        cumulativeMargin + margins[index] + sideSs(index) - fraction * marginSum
      ),
      // interpolation parameter along the beam line (flex-proportional)
      t: beamFlexSpan > 0 ? cumulativeFlex / beamFlexSpan : 0,
    };
    cumulativeFlex += flexes[index];
    cumulativeMargin += margins[index];
    return stemInfo;
  });

  const { topLeftY, topRightY } = isCross
    ? { topLeftY: crossBeamY, topRightY: crossBeamY }
    : beamCreator(
        beamedNotesArray.map((note) => effectivePosition(note.props)),
        stem
      );
  const lineY = (index: number) =>
    round2(topLeftY + (topRightY - topLeftY) * stems[index].t);

  /*
    A cross-staff beam stack (primary at the shared line, secondaries
    stacked below it) is met by stems from both sides, so each stem spans
    the WHOLE stack: stems arriving from above run to the stack's bottom
    edge, stems from below to its top edge.
  */
  const maxBeamLevel = Math.max(
    ...beamedNotesArray.map((note) => getBeamCount(note.props.noteValue))
  );
  const levelOffset = BEAM_THICKNESS + SECOND_BEAM_GAP;
  const crossStackTop = crossBeamY - BEAM_THICKNESS / 2;
  const crossStackBottom =
    crossBeamY + BEAM_THICKNESS / 2 + (maxBeamLevel - 1) * levelOffset;

  const updatedBeamedNotesArray = beamedNotesArray.map((noteElement, index) =>
    cloneElement(noteElement, {
      ...noteElement.props,
      stem: "noStem",
      key: index,
      stemEndValue: isCross
        ? fromAbove(index)
          ? crossStackBottom
          : crossStackTop
        : lineY(index),
    })
  );

  // Beam thickness extends from the stem tips toward the noteheads; a
  // cross-staff beam has stems on both sides, so it centers on the line
  const thickness = isCross
    ? BEAM_THICKNESS
    : stem === "upStem"
      ? BEAM_THICKNESS
      : -BEAM_THICKNESS;
  const baseOffset = isCross ? -BEAM_THICKNESS / 2 : 0;
  // cross-staff stacks always grow downward (the stem-span math above
  // assumes it); normal groups stack toward their noteheads
  const levelSign = isCross ? 1 : stem === "upStem" ? 1 : -1;

  // polygon across one segment's local 0-100 svg space
  const segmentPolygon = (
    y1: number,
    y2: number,
    levelShift: number,
    x1 = 0,
    x2 = 100
  ) => {
    const yA = y1 + (y2 - y1) * (x1 / 100) + levelShift + baseOffset;
    const yB = y1 + (y2 - y1) * (x2 / 100) + levelShift + baseOffset;
    return `${x1},${yA} ${x2},${yB} ${x2},${yB + thickness} ${x1},${yA + thickness}`;
  };

  const beamCount = (index: number) =>
    getBeamCount(beamedNotesArray[index].props.noteValue);
  const stubFlexForLevel: Record<number, number> = { 2: 0.5, 3: 0.25 };
  const levels = Array.from(
    { length: Math.max(0, maxBeamLevel - 1) },
    (_, index) => index + 2
  );

  const segments = beamedNotesArray.slice(0, -1).map((_, k) => {
    const y1 = lineY(k);
    const y2 = lineY(k + 1);
    const shapes: string[] = [segmentPolygon(y1, y2, 0)];
    for (const level of levels) {
      const shift = levelSign * (level - 1) * levelOffset;
      const leftAtLevel = beamCount(k) >= level;
      const rightAtLevel = beamCount(k + 1) >= level;
      if (leftAtLevel && rightAtLevel) {
        shapes.push(segmentPolygon(y1, y2, shift));
        continue;
      }
      // partial stubs for isolated notes at this level, drawn inside the
      // adjacent segment: backward-pointing unless the note starts the group
      const stubPct = (level: number, flex: number) =>
        Math.min(100, ((stubFlexForLevel[level] ?? 0.5) / flex) * 100);
      if (
        leftAtLevel &&
        k === 0 &&
        !rightAtLevel &&
        !(beamCount(0) >= level && beamCount(1) >= level)
      ) {
        // group-opening stub points forward
        shapes.push(
          segmentPolygon(y1, y2, shift, 0, stubPct(level, flexes[k]))
        );
      }
      if (
        rightAtLevel &&
        !leftAtLevel &&
        (k + 1 === beamedNotesArray.length - 1 || beamCount(k + 2) < level)
      ) {
        // isolated note: stub points backward toward this segment's end
        shapes.push(
          segmentPolygon(y1, y2, shift, 100 - stubPct(level, flexes[k]), 100)
        );
      }
    }
    return { k, shapes };
  });

  return (
    <div
      style={{
        flexGrow: totalFlexGrowth,
        display: "flex",
        minWidth: `calc(var(--staff-space) * ${round2(
          2.2 * beamedNotesArray.length + marginSum
        )})`,
      }}
      className="beam-container"
    >
      {updatedBeamedNotesArray}
      {segments.map(({ k, shapes }) => (
        <div
          key={`segment-${k}`}
          className="beam-segment"
          style={{
            left: `calc(${round2(stems[k].pct)}% + var(--staff-space) * ${stems[k].offSs})`,
            width: `calc(${round2(stems[k + 1].pct - stems[k].pct)}% + var(--staff-space) * ${round2(
              stems[k + 1].offSs - stems[k].offSs
            )})`,
          }}
        >
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="beam"
          >
            {shapes.map((points, shapeIndex) => (
              <polygon key={shapeIndex} points={points} />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
};
