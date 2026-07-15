import "./StaffLines.css";

/**
 * The five staff lines with their vertical cushioning, sized entirely from
 * `--staff-space`. Rendered by `Measure`; rarely used directly.
 */
export const StaffLines = () => {
  return (
    <div className="staff-lines-container">
      <div className="staff">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </div>
  );
};
