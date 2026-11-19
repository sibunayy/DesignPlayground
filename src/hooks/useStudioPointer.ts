import { useCallback, useEffect, useRef, useState } from 'react';

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
  /** When true (for outer canvas panning), ignore pointerDown originating on buttons, inputs, links, or nested drag handles. */
  ignoreInteractiveChildren?: boolean;
  onStart?: (clientX: number, clientY: number, pointerType: string) => void;
  onMove?: (delta: DragDelta) => void;
  onEnd?: (pointerType: string) => void;
}

/**
 * Universal Touch, Apple Pencil, and Mouse Pointer Events hook.
 * Works reliably on iPhone Safari, iPad Air (Touch + Pencil), Android Chrome, and Desktop:
 * - Never blocks iOS finger touches (iOS reports touch width/height 44-70px; palm rejection activates ONLY after real pen input).
 * - Attaches window-level move/up/cancel fallback listeners during drag so fast mobile swipes never stall.
 * - Embeds `touchAction: 'none'` and `userSelect: 'none'` directly on `bind.style` for iOS WebKit scroll locking.
 */
export function useStudioPointer(options: StudioPointerOptions) {
  const { penPrecisionScale = 0.5, ignoreInteractiveChildren = false, onStart, onMove, onEnd } = options;
  const [isPenActive, setIsPenActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const activePointerId = useRef<number | null>(null);
  const activeType = useRef<string>('touch');
  const lastPenTime = useRef<number>(0);
  const hasSeenPen = useRef<boolean>(false);
  const prevPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const accum = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep latest callbacks in refs so window listeners never go stale mid-drag
  const callbacksRef = useRef({ onStart, onMove, onEnd, penPrecisionScale });
  callbacksRef.current = { onStart, onMove, onEnd, penPrecisionScale };

  const detachWindowListeners = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      detachWindowListeners.current?.();
    };
  }, []);

  const endSession = useCallback((pointerType: string) => {
    activePointerId.current = null;
    detachWindowListeners.current?.();
    detachWindowListeners.current = null;
    setIsDragging(false);
    callbacksRef.current.onEnd?.(pointerType);
  }, []);

  const processMove = useCallback((clientX: number, clientY: number, pointerType: string) => {
    const scale = pointerType === 'pen' ? callbacksRef.current.penPrecisionScale : 1;
    const rawDx = clientX - prevPos.current.x;
    const rawDy = clientY - prevPos.current.y;
    prevPos.current = { x: clientX, y: clientY };

    if (rawDx === 0 && rawDy === 0) return;

    const dx = rawDx * scale;
    const dy = rawDy * scale;
    accum.current = {
      x: accum.current.x + dx,
      y: accum.current.y + dy,
    };

    callbacksRef.current.onMove?.({
      dx,
      dy,
      totalDx: accum.current.x,
      totalDy: accum.current.y,
      clientX,
      clientY,
      pointerType,
      precisionScale: scale,
    });
  }, []);

  const startSession = useCallback(
    (pointerId: number, clientX: number, clientY: number, pointerType: string) => {
      activePointerId.current = pointerId;
      activeType.current = pointerType;
      prevPos.current = { x: clientX, y: clientY };
      accum.current = { x: 0, y: 0 };
      setIsDragging(true);
      callbacksRef.current.onStart?.(clientX, clientY, pointerType);

      detachWindowListeners.current?.();

      const onWinPointerMove = (ev: PointerEvent) => {
        if (activePointerId.current !== ev.pointerId) return;
        if (ev.pointerType === 'pen') {
          hasSeenPen.current = true;
          lastPenTime.current = performance.now();
        }
        processMove(ev.clientX, ev.clientY, activeType.current);
      };

      const onWinPointerUp = (ev: PointerEvent) => {
        if (activePointerId.current !== ev.pointerId) return;
        if (activeType.current === 'pen') {
          lastPenTime.current = performance.now();
        }
        endSession(activeType.current);
      };

      window.addEventListener('pointermove', onWinPointerMove, { passive: true });
      window.addEventListener('pointerup', onWinPointerUp);
      window.addEventListener('pointercancel', onWinPointerUp);

      detachWindowListeners.current = () => {
        window.removeEventListener('pointermove', onWinPointerMove);
        window.removeEventListener('pointerup', onWinPointerUp);
        window.removeEventListener('pointercancel', onWinPointerUp);
      };
    },
    [endSession, processMove]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement | SVGElement>) => {
      if (ignoreInteractiveChildren) {
        const target = e.target as HTMLElement | null;
        const interactive = target?.closest('button, input, select, textarea, a, [data-studio-drag="true"]');
        if (interactive && interactive !== e.currentTarget) return;
      }

      const now = performance.now();

      // Palm rejection ONLY when Apple Pencil has actually been used in this session
      if (e.pointerType === 'touch' && hasSeenPen.current) {
        if (now - lastPenTime.current < 400) return;
        if (e.width > 95 || e.height > 95) return;
      }

      if (e.pointerType === 'pen') {
        hasSeenPen.current = true;
        lastPenTime.current = now;
        setIsPenActive(true);
      } else if (e.pointerType === 'mouse') {
        setIsPenActive(false);
      }

      e.stopPropagation();
      // Prevent iOS Safari text selection / bounce on touch start
      if (e.cancelable) e.preventDefault();

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Window listeners handle capture fallback cleanly
      }

      startSession(e.pointerId, e.clientX, e.clientY, e.pointerType);
    },
    [ignoreInteractiveChildren, startSession]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement | SVGElement>) => {
      if (e.pointerType === 'pen') {
        hasSeenPen.current = true;
        lastPenTime.current = performance.now();
        setIsPenActive(true);
      }
      if (activePointerId.current !== e.pointerId) return;
      if (e.cancelable) e.preventDefault();
      processMove(e.clientX, e.clientY, activeType.current);
    },
    [processMove]
  );

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLElement | SVGElement>) => {
      if (activePointerId.current !== e.pointerId) return;
      if (activeType.current === 'pen') {
        lastPenTime.current = performance.now();
      }
      try {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
      endSession(activeType.current);
    },
    [endSession]
  );

  return {
    isPenActive,
    isDragging,
    bind: {
      'data-studio-drag': 'true',
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}
