import {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
} from "react";
import "./Measure.css";
import { GridContext } from "./GridContext";
import { gridTemplateFromBoundaries, placeEventsOnGrid } from "./layout";

interface VoiceProps {
  // Stem direction forced onto every note in the voice (upper voice up,
  // lower voice down, by convention). Notes that set their own stem win.
  stem: "upStem" | "downStem";
  children?: ReactNode;
}

interface StemmableProps {
  stem?: "upStem" | "downStem" | "noStem";
  rest?: boolean;
  position?: string;
  tieDirection?: "above" | "below";
}

const VoiceComponent = ({ stem, children }: VoiceProps) => {
  const boundaries = useContext(GridContext);

  const stemmedChildren = Children.map(children, (child) => {
    if (!isValidElement<StemmableProps>(child)) {
      return child;
    }
    const overrides: StemmableProps = {};
    if (child.props.stem === undefined) {
      overrides.stem = stem;
    }
    // In multi-voice writing ties curve toward the voice's outer side, not
    // opposite the stem
    if (child.props.tieDirection === undefined) {
      overrides.tieDirection = stem === "upStem" ? "above" : "below";
    }
    // Keep the voices' rests out of each other's way: up-voice rests sit
    // high, down-voice rests sit low, unless placed explicitly
    if (child.props.rest && child.props.position === undefined) {
      overrides.position = stem === "upStem" ? "space-4" : "space-1";
    }
    return cloneElement(child, overrides);
  });

  if (!boundaries) {
    // Not inside a voice-aware measure: behave like a plain flex row
    return (
      <div className="voice-layer" style={{ display: "flex", flexGrow: 1 }}>
        {stemmedChildren}
      </div>
    );
  }

  return (
    <div
      className="voice-layer"
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateFromBoundaries(boundaries),
      }}
    >
      {placeEventsOnGrid(stemmedChildren, boundaries)}
    </div>
  );
};

/*
  musicRole lets layout.tsx and Measure recognize Voice elements without
  importing this module (Voice imports layout, so a direct import would be
  circular).
*/
export const Voice = Object.assign(VoiceComponent, {
  musicRole: "voice" as const,
});
