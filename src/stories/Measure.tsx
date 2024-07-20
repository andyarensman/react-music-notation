import React, { Children, ReactElement } from "react";
import "./Measure.css";
import { StaffLines } from "./StaffLines";
import { Note } from "./Note";
import { Clef } from "./MeasureMeta/Clef";
import { KeyRange, NoteProps } from "../helpers/types";
import { KeySignature } from "./MeasureMeta/KeySignature";
import { TimeSignature, TimeSignatureProps } from "./MeasureMeta/TimeSignature";

interface MeasureProps {
  measureNumber?: number;
  clef?: "gClef" | "fClef" | "cClef";
  fifths?: KeyRange;
  time?: TimeSignatureProps;
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
}

export const Measure = ({
  measureNumber,
  clef,
  fifths,
  time,
  children,
}: MeasureProps) => {
  const notesArray = Children.toArray(children);

  const editedNotesArray = notesArray.map((note, index) => {
    if (
      React.isValidElement(note) &&
      note.props.beam &&
      note.props.beam.status === "start"
    ) {
      // let the current note know what the position of the next note is
      const nextNote = notesArray[index + 1] as
        | ReactElement<NoteProps>
        | undefined;
      if (React.isValidElement(nextNote)) {
        note.props.beam.nextNotePostion = nextNote.props.position;
      }
    }
    return note;
  });

  return (
    <div className="measure-container">
      <StaffLines />
      <div className="data-container">
        <div className="meta-container">
          {clef && <Clef clef={clef} />}
          {fifths && <KeySignature fifths={fifths} />}
          {time && <TimeSignature {...time} />}
        </div>
        <div className="notes-container">{editedNotesArray}</div>
      </div>
    </div>
  );
};
