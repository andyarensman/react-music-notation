import "./StaffLines.css";

interface StaffLinesProps {
  /**
   * How many staff lines to draw: 5 (standard) or 6 (tablature). Six
   * lines stay centered on the same glyph box, so the measure keeps its
   * height and barlines/clefs stay aligned.
   */
  lines?: 5 | 6;
}

/**
 * The staff lines with their vertical cushioning, sized entirely from
 * `--staff-space`. Rendered by `Measure`; rarely used directly.
 */
export const StaffLines = ({ lines = 5 }: StaffLinesProps) => {
  return (
    <div className="staff-lines-container">
      <div className={`staff staff-${lines}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="line"></div>
        ))}
      </div>
    </div>
  );
};
