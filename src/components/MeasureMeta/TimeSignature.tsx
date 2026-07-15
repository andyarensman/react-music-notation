import "./TimeSignature.css";
import "../../global.css";
import {
  timeSignatureNumberGlyphs,
  timeSignatureSymbolGlyphs,
} from "../../helpers/glyphs";

interface BeatAndBeatType {
  /** Beats per measure — the top number (e.g. the `3` in 3/4). */
  beat: number;
  /** The note value of one beat — the bottom number (e.g. the `4` in 3/4). */
  beatType: number;
  /** Not used in the numeric form. */
  timeSymbol?: never;
}

interface TimeSymbol {
  /** Symbolic meter: common time (C, 4/4) or cut time (¢, 2/2). */
  timeSymbol: "common" | "cut";
  /** Not used in the symbolic form. */
  beat?: never;
  /** Not used in the symbolic form. */
  beatType?: never;
}

/**
 * A time signature: either numeric (`{ beat, beatType }`, e.g.
 * `{ beat: 3, beatType: 4 }` for 3/4) or symbolic
 * (`{ timeSymbol: "common" | "cut" }`). Used as `Measure`'s `time` prop.
 */
export type TimeSignatureProps = BeatAndBeatType | TimeSymbol;

/**
 * A time signature on the staff. Usually driven by `Measure`'s `time` prop
 * rather than rendered directly.
 */
export const TimeSignature = ({
  beat,
  beatType,
  timeSymbol,
}: TimeSignatureProps) => {
  const beatArray = beat != null ? beat.toString().split("").map(Number) : null;
  const beatTypeArray =
    beatType != null ? beatType.toString().split("").map(Number) : null;

  let widthMultiplier = 1.5;

  if (beatArray && beatTypeArray) {
    const maxLength = Math.max(beatArray.length, beatTypeArray.length);
    if (maxLength > 0) widthMultiplier *= maxLength;
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
          style={{ width: `calc(var(--staff-space) * ${widthMultiplier})` }}
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
