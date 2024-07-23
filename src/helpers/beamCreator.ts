import { BeamPositions } from "./helpers";
import { NoteElement } from "./types";

function findExtremeAndCheckPositions(
  arr: number[],
  stemDirecton: "upStem" | "downStem"
): { extremeValue: number; isBetween: boolean } {
  const extremeValue =
    stemDirecton === "upStem" ? Math.min(...arr) : Math.max(...arr);
  const firstIndex = arr.indexOf(extremeValue);
  const lastIndex = arr.lastIndexOf(extremeValue);

  const isBetween = firstIndex > 0 && lastIndex < arr.length - 1;

  return { extremeValue, isBetween };
}

// Returns topLeft and topRight values for the beam svg
export function beamCreator(
  notesToBeamArray: NoteElement[], //!The NoteElement does not include rests - may change in future
  stemDirecton: "upStem" | "downStem"
): { topLeftY: number; topRightY: number } {
  // Find potential beam position of each note
  const beamPositionsArray = notesToBeamArray.map(
    (note) => BeamPositions[stemDirecton][note.props.position]
  );

  //Find the positions of the first and last notes in beamed set
  const firstNote = beamPositionsArray[0];
  const lastNoteIndex = notesToBeamArray.length - 1;
  const lastNote = beamPositionsArray[lastNoteIndex];

  //if there's only two notes, return the beam
  if ((beamPositionsArray.length = 2)) {
    return { topLeftY: firstNote, topRightY: lastNote };
  }

  //Find the note closest to the beam and if it appears between the outer notes
  const extremeValueAndIsBetween = findExtremeAndCheckPositions(
    beamPositionsArray,
    stemDirecton
  );

  //Will the line be straight?
  if (extremeValueAndIsBetween.isBetween) {
    return {
      topLeftY: extremeValueAndIsBetween.extremeValue,
      topRightY: extremeValueAndIsBetween.extremeValue,
    };
  }

  //the line is not straight and there are more than two notes
  return { topLeftY: firstNote, topRightY: lastNote };
}

// returns values needed for any stem?
const stemCreator = () => {};
