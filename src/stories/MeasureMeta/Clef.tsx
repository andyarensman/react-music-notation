import "./Clef.css";
import "../../global.css";
import { clefGlyphs } from "../../helpers/glyphs";
import { ClefType } from "../../helpers/types";

interface ClefProps {
  clef: ClefType;
}

export const Clef = ({ clef }: ClefProps) => {
  return (
    <div className="clef-container leland">
      <div className={"clef " + clef}>{clefGlyphs[clef]}</div>
    </div>
  );
};
