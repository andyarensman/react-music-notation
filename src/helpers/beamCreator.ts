import { BeamPositions } from "./helpers";
import { NoteElement } from "./types";

// One staff-space in svg viewBox units. Beam slants shouldn't cross more
// than one staff line, so the rise is clamped to this.
const MAX_BEAM_SLANT = 8;

const clampSlant = (value: number): number =>
  Math.max(-MAX_BEAM_SLANT, Math.min(MAX_BEAM_SLANT, value));

// Returns topLeftY and topRightY (the beam edge at the stem tips) for the
// beam svg, in viewBox units.
export function beamCreator(
  notesToBeamArray: NoteElement[], //!The NoteElement does not include rests - may change in future
  stemDirection: "upStem" | "downStem"
): { topLeftY: number; topRightY: number } {
  // Standard beam position of each note (a standard-length stem away)
  const beamPositionsArray = notesToBeamArray.map(
    (note) => BeamPositions[stemDirection][note.props.position]
  );

  const firstBeam = beamPositionsArray[0];
  const lastBeam = beamPositionsArray[beamPositionsArray.length - 1];

  // The note closest to the beam sets the anchor: its stem stays standard
  // length, every other stem gets longer
  const extremeValue =
    stemDirection === "upStem"
      ? Math.min(...beamPositionsArray)
      : Math.max(...beamPositionsArray);

  // Horizontal beam when an inner note is closer to the beam than the outer
  // notes (concave group), or when the outer notes match
  const innerHasExtreme = beamPositionsArray
    .slice(1, -1)
    .includes(extremeValue);
  if (innerHasExtreme || firstBeam === lastBeam) {
    return { topLeftY: extremeValue, topRightY: extremeValue };
  }

  // Sloped beam: anchor at the outer note closest to the beam and clamp the
  // slant so the far end never drifts more than one staff-space away
  if (firstBeam === extremeValue) {
    return {
      topLeftY: firstBeam,
      topRightY: firstBeam + clampSlant(lastBeam - firstBeam),
    };
  }
  return {
    topLeftY: lastBeam + clampSlant(firstBeam - lastBeam),
    topRightY: lastBeam,
  };
}
