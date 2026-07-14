import "./Tempo.css";
import "../../global.css";
import { metronomeGlyphs } from "../../helpers/glyphs";
import { NoteProps } from "../../helpers/types";

export interface TempoProps {
  // "Allegro", "Andante con moto", ...
  text?: string;
  // together render a metronome mark like ♩ = 120
  beatUnit?: NoteProps["noteValue"];
  beatUnitDotted?: boolean;
  bpm?: number;
}

// Tempo indication above the staff at the measure's start
export const Tempo = ({ text, beatUnit, beatUnitDotted, bpm }: TempoProps) => (
  <div className="tempo-mark">
    {text && <span className="tempo-text">{text}</span>}
    {beatUnit && bpm !== undefined && (
      <span className="tempo-metronome">
        <span className="leland tempo-note">
          {metronomeGlyphs[beatUnit]}
          {beatUnitDotted ? metronomeGlyphs.dot : ""}
        </span>
        {" = "}
        {bpm}
      </span>
    )}
  </div>
);
