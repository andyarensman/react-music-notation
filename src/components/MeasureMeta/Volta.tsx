import "./Volta.css";

/**
 * A volta (ending) bracket over a measure, used as `Measure`'s `ending`
 * prop. Multi-measure endings compose: the first measure carries the
 * `text` (with `open: true` so its right side stays open), following
 * measures set `continues: true`, and the span's last measure keeps or
 * omits the closing hook via `open`.
 */
export interface EndingProps {
  /** The ending label: `"1."`, `"2."`, `"1., 2."`, ... */
  text?: string;
  /** Leaves the bracket's right side open (standard for final endings). */
  open?: boolean;
  /**
   * Continuation of an ending begun in an earlier measure: no left hook,
   * no label.
   */
  continues?: boolean;
}

/** The bracket itself; usually driven by `Measure`'s `ending` prop. */
export const Volta = ({ text, open, continues }: EndingProps) => (
  <div
    className={`volta${continues ? " volta-continues" : ""}${
      open ? " volta-open" : ""
    }`}
  >
    {!continues && text && <span className="volta-text">{text}</span>}
  </div>
);
