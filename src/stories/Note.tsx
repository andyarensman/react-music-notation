import React from "react";
import "./Note.css";
import "../global.css";
import { accidentalGlyphs, noteGlyphs } from "../helpers/glyphs";
import {
  BeamPositions,
  getDefaultStem,
  noteFlexValue,
  noteTranslations,
  StemPositions,
} from "../helpers/helpers";
import { NoteProps } from "../helpers/types";

export const Note = (props: NoteProps) => {
  const { noteValue, rest, stemEndValue } = props;
  const position = props.position || "line-3";
  const stem = !rest ? props.stem || getDefaultStem(position) : undefined;
  const pitch = !rest ? props.pitch : null;

  //stems
  const stemStart = StemPositions[position];
  const stemEnd = stemStart + 28; //3 and a half spaces. should be minus if downstem

  return (
    <div
      className="note-container"
      style={{ flexGrow: noteFlexValue[noteValue] }}
    >
      {pitch && pitch.alter && (
        <div className={`leland note ${pitch.alter} ${position}`}>
          {accidentalGlyphs[pitch.alter]}
        </div>
      )}
      <div className={"leland note " + position}>
        {rest
          ? noteGlyphs[noteTranslations[noteValue]]["rest"]
          : noteGlyphs[noteTranslations[noteValue]][stem!]}
      </div>
      {/* {beam && (beam.status === "start" || beam.status === "continue") && (
        <div className={"beam " + (stem === "upStem" ? "beam-above" : "")}>
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="beam"
          >
            <polygon
              points={`0,${topLeftY} 100,${topRightY} 100,${bottomRightY} 0,${bottomLeftY}`}
            />
            {beam.amount > 1 ? (
              <polygon
                points={`0,${topLeftY + nextBeamOffset} 100,${topRightY + nextBeamOffset} 100,${bottomRightY + nextBeamOffset} 0,${bottomLeftY + nextBeamOffset}`}
              />
            ) : (
              ""
            )}
          </svg>
        </div>
      )} */}
      {/* <div style={{ position: "absolute" }}>{stemEndValue}</div> */}
      {stem === "noStem" && stemEndValue && (
        <div
          className={
            "stem-container " + (stemEndValue < stemStart ? "stem-above" : "")
          }
        >
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="stem"
          >
            <line
              x1="0"
              y1={stemStart}
              x2="0"
              y2={stemEndValue}
              stroke="black"
              strokeWidth="2px"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
