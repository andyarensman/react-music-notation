import React, {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import { Note } from "./Note";
import { noteFlexValue } from "../helpers/helpers";
import { NoteProps } from "../helpers/types";

interface BeamContainerProps {
  children?: ReactElement<typeof Note> | ReactElement<typeof Note>[];
}

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
