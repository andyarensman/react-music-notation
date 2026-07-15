import "./Tempo.css";
import "../../global.css";
import { metronomeGlyphs } from "../../helpers/glyphs";
import { NoteProps } from "../../helpers/types";

export interface TempoProps {
  /** Tempo word(s) in bold serif: "Allegro", "Andante con moto", ... */
  text?: string;
  /** Note value shown in the metronome equation (with `bpm`), e.g. `"quarter"` for ♩ = 120. */
  beatUnit?: NoteProps["noteValue"];
  /** Adds an augmentation dot to the metronome note (♩. = 60). */
  beatUnitDotted?: boolean;
  /** Beats per minute shown in the metronome equation (with `beatUnit`). */
  bpm?: number;
}

/**
 * A tempo indication above the staff at the measure's start: tempo text
 * and/or a metronome equation. Usually driven by `Measure`'s `tempo` prop
 * rather than rendered directly.
 */
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
