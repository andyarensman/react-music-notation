import { Children, ReactNode } from "react";
import "./Hairpin.css";
import { getEventFlex, getLastLeafFlex } from "./layout";

interface HairpinProps {
  type?: "crescendo" | "diminuendo";
  children?: ReactNode;
}

// A crescendo/diminuendo wedge under the wrapped events, at dynamics height
const HairpinComponent = ({ type = "crescendo", children }: HairpinProps) => {
  const childArray = Children.toArray(children);
  const totalFlex = childArray.reduce(
    (sum: number, child) => sum + getEventFlex(child),
    0
  );
  if (totalFlex === 0) {
    return <>{children}</>;
  }
  const spanPercentage =
    ((totalFlex - getLastLeafFlex(children)) / totalFlex) * 100;

  return (
    <div
      className="hairpin-group"
      style={{ flexGrow: totalFlex, display: "flex" }}
    >
      {children}
      <div
        className="hairpin-overlay"
        style={{ width: `calc(${spanPercentage}% + var(--staff-space))` }}
      >
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="hairpin-svg"
        >
          {type === "crescendo" ? (
            <path d="M98,0.5 L2,5 L98,9.5" vectorEffect="non-scaling-stroke" />
          ) : (
            <path d="M2,0.5 L98,5 L2,9.5" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>
    </div>
  );
};

export const Hairpin = Object.assign(HairpinComponent, {
  musicRole: "hairpin" as const,
});
