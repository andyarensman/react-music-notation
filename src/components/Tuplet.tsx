import { Children, ReactNode } from "react";
import "./Tuplet.css";
import { tupletGlyphs } from "../helpers/glyphs";
import { getEventFlex } from "./layout";

interface TupletProps {
  // [actual, normal]: e.g. [3, 2] plays three notes in the time of two
  ratio: [number, number];
  position?: "above" | "below";
  // Injected by Voice: the bracket defaults to the voice's outer side
  stem?: "upStem" | "downStem";
  children?: ReactNode;
}

/*
  Scales its children's durations by the tuplet ratio and draws the
  bracket-and-number on the chosen side. Children keep their natural flex
  relative to each other; the container's flex-grow applies the ratio.
*/
const TupletComponent = ({ ratio, position, stem, children }: TupletProps) => {
  const side = position ?? (stem === "downStem" ? "below" : "above");
  const [actual, normal] = ratio;
  const naturalFlex = Children.toArray(children).reduce(
    (sum: number, child) => sum + getEventFlex(child),
    0
  );
  const flexGrow = (naturalFlex * normal) / actual;
  const number = String(actual)
    .split("")
    .map((digit) => tupletGlyphs[Number(digit)])
    .join("");

  return (
    <div className="tuplet-container" style={{ flexGrow, display: "flex" }}>
      {children}
      <div className={`tuplet-bracket tuplet-${side}`}>
        <div className="tuplet-bracket-line"></div>
        <div className="leland tuplet-number">{number}</div>
        <div className="tuplet-bracket-line"></div>
      </div>
    </div>
  );
};

export const Tuplet = Object.assign(TupletComponent, {
  musicRole: "tuplet" as const,
});
