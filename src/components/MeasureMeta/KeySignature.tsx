import "./KeySignature.css";
import "../../global.css";
import { ClefType, KeyRange } from "../../helpers/types";
import { accidentalGlyphs } from "../../helpers/glyphs";
import { keySignaturePositions } from "../../helpers/helpers";

interface KeySignatureProps {
  /** Sharps (positive) or flats (negative), `-7`..`7`. */
  fifths: KeyRange;
  /** Clef whose accidental positions to use. Defaults to `"gClef"`. */
  clef?: ClefType;
}

/**
 * A key signature: `|fifths|` sharps or flats placed for the given clef.
 * Usually driven by `Measure`'s `fifths` prop (and restated automatically at
 * system starts) rather than rendered directly.
 */
export const KeySignature = ({ fifths, clef = "gClef" }: KeySignatureProps) => {
  const sharpsOrFlats = fifths > 0 ? "sharp" : "flat";
  const absoluteKey = Math.abs(fifths);
  const positions = keySignaturePositions[clef][sharpsOrFlats];

  const keySignatureFifths = positions
    .slice(0, absoluteKey)
    .map((position, index) => (
      <div key={index} className="leland accidental-container">
        <div className={`accidental ${position}`}>
          {accidentalGlyphs[sharpsOrFlats]}
        </div>
      </div>
    ));

  return <div className="key-signature-container">{keySignatureFifths}</div>;
};
