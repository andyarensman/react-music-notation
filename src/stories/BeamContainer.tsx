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

interface BeamContainerProps {
  children?: ReactNode;
  // Optional so a surrounding Voice can inject its direction
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
}

const isBeamable = (child: ReactNode): child is ReactElement<BeamableProps> => {
  return (
    isValidElement(child) &&
    (child.props as BeamableProps).noteValue !== undefined
  );
};

const BEAM_THICKNESS = 4; // half a staff-space, in viewBox units
const SECOND_BEAM_GAP = 2; // quarter staff-space between beams

export const BeamContainer = ({ stem = "upStem", children }: BeamContainerProps) => {
  const clef = useContext(ClefContext);
  const beamedNotesArray = Children.toArray(children).filter(isBeamable);

  if (beamedNotesArray.length < 2) {
    return <>{children}</>;
  }

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

  const { topLeftY, topRightY } = beamCreator(
    beamedNotesArray.map((note) => effectivePosition(note.props)),
    stem
  );

  // Each stem ends on the beam line: interpolate between the beam ends by
  // the note's horizontal position within the beam span. stemXs are the
  // stem positions in the beam svg's 0-100 x space
  const stemXs: number[] = [];
  let flexCounter = 0;
  const updatedBeamedNotesArray = beamedNotesArray.map((noteElement, index) => {
    const x = (flexCounter / beamFlexSpan) * 100;
    stemXs.push(x);
    const stemEndValue =
      Math.round((topLeftY + ((topRightY - topLeftY) * x) / 100) * 100) / 100;
    flexCounter += getNoteFlex(noteElement.props);

    return cloneElement(noteElement, {
      ...noteElement.props,
      stem: "noStem",
      key: index,
      stemEndValue: stemEndValue,
    });
  });

  // Beam thickness extends from the stem tips toward the noteheads
  const thickness = stem === "upStem" ? BEAM_THICKNESS : -BEAM_THICKNESS;
  const yAt = (x: number) => topLeftY + ((topRightY - topLeftY) * x) / 100;
  const polygonPoints = (x1: number, x2: number, offset: number) =>
    `${x1},${yAt(x1) + offset} ${x2},${yAt(x2) + offset} ${x2},${
      yAt(x2) + offset + thickness
    } ${x1},${yAt(x1) + offset + thickness}`;

  /*
    Secondary (16th) beams: consecutive runs of 16ths share a beam segment;
    an isolated 16th gets a partial stub half a 16th wide, pointing back
    toward the previous note (or forward when it starts the group).
  */
  const secondBeamOffset =
    stem === "upStem"
      ? BEAM_THICKNESS + SECOND_BEAM_GAP
      : -(BEAM_THICKNESS + SECOND_BEAM_GAP);
  const stubWidth = (0.5 / beamFlexSpan) * 100;

  const secondarySegments: Array<[number, number]> = [];
  let runStart: number | null = null;
  beamedNotesArray.forEach((note, index) => {
    if (getBeamCount(note.props.noteValue) >= 2) {
      if (runStart === null) runStart = index;
      if (index !== beamedNotesArray.length - 1) return;
    }
    if (runStart === null) return;
    const runEnd =
      getBeamCount(note.props.noteValue) >= 2 ? index : index - 1;
    if (runEnd > runStart) {
      secondarySegments.push([stemXs[runStart], stemXs[runEnd]]);
    } else {
      secondarySegments.push(
        runStart === 0
          ? [stemXs[runStart], stemXs[runStart] + stubWidth]
          : [stemXs[runStart] - stubWidth, stemXs[runStart]]
      );
    }
    runStart = null;
  });

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
        className={"beam-new " + (stem === "upStem" ? "beam-above" : "")}
        style={{ width: `${beamWidthPercentage}%` }}
      >
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          <polygon points={polygonPoints(0, 100, 0)} />
          {secondarySegments.map(([x1, x2], index) => (
            <polygon key={index} points={polygonPoints(x1, x2, secondBeamOffset)} />
          ))}
        </svg>
      </div>
    </div>
  );
};
