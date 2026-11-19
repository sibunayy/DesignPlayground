import { useCallback, useRef, useState } from 'react';

export interface DragDelta {
  dx: number;
  dy: number;
  totalDx: number;
  totalDy: number;
  clientX: number;
  clientY: number;
  pointerType: string;
  precisionScale: number;
}

export interface StudioPointerOptions {
  /** Multiplier applied when Apple Pencil (`pointerType === 'pen'`) is dragging. Defaults to 0.5 for sub-pixel finesse. */
  penPrecisionScale?: number;
  onStart?: (clientX: number, clientY: number, pointerType: string) => void;
  onMove?: (delta: DragDelta) => void;
  onEnd?: (pointerType: string) => void;
}

/**
 * Unified Pointer Events hook tailored for iPad Air Touch & Apple Pencil.
 * Includes pointer capture, automatic pen sub-pixel scaling, and palm rejection.
 */
export function useStudioPointer(options: StudioPointerOptions) {
  const { penPrecisionScale = 0.5, onStart, onMove, onEnd } = options;
  const [isPenActive, setIsPenActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const activePointerId = useRef<number | null>(null);
  const activeType = useRef<string>('touch');
  const lastPenTime = useRef<number>(0);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const accum = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Palm rejection: ignore broad contacts or stray touches right after Apple Pencil strokes
      const now = performance.now();
      if (e.pointerType === 'touch') {
        if (e.width > 42 || e.height > 42) return;
        if (now - lastPenTime.current < 400) return;
      }

      if (e.pointerType === 'pen') {
        lastPenTime.current = now;
        setIsPenActive(true);
      } else if (e.pointerType === 'mouse') {
        setIsPenActive(false);
      }

      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if element cannot capture in synthetic test envs
      }

      activePointerId.current = e.pointerId;
      activeType.current = e.pointerType;
      startPos.current = { x: e.clientX, y: e.clientY };
      prevPos.current = { x: e.clientX, y: e.clientY };
      accum.current = { x: 0, y: 0 };
      setIsDragging(true);
      onStart?.(e.clientX, e.clientY, e.pointerType);
    },
    [onStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'pen') {
        lastPenTime.current = performance.now();
        setIsPenActive(true);
      }
      if (activePointerId.current !== e.pointerId) return;

      const scale = activeType.current === 'pen' ? penPrecisionScale : 1;
      const rawDx = e.clientX - prevPos.current.x;
      const rawDy = e.clientY - prevPos.current.y;
      prevPos.current = { x: e.clientX, y: e.clientY };

      const dx = rawDx * scale;
      const dy = rawDy * scale;
      accum.current = {
        x: accum.current.x + dx,
        y: accum.current.y + dy,
      };

      onMove?.({
        dx,
        dy,
        totalDx: accum.current.x,
        totalDy: accum.current.y,
        clientX: e.clientX,
        clientY: e.clientY,
        pointerType: activeType.current,
        precisionScale: scale,
      });
    },
    [onMove, penPrecisionScale]
  );

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (activePointerId.current !== e.pointerId) return;
      if (activeType.current === 'pen') {
        lastPenTime.current = performance.now();
      }
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore in synthetic envs
      }
      activePointerId.current = null;
      setIsDragging(false);
      onEnd?.(activeType.current);
    },
    [onEnd]
  );

  return {
    isPenActive,
    isDragging,
    bind: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}
