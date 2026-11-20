import { KeyboardEvent, PointerEvent, useRef } from 'react';

export interface HandleOptions {
  axis: 'x' | 'y';
  /** Value change per pixel of pointer movement. A function is read once when the drag starts. */
  perPx: number | (() => number);
  label: string;
  /** Keyboard step. */
  step?: number;
}

const roundHalf = (v: number) => Math.round(v * 2) / 2;

/**
 * Drag handles for the stage. Each handle sets one value. Touch, Pencil, mouse and the arrow keys
 * all work, and nothing it renders says how close a value is to the target.
 */
export function useHandles(
  values: number[],
  min: number,
  max: number,
  onChange: (index: number, value: number) => void,
  onSelect: (index: number) => void,
  selected: number
) {
  const drag = useRef<{ pointer: number; x: number; y: number; value: number; perPx: number } | null>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (index: number, o: HandleOptions) => ({
    role: 'slider' as const,
    tabIndex: 0,
    'aria-label': o.label,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': values[index] ?? 0,
    'aria-orientation': o.axis === 'x' ? ('horizontal' as const) : ('vertical' as const),
    'data-handle': index,
    'data-axis': o.axis,
    'data-selected': selected === index,
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        // A pointer that has already gone, or a test event, cannot be captured. The drag still works.
      }
      drag.current = {
        pointer: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        value: values[index] ?? 0,
        perPx: typeof o.perPx === 'function' ? o.perPx() : o.perPx,
      };
      onSelect(index);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.pointer !== e.pointerId) return;
      const pixels = o.axis === 'x' ? e.clientX - d.x : e.clientY - d.y;
      onChange(index, clamp(roundHalf(d.value + pixels * d.perPx)));
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onFocus: () => onSelect(index),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const dir =
        e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const step = (o.step ?? 1) * (e.shiftKey ? 10 : 1);
      onChange(index, clamp(roundHalf((values[index] ?? 0) + dir * step)));
    },
  });
}
