import "./Barline.css";

export type BarlineType =
  | "regular"
  | "double"
  | "final"
  | "repeatStart"
  | "repeatEnd";

interface BarlineProps {
  type?: BarlineType;
  // "end" overlays the measure's right edge; "start" flows inline after the
  // measure meta (used for repeat starts)
  placement?: "start" | "end";
}

const Thin = () => <div className="barline-line"></div>;
const Thick = () => <div className="barline-line barline-line-thick"></div>;
const Dots = () => <div className="barline-dots"></div>;

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
