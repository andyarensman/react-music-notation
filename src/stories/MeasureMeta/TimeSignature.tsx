import React from "react";
import "./TimeSignature.css";
import "../../global.css";
import { SingleDigitString } from "../../helpers/types";
import { timeSignatureGlyphs } from "../../helpers/glyphs";

interface BeatAndBeatType {
  beat: SingleDigitString;
  beatType: SingleDigitString;
  timeSymbol?: never;
}

interface TimeSymbol {
  timeSymbol: "common" | "cut";
  beat?: never;
  beatType?: never;
}

type TimeSignatureProps = BeatAndBeatType | TimeSymbol;

export const TimeSignature = ({
  beat,
  beatType,
  timeSymbol,
}: TimeSignatureProps) => {
  return (
    <>
      {timeSymbol && (
        <div className="time-signature-container leland">
          {timeSignatureGlyphs[timeSymbol]}
        </div>
      )}
      {beat && (
        <div className="normal-time-signature-container leland">
          <div className="number-container number-top">
            {timeSignatureGlyphs[beat]}
          </div>
          <div className="number-container number-bottom">
            {timeSignatureGlyphs[beatType]}
          </div>
        </div>
      )}
    </>
  );
};
