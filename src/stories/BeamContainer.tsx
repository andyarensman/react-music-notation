import React, {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { Note, NoteProps } from "./Note";

interface BeamContainerProps {
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
}

//! noteFlexValue is used in Note.tsx - need to put it in a helper file
const noteFlexValue: Record<NoteProps["noteValue"], number> = {
  whole: 16,
  half: 8,
  quarter: 4,
  eighth: 2,
  "16th": 1,
};

//! I don't fully understand wha't happening here, need to review
const isNoteElement = (child: ReactNode): child is ReactElement<NoteProps> => {
  return isValidElement(child) && child.props.noteValue !== undefined;
};

export const BeamContainer = ({ children }: BeamContainerProps) => {
  // Handle the flexGrow

  const totalFlexGrowth = Children.toArray(children)
    .filter(isNoteElement)
    .reduce((sum, child) => sum + noteFlexValue[child.props.noteValue], 0);

  return (
    <div style={{ flexGrow: totalFlexGrowth, display: "flex" }}>{children}</div>
  );
};
