"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 380;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates a numeric value toward the target like a stopwatch (smooth count up/down).
 */
export function useAnimatedValue(
  targetValue: number,
  options?: { durationMs?: number; enabled?: boolean }
): number {
  const durationMs = options?.durationMs ?? DEFAULT_DURATION_MS;
  const enabled = options?.enabled ?? true;
  const [displayValue, setDisplayValue] = useState(targetValue);
  const currentRef = useRef(targetValue);
  const targetValueRef = useRef(targetValue);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);

  currentRef.current = displayValue;

  useEffect(() => {
    if (!enabled || !Number.isFinite(targetValue)) {
      setDisplayValue(targetValue);
      currentRef.current = targetValue;
      return () => {};
    }

    const prevTarget = targetValueRef.current;
    if (prevTarget === targetValue) return () => {};

    const startValue = currentRef.current;
    targetValueRef.current = targetValue;
    startTimeRef.current = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      const end = targetValueRef.current;
      const current = startValue + (end - startValue) * eased;
      currentRef.current = current;
      setDisplayValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, enabled, durationMs]);

  return enabled ? displayValue : targetValue;
}
