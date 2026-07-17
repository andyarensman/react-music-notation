import { MutableRefObject, Ref } from "react";

// Combine an internal ref with a forwarded one (components that measure
// their own container but also expose it to consumers)
export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]) =>
  (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as MutableRefObject<T | null>).current = node;
    }
  };
