"use client";

import { useEffect, useRef } from "react";

/** Scrolls a container to its bottom whenever any of `deps` changes. */
export function useAutoScroll(deps) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
