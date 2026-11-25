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
 * Drag gain: how much of a pointer movement becomes value change. A slow drag is a careful drag, so
 * it gets a low gain and the value moves in small steps. A fast drag gets the full gain (1:1) so a
 * long move is still quick. Starting values (see design/game-design/plan.md, section 9).
 */
export const GAIN_SLOW = 0.3;
export const GAIN_FAST = 1;
/** Pointer speed, in px per ms, at or below which the gain is GAIN_SLOW and at or above which it is GAIN_FAST. */
export const SPEED_SLOW = 0.08;
export const SPEED_FAST = 0.8;
/** Holding Shift while dragging cuts the gain again, for the last few units. */
export const SHIFT_GAIN = 0.25;

export function dragGain(speed: number): number {
  const t = Math.min(1, Math.max(0, (speed - SPEED_SLOW) / (SPEED_FAST - SPEED_SLOW)));
  const ease = t * t * (3 - 2 * t);
  return GAIN_SLOW + (GAIN_FAST - GAIN_SLOW) * ease;
}

export interface DragState {
  pointer: number;
  x: number;
  y: number;
  /** Time of the last move, in ms. */
  t: number;
  /** Value before rounding. Rounding only happens on the value that is shown. */
  value: number;
  perPx: number;
  /** Smoothed pointer speed, px per ms. */
  speed: number;
}

/** Moves a drag on by one pointer event. Returns the new unrounded value. */
export function advanceDrag(d: DragState, axis: 'x' | 'y', clientX: number, clientY: number, time: number, shift = false): number {
  const px = axis === 'x' ? clientX - d.x : clientY - d.y;
  const dt = Math.max(1, time - d.t);
  // A little smoothing, so one fast sample from a noisy touch screen does not make the value jump.
  d.speed = d.speed * 0.6 + (Math.abs(px) / dt) * 0.4;
  d.value += px * d.perPx * dragGain(d.speed) * (shift ? SHIFT_GAIN : 1);
  d.x = clientX;
  d.y = clientY;
  d.t = time;
  return d.value;
}

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
  const drag = useRef<DragState | null>(null);
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
        t: e.timeStamp,
        value: values[index] ?? 0,
        perPx: typeof o.perPx === 'function' ? o.perPx() : o.perPx,
        speed: 0,
      };
      onSelect(index);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.pointer !== e.pointerId) return;
      const v = advanceDrag(d, o.axis, e.clientX, e.clientY, e.timeStamp, e.shiftKey);
      // Keep the unrounded value in range, so a drag past the end does not have to come back first.
      d.value = clamp(d.value);
      onChange(index, clamp(roundHalf(v)));
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
