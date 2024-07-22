import { BeamPositions } from "./helpers";

//! Do i need to know if the highest value has multiple positions?
const findMaxAndIndices = (
  arr: number[]
): { maxValue: number; indices: number[] } => {
  const maxValue = Math.max(...arr);
  const indices = arr
    .map((value, index) => (value === maxValue ? index : -1))
    .filter((index) => index !== -1);

  return { maxValue, indices };
};

// return topLeft and topRight Values?
export const beamCreator = (notesToBeamArray, stemDirecton) => {
  // Find potential beam position of each note
  const beamPositionsArray = notesToBeamArray.map(
    (note) => BeamPositions[note.props.position]
  );

  //Find the positions of the first and last notes in beamed set
  const firstNote = beamPositionsArray[0];
  const lastNoteIndex = notesToBeamArray.length - 1;
  const lastNote = beamPositionsArray[lastNoteIndex];

  //!Find the highest note in the beamed set (upstem) if more than two notes
  const maxAndIndices = findMaxAndIndices(beamPositionsArray);
};

// returns values needed for any stem?
const stemCreator = () => {};
