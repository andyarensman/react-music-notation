import React from "react";
import "./KeySignature.css";
import "../../global.css";
import { KeyRange } from "../../helpers/types";
import { accidentalGlyphs } from "../../helpers/glyphs";

interface KeySignatureProps {
  fifths: KeyRange;
}

export const KeySignature = ({ fifths }: KeySignatureProps) => {
  const SharpsOrFlats = fifths > 0 ? "sharp" : "flat";
  const absoluteKey = Math.abs(fifths);

  const keySignatureFifths = Array.from({ length: absoluteKey }, (_, index) => (
    <div key={index} className="leland accidental-container">
      <div className={`accidental ${SharpsOrFlats}-${index}`}>
        {accidentalGlyphs[SharpsOrFlats]}
      </div>
    </div>
  ));

  return <div className="key-signature-container">{keySignatureFifths}</div>;
};
