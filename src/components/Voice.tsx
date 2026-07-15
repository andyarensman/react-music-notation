import {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
} from "react";
import "./Measure.css";
import { GridContext } from "./GridContext";
import {
  getMusicRole,
  gridTemplateFromBoundaries,
  placeEventsOnGrid,
} from "./layout";

// Wrappers the voice's defaults recurse into, so notes inside a slurred or
// tupleted passage still get the voice's stems/rests/ties/articulation sides
const TRANSPARENT_GROUPS = new Set(["slur", "tuplet", "hairpin"]);

interface VoiceProps {
  /**
   * Stem direction forced onto every note in the voice (upper voice up,
   * lower voice down, by convention). Notes that set their own stem win.
   * Also sets the voice's "outer side" used for tie curves and articulation
   * placement.
   */
  stem: "upStem" | "downStem";
  /** The voice's events: notes, chords, beams, tuplets, slurs, hairpins. */
  children?: ReactNode;
}

interface StemmableProps {
  stem?: "upStem" | "downStem" | "noStem";
  rest?: boolean;
  position?: string;
  tieDirection?: "above" | "below";
  articulationPlacement?: "above" | "below";
}

const VoiceComponent = ({ stem, children }: VoiceProps) => {
  const boundaries = useContext(GridContext);

  const applyVoiceDefaults = (nodes: ReactNode): ReactNode =>
    Children.map(nodes, (child) => {
      if (
        !isValidElement<StemmableProps & { children?: ReactNode }>(child)
      ) {
        return child;
      }
      const role = getMusicRole(child);
      if (role && TRANSPARENT_GROUPS.has(role)) {
        return cloneElement(child, {
          stem: child.props.stem ?? stem,
          children: applyVoiceDefaults(child.props.children),
        } as StemmableProps & { children?: ReactNode });
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
      // ...and articulation goes at the stem end, never the notehead side
      // (Gould's double-stemmed rule)
      if (child.props.articulationPlacement === undefined) {
        overrides.articulationPlacement =
          stem === "upStem" ? "above" : "below";
      }
      // Keep the voices' rests out of each other's way: up-voice rests sit
      // high, down-voice rests sit low, unless placed explicitly
      if (child.props.rest && child.props.position === undefined) {
        overrides.position = stem === "upStem" ? "space-4" : "space-1";
      }
      return cloneElement(child, overrides);
    });

  const stemmedChildren = applyVoiceDefaults(children);

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

// musicRole lets layout.tsx and Measure recognize Voice elements without
// importing this module (Voice imports layout, so a direct import would be
// circular)
/**
 * One of two rhythmically independent voices sharing a staff. Place two
 * `Voice` elements directly inside a `Measure`: their events lay out on the
 * measure's shared onset grid so the voices align with each other (and, in
 * a grand/score measure, with the other staves). Stems, rest heights, tie
 * directions, and articulation sides all default to the voice's convention.
 *
 * @example
 * ```tsx
 * <Measure clef="gClef">
 *   <Voice stem="upStem">{"..."}</Voice>
 *   <Voice stem="downStem">{"..."}</Voice>
 * </Measure>
 * ```
 */
export const Voice = Object.assign(VoiceComponent, {
  musicRole: "voice" as const,
});
