import "./Clef.css";
import "../../global.css";
import { clefGlyphs } from "../../helpers/glyphs";
import { ClefType } from "../../helpers/types";

interface ClefProps {
  /** Which clef glyph to draw: treble, bass, or alto/tenor C clef. */
  clef: ClefType;
}

/**
 * A clef glyph on the staff. Usually driven by `Measure`'s `clef` prop (and
 * restated automatically at system starts) rather than rendered directly.
 */
export const Clef = ({ clef }: ClefProps) => {
  return (
    <div className="clef-container leland">
      <div className={"clef " + clef}>{clefGlyphs[clef]}</div>
    </div>
  );
};
