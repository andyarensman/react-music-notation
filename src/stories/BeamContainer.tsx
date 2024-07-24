import React, {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { Note } from "./Note";
import { noteFlexValue } from "../helpers/helpers";
import { NoteProps, NoteValueProps } from "../helpers/types";
import "./Note.css";
import { beamCreator } from "../helpers/beamCreator";

interface BeamContainerProps {
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
}

//! I don't fully understand wha't happening here, need to review
const isNoteElement = (child: ReactNode): child is ReactElement<NoteProps> => {
  return isValidElement(child) && child.props.noteValue !== undefined;
};

export const BeamContainer = ({ children }: BeamContainerProps) => {
  // Handle the flexGrow
  const beamedNotesArray = Children.toArray(children).filter(
    isNoteElement
  ) as ReactElement<NoteValueProps>[];
  const totalFlexGrowth = beamedNotesArray.reduce(
    (sum, child) => sum + noteFlexValue[child.props.noteValue],
    0
  );

  //handle width of Beam
  const finalChildFlex =
    noteFlexValue[
      beamedNotesArray[beamedNotesArray.length - 1].props.noteValue
    ];
  const beamWidthPercentage =
    ((totalFlexGrowth - finalChildFlex) / totalFlexGrowth) * 100;

  //get the topLeft and topRight values for Beam
  const beamValues = beamCreator(beamedNotesArray, "upStem");

  //beaming values
  const beamThickness = 4;
  const topLeftY = beamValues.topLeftY;
  const topRightY = beamValues.topRightY;
  const bottomLeftY = topLeftY + beamThickness;
  const bottomRightY = topRightY + beamThickness;

  //! const nextBeamOffset = stem === "upStem" ? 6 : -6; //beamThickness + beamThickness / 2

  return (
    <div
      style={{ flexGrow: totalFlexGrowth, display: "flex" }}
      className="beam-container"
    >
      {children}
      <div
        className="beam-new beam-above" /*! Beam-above should be conditional */
        style={{ width: `${beamWidthPercentage}%` }}
      >
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          <polygon
            points={`0,${topLeftY} 100,${topRightY} 100,${bottomRightY} 0,${bottomLeftY}`}
          />
        </svg>
      </div>
    </div>
  );
};
