import React, {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { Note } from "./Note";
import { noteFlexValue } from "../helpers/helpers";
import { NoteProps, NoteValueProps } from "../helpers/types";
import "./Note.css";
import { beamCreator } from "../helpers/beamCreator";

interface BeamContainerProps {
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
  stem: "upStem" | "downStem";
}

//! I don't fully understand what's happening here, need to review
const isNoteElement = (child: ReactNode): child is ReactElement<NoteProps> => {
  return isValidElement(child) && child.props.noteValue !== undefined;
};

export const BeamContainer = ({ stem, children }: BeamContainerProps) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const [beamContainerWidth, setContainerBeamWidth] = useState<number>(0);
  const [angleRadians, setAngleRadians] = useState<number>(0);

  //Get the current container width
  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (entries[0].target === refContainer.current) {
        setContainerBeamWidth(entries[0].contentRect.width);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (refContainer.current) {
      resizeObserver.observe(refContainer.current);
    }

    return () => {
      if (refContainer.current) {
        resizeObserver.unobserve(refContainer.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

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
  const beamValues = beamCreator(beamedNotesArray, stem);

  //beaming values
  const beamThickness = 4;
  const topLeftY = beamValues.topLeftY;
  const topRightY = beamValues.topRightY;
  const bottomLeftY = topLeftY + beamThickness;
  const bottomRightY = topRightY + beamThickness;

  const nextBeamOffset = stem === "upStem" ? 6 : -6; //beamThickness + beamThickness / 2

  //set the Radians
  useEffect(() => {
    // const beamHeight = topLeftY - topRightY;
    // const hypotenuse = Math.sqrt(
    //   beamContainerWidth * beamContainerWidth + beamHeight * beamHeight
    // );
    // const newAngleRadians = Math.acos(beamContainerWidth / hypotenuse);
    // setAngleRadians(newAngleRadians);
    const beamHeight = topLeftY - topRightY;

    const newAngleRadians = Math.abs(
      Math.atan2(beamHeight, beamContainerWidth)
    );

    setAngleRadians(newAngleRadians);
  }, [topLeftY, topRightY, beamContainerWidth]);

  //assign stem values to each child. topLeftY is my base value

  let widthCounter = 0;
  let positiveBeamAngle = topRightY < topLeftY;
  const beamFlexAmount =
    totalFlexGrowth -
    noteFlexValue[
      beamedNotesArray[beamedNotesArray.length - 1].props.noteValue
    ];

  const updatedBeamedNotesArray = beamedNotesArray.map((noteElement, index) => {
    //get the total distance from the left
    const exactHeight = widthCounter * Math.tan(angleRadians);
    const stemAdditionalValue = Math.round(exactHeight * 100) / 100;

    let stemEndValue: number;
    if (positiveBeamAngle) {
      stemEndValue = topLeftY - stemAdditionalValue;
    } else {
      stemEndValue = topLeftY + stemAdditionalValue;
    }

    //increment width counter. percentage of beamContainerWidth. totalFlexGrowth
    const currentNoteFlexValue = noteFlexValue[noteElement.props.noteValue];

    const fraction = currentNoteFlexValue / beamFlexAmount;
    widthCounter += beamContainerWidth * fraction;

    return cloneElement(noteElement, {
      ...noteElement.props,
      stem: "noStem",
      key: index,
      stemEndValue: stemEndValue,
    });
  });

  return (
    <div
      style={{ flexGrow: totalFlexGrowth, display: "flex" }}
      className="beam-container"
    >
      {updatedBeamedNotesArray}
      <div
        className={"beam-new " + (stem === "upStem" ? "beam-above" : "")}
        style={{ width: `${beamWidthPercentage}%` }}
        ref={refContainer}
      >
        <svg viewBox="0 0 100 129" preserveAspectRatio="none" className="beam">
          {stem === "upStem" ? (
            <polygon
              points={`0,${topLeftY} 100,${topRightY} 100,${bottomRightY} 0,${bottomLeftY}`}
            />
          ) : (
            <polygon
              points={`0,${topLeftY - 4} 100,${topRightY - 4} 100,${bottomRightY - 4} 0,${bottomLeftY - 4}`}
            />
          )}
        </svg>
      </div>
      {/* <div style={{ position: "absolute" }}>
        {angleRadians * (180 / Math.PI)}
      </div> */}
    </div>
  );
};
