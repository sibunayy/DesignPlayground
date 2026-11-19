export type SnapKind = 'edge' | 'center' | 'grid' | 'column' | 'third' | 'zero';

export interface SnapTarget {
  value: number;
  label?: string;
  kind?: SnapKind;
}

export interface SnapResult {
  value: number;
  snapped: boolean;
  target: SnapTarget | null;
}

/**
 * Affinity / Adobe style 1D magnetic snapping.
 * Picks the closest target within `threshold` and snaps cleanly to it.
 */
export function snapValue(
  raw: number,
  targets: SnapTarget[],
  threshold = 5
): SnapResult {
  let bestTarget: SnapTarget | null = null;
  let bestDist = threshold + 0.0001;

  for (const t of targets) {
    const d = Math.abs(raw - t.value);
    if (d < bestDist) {
      bestDist = d;
      bestTarget = t;
    }
  }

  if (bestTarget) {
    return {
      value: bestTarget.value,
      snapped: true,
      target: bestTarget,
    };
  }

  return {
    value: raw,
    snapped: false,
    target: null,
  };
}

/**
 * Generates uniform grid/ruler snap targets from min to max inclusive.
 */
export function stepTargets(
  min: number,
  max: number,
  step: number,
  kind: SnapKind = 'grid',
  unit = ''
): SnapTarget[] {
  const out: SnapTarget[] = [];
  const count = Math.round((max - min) / step);
  const decimals = step.toString().split('.')[1]?.length ?? 0;
  for (let i = 0; i <= count; i += 1) {
    const val = Number((min + i * step).toFixed(decimals));
    out.push({
      value: val,
      label: unit ? `${val}${unit}` : undefined,
      kind,
    });
  }
  return out;
}

export interface Snap2DResult {
  x: number;
  y: number;
  guideX: SnapTarget | null;
  guideY: SnapTarget | null;
}

export function snapPoint2D(
  rawX: number,
  rawY: number,
  xTargets: SnapTarget[],
  yTargets: SnapTarget[],
  thresholdX = 5,
  thresholdY = 5
): Snap2DResult {
  const rx = snapValue(rawX, xTargets, thresholdX);
  const ry = snapValue(rawY, yTargets, thresholdY);
  return {
    x: rx.value,
    y: ry.value,
    guideX: rx.target,
    guideY: ry.target,
  };
}
