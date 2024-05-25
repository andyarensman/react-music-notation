import React from "react";
import "./TimeSignature.css";
import "../../global.css";
import {
  timeSignatureNumberGlyphs,
  timeSignatureSymbolGlyphs,
} from "../../helpers/glyphs";

interface BeatAndBeatType {
  beat: number;
  beatType: number;
  timeSymbol?: never;
}

interface TimeSymbol {
  timeSymbol: "common" | "cut";
  beat?: never;
  beatType?: never;
}

export type TimeSignatureProps = BeatAndBeatType | TimeSymbol;

export const TimeSignature = ({
  beat,
  beatType,
  timeSymbol,
}: TimeSignatureProps) => {
  const beatArray = beat != null ? beat.toString().split("").map(Number) : null;
  const beatTypeArray =
    beatType != null ? beatType.toString().split("").map(Number) : null;

  let width = 12;

  if (beatArray && beatTypeArray) {
    const maxLength = Math.max(beatArray.length, beatTypeArray.length);
    if (maxLength > 0) width *= maxLength;
  }

  return (
    <>
      {timeSymbol && (
        <div className="time-signature-container leland symbol-container">
          {timeSignatureSymbolGlyphs[timeSymbol]}
        </div>
      )}
      {beatArray && beatTypeArray && (
        <div
          className="normal-time-signature-container leland"
          style={{ width: `${width}px` }}
        >
          <div className="number-container number-top">
            {beatArray.map((n) => timeSignatureNumberGlyphs[n])}
          </div>
          <div className="number-container number-bottom">
            {beatTypeArray.map((n) => timeSignatureNumberGlyphs[n])}
          </div>
        </div>
      )}
    </>
  );
};
