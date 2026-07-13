import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { Note } from "./Note";
import { getNoteFlex } from "../helpers/helpers";
import { NoteProps, NoteValueProps } from "../helpers/types";
import "./Note.css";
import { beamCreator } from "../helpers/beamCreator";

interface BeamContainerProps {
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
  stem: "upStem" | "downStem";
}

const isNoteElement = (child: ReactNode): child is ReactElement<NoteProps> => {
  return isValidElement(child) && child.props.noteValue !== undefined;
};

const BEAM_THICKNESS = 4; // half a staff-space, in viewBox units
const SECOND_BEAM_GAP = 2; // quarter staff-space between beams

export const BeamContainer = ({ stem, children }: BeamContainerProps) => {
  const beamedNotesArray = Children.toArray(children).filter(
    isNoteElement
  ) as ReactElement<NoteValueProps>[];

  if (beamedNotesArray.length < 2) {
    return <>{children}</>;
  }

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

  //get the topLeft and topRight values for Beam
  const { topLeftY, topRightY } = beamCreator(beamedNotesArray, stem);

  // Each stem ends on the beam line: interpolate between the beam ends by
  // the note's horizontal position within the beam span
  let flexCounter = 0;
  const updatedBeamedNotesArray = beamedNotesArray.map((noteElement, index) => {
    const ratio = flexCounter / beamFlexSpan;
    const stemEndValue =
      Math.round((topLeftY + (topRightY - topLeftY) * ratio) * 100) / 100;
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
  const beamPolygonPoints = (offset: number) =>
    `0,${topLeftY + offset} 100,${topRightY + offset} 100,${
      topRightY + offset + thickness
    } 0,${topLeftY + offset + thickness}`;

  // 16ths get a second beam, offset further toward the noteheads
  const hasSecondBeam = beamedNotesArray.every(
    (note) => note.props.noteValue === "16th"
  );
  const secondBeamOffset =
    stem === "upStem"
      ? BEAM_THICKNESS + SECOND_BEAM_GAP
      : -(BEAM_THICKNESS + SECOND_BEAM_GAP);

  return (
    <div
      style={{ flexGrow: totalFlexGrowth, display: "flex" }}
      className="beam-container"
    >
      {updatedBeamedNotesArray}
      <div
        className={"beam-new " + (stem === "upStem" ? "beam-above" : "")}
        style={{ width: `${beamWidthPercentage}%` }}
      >
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          <polygon points={beamPolygonPoints(0)} />
          {hasSecondBeam && <polygon points={beamPolygonPoints(secondBeamOffset)} />}
        </svg>
      </div>
    </div>
  );
};
