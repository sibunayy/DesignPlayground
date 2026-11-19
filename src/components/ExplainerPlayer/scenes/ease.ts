export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function easeOutCubic(x: number): number {
  const t = clamp01(x);
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(x: number): number {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Normalized [0..1] progress across a sub-segment [start, end] */
export function seg(t: number, start: number, end: number): number {
  return easeInOutCubic((t - start) / (end - start));
}

export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * clamp01(p);
}
