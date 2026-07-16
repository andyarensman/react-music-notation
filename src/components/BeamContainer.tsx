import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
} from "react";
import {
  getBeamCount,
  getNoteFlex,
  positionIndex,
  resolvePosition,
} from "../helpers/helpers";
import {
  NoteProps,
  Pitch,
  PitchPosition,
  StackedNote,
} from "../helpers/types";
import "./Note.css";
import { beamCreator } from "../helpers/beamCreator";
import { ClefContext } from "./ClefContext";
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
}

const isBeamable = (child: ReactNode): child is ReactElement<BeamableProps> => {
  return (
    isValidElement(child) &&
    (child.props as BeamableProps).noteValue !== undefined
  );
};

const BEAM_THICKNESS = 4; // half a staff-space, in viewBox units
const SECOND_BEAM_GAP = 2; // quarter staff-space between beams

/**
 * Beams a run of eighth-or-shorter notes/chords together: it overrides each
 * child's stem, draws the beam (sloped per engraving rules, clamped to one
 * staff-space of rise), and adds secondary beams for 16ths and 32nds —
 * mixed groups get per-level segments and partial stubs (dotted-8th + 16th
 * works).
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
  const crossContext = useContext(CrossStaffContext);
  const beamedNotesArray = Children.toArray(children).filter(isBeamable);

  if (beamedNotesArray.length < 2) {
    return <>{children}</>;
  }

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

  // The effective position of a chord is its notehead nearest the beam
  const effectivePosition = (props: BeamableProps): PitchPosition => {
    if (props.pitches && props.pitches.length > 0) {
      const positions = props.pitches.map((stackedNote) =>
        resolvePosition(stackedNote, clef)
      );
      return positions.reduce((nearest, position) => {
        const closer =
          stem === "upStem"
            ? positionIndex(position) < positionIndex(nearest)
            : positionIndex(position) > positionIndex(nearest);
        return closer ? position : nearest;
      });
    }
    return resolvePosition(props, clef);
  };

  const totalFlexGrowth = beamedNotesArray.reduce(
    (sum, child) => sum + getNoteFlex(child.props),
    0
  );

  // The beam spans from the first stem to the last stem, i.e. everything
  // except the final note's width. Widths are proportional to flex-grow
  // (flex-basis is 0), so all beam geometry can be derived from flex ratios
  const finalChildFlex = getNoteFlex(
    beamedNotesArray[beamedNotesArray.length - 1].props
  );
  const beamFlexSpan = totalFlexGrowth - finalChildFlex;
  const beamWidthPercentage = (beamFlexSpan / totalFlexGrowth) * 100;

  const { topLeftY, topRightY } = isCross
    ? { topLeftY: crossBeamY, topRightY: crossBeamY }
    : beamCreator(
        beamedNotesArray.map((note) => effectivePosition(note.props)),
        stem
      );

  /*
    A cross-staff beam stack (primary at the shared line, secondaries
    stacked below it) is met by stems from both sides, so each stem must
    span the WHOLE stack: stems arriving from above run to the stack's
    bottom edge, stems from below to its top edge — otherwise a stem
    connects only the near beam and the far one floats.
  */
  const crossMaxLevel = Math.max(
    ...beamedNotesArray.map((note) => getBeamCount(note.props.noteValue))
  );
  const crossStackTop = crossBeamY - BEAM_THICKNESS / 2;
  const crossStackBottom =
    crossBeamY +
    BEAM_THICKNESS / 2 +
    (crossMaxLevel - 1) * (BEAM_THICKNESS + SECOND_BEAM_GAP);

  // Each stem ends on the beam line: interpolate between the beam ends by
  // the note's horizontal position within the beam span. stemXs are the
  // stem positions in the beam svg's 0-100 x space
  const stemXs: number[] = [];
  let flexCounter = 0;
  const updatedBeamedNotesArray = beamedNotesArray.map((noteElement, index) => {
    const x = (flexCounter / beamFlexSpan) * 100;
    stemXs.push(x);
    const fromAbove =
      isCross &&
      (crossContext!.directionSign > 0 ? !crossFlags[index] : crossFlags[index]);
    const stemEndValue = isCross
      ? fromAbove
        ? crossStackBottom
        : crossStackTop
      : Math.round((topLeftY + ((topRightY - topLeftY) * x) / 100) * 100) / 100;
    flexCounter += getNoteFlex(noteElement.props);

    return cloneElement(noteElement, {
      ...noteElement.props,
      stem: "noStem",
      key: index,
      stemEndValue: stemEndValue,
    });
  });

  // x offset (in staff-spaces) of a note's stem from its slot's left edge:
  // up/right stems sit one notehead width in, down/left stems at the edge
  const stemSideSs = (index: number): number => {
    const rightSide = isCross
      ? crossContext!.directionSign > 0
        ? crossFlags[index]
        : !crossFlags[index]
      : stem === "upStem";
    return rightSide ? 1.25 : 0;
  };
  const firstStemSideSs = stemSideSs(0);
  const lastStemSideSs = stemSideSs(beamedNotesArray.length - 1);

  // Beam thickness extends from the stem tips toward the noteheads; a
  // cross-staff beam has stems on both sides, so it centers on the line
  const thickness = isCross
    ? BEAM_THICKNESS
    : stem === "upStem"
      ? BEAM_THICKNESS
      : -BEAM_THICKNESS;
  const crossCenter = isCross ? -BEAM_THICKNESS / 2 : 0;
  const yAt = (x: number) => topLeftY + ((topRightY - topLeftY) * x) / 100;
  const polygonPoints = (x1: number, x2: number, offset: number) =>
    `${x1},${yAt(x1) + offset + crossCenter} ${x2},${yAt(x2) + offset + crossCenter} ${x2},${
      yAt(x2) + offset + crossCenter + thickness
    } ${x1},${yAt(x1) + offset + crossCenter + thickness}`;

  /*
    Secondary beams (16ths get a second, 32nds a third): consecutive runs of
    notes carrying that beam level share a segment; an isolated note gets a
    partial stub half its own width, pointing back toward the previous note
    (or forward when it starts the group).
  */
  // cross-staff stacks always grow downward (the stem-span math above
  // assumes it); normal groups stack toward their noteheads
  const levelSign = isCross ? 1 : stem === "upStem" ? 1 : -1;
  const levelOffset = BEAM_THICKNESS + SECOND_BEAM_GAP;
  const maxBeamLevel = Math.max(
    ...beamedNotesArray.map((note) => getBeamCount(note.props.noteValue))
  );
  const stubFlexForLevel: Record<number, number> = { 2: 0.5, 3: 0.25 };

  const segmentsForLevel = (level: number): Array<[number, number]> => {
    const stubWidth = ((stubFlexForLevel[level] ?? 0.5) / beamFlexSpan) * 100;
    const segments: Array<[number, number]> = [];
    let runStart: number | null = null;
    beamedNotesArray.forEach((note, index) => {
      const atLevel = getBeamCount(note.props.noteValue) >= level;
      if (atLevel) {
        if (runStart === null) runStart = index;
        if (index !== beamedNotesArray.length - 1) return;
      }
      if (runStart === null) return;
      const runEnd = atLevel ? index : index - 1;
      if (runEnd > runStart) {
        segments.push([stemXs[runStart], stemXs[runEnd]]);
      } else {
        segments.push(
          runStart === 0
            ? [stemXs[runStart], stemXs[runStart] + stubWidth]
            : [stemXs[runStart] - stubWidth, stemXs[runStart]]
        );
      }
      runStart = null;
    });
    return segments;
  };

  const extraBeamLevels = Array.from(
    { length: Math.max(0, maxBeamLevel - 1) },
    (_, index) => index + 2
  );

  return (
    <div
      style={{
        flexGrow: totalFlexGrowth,
        display: "flex",
        minWidth: `calc(var(--staff-space) * ${2.2 * beamedNotesArray.length})`,
      }}
      className="beam-container"
    >
      {updatedBeamedNotesArray}
      <div
        className="beam-new"
        style={{
          // The beam runs from the first stem to the last stem. Up/right
          // stems sit one notehead width inside their slot, so each end
          // shifts by its own note's stem side — cross-staff groups mix
          // sides, so a single group-wide shift would overhang an end.
          marginLeft: firstStemSideSs
            ? `calc(var(--staff-space) * ${firstStemSideSs})`
            : undefined,
          width: `calc(${beamWidthPercentage}% + var(--staff-space) * ${
            lastStemSideSs - firstStemSideSs
          })`,
        }}
      >
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          <polygon points={polygonPoints(0, 100, 0)} />
          {extraBeamLevels.map((level) =>
            segmentsForLevel(level).map(([x1, x2], index) => (
              <polygon
                key={`${level}-${index}`}
                points={polygonPoints(
                  x1,
                  x2,
                  levelSign * (level - 1) * levelOffset
                )}
              />
            ))
          )}
        </svg>
      </div>
    </div>
  );
};
