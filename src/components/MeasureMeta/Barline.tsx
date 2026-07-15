import "./Barline.css";

/**
 * Barline styles: a single thin line (`"regular"`), two thin lines
 * (`"double"`), thin + thick (`"final"`), and the repeat forms with their
 * dots (`"repeatStart"`/`"repeatEnd"`). Used as `Measure`'s `barline` prop.
 */
export type BarlineType =
  | "regular"
  | "double"
  | "final"
  | "repeatStart"
  | "repeatEnd";

interface BarlineProps {
  /** Barline style to draw. Defaults to `"regular"`. */
  type?: BarlineType;
  /**
   * `"end"` overlays the measure's right edge; `"start"` flows inline after
   * the measure meta (used for repeat starts). Defaults to `"end"`.
   */
  placement?: "start" | "end";
}

const Thin = () => <div className="barline-line"></div>;
const Thick = () => <div className="barline-line barline-line-thick"></div>;
const Dots = () => <div className="barline-dots"></div>;

/**
 * A barline spanning the staff. Usually driven by `Measure`'s `barline` and
 * `startRepeat` props rather than rendered directly; `GrandMeasure` and
 * `ScoreMeasure` stretch it across all their staves.
 */
export const Barline = ({
  type = "regular",
  placement = "end",
}: BarlineProps) => {
  return (
    <div className={`barline barline-${placement}`}>
      {type === "regular" && <Thin />}
      {type === "double" && (
        <>
          <Thin />
          <Thin />
        </>
      )}
      {type === "final" && (
        <>
          <Thin />
          <Thick />
        </>
      )}
      {type === "repeatEnd" && (
        <>
          <Dots />
          <Thin />
          <Thick />
        </>
      )}
      {type === "repeatStart" && (
        <>
          <Thick />
          <Thin />
          <Dots />
        </>
      )}
    </div>
  );
};
