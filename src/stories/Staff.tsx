import { ReactNode } from "react";
import "./Staff.css";

interface StaffProps {
  children?: ReactNode;
}

export const Staff = ({ children }: StaffProps) => {
  return <div className="staff-container">{children}</div>;
};
