"use client";

import { useEffect } from "react";

const HIDE_AFTER_MS = 400;

export default function RemoveInitialLoader() {
  useEffect(() => {
    const id = setTimeout(() => {
      const el = document.getElementById("initial-loader");
      if (el) el.setAttribute("data-hidden", "true");
    }, HIDE_AFTER_MS);
    return () => clearTimeout(id);
  }, []);
  return null;
}
