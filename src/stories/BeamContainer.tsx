import React, { Children, ReactElement, useEffect, useState } from "react";
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

export const BeamContainer = ({ children }: BeamContainerProps) => {
  const [beamFlex, setBeamFlex] = useState(0);

  // Handle the flexGrow
  useEffect(() => {
    //! I don't fully understand wha't happening here, need to review
    const isNoteElement = (
      child: React.ReactNode
    ): child is React.ReactElement<NoteProps> => {
      return React.isValidElement(child) && child.props.noteValue !== undefined;
    };

    const totalFlexGrowth = Children.toArray(children)
      .filter(isNoteElement)
      .reduce((sum, child) => sum + noteFlexValue[child.props.noteValue], 0);

    setBeamFlex(totalFlexGrowth);
  }, [children]);

  return <div style={{ flexGrow: beamFlex }}>{children}</div>;
};
