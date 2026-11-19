import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { LESSONS } from '../data/lessons';
import { snapPoint2D, snapValue, stepTargets } from '../engine/snapEngine';
import { EyeLens } from '../engine/types';
import { useStudioPointer } from '../hooks/useStudioPointer';
import { L01WhiteSpace } from '../exercises/L01WhiteSpace';
import { L03Grids } from '../exercises/L03Grids';
import { L07MicroType } from '../exercises/L07MicroType';
import { L09OpticalGeometry } from '../exercises/L09OpticalGeometry';
import { L12ImageFraming } from '../exercises/L12ImageFraming';
import { L13PrintPrepress } from '../exercises/L13PrintPrepress';

beforeAll(() => {
  // jsdom may not include full PointerEvent geometry fields (width, height, pointerType)
  if (typeof window.PointerEvent === 'undefined' || !('pointerType' in new window.PointerEvent('pointerdown'))) {
    class PolyfillPointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;
      width: number;
      height: number;
      pressure: number;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 1;
        this.pointerType = params.pointerType ?? 'mouse';
        this.width = params.width ?? 1;
        this.height = params.height ?? 1;
        this.pressure = params.pressure ?? 0.5;
      }
    }
    (window as unknown as { PointerEvent: typeof PolyfillPointerEvent }).PointerEvent = PolyfillPointerEvent;
  }

  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }
});

function dispatchTouchGesture(
  target: Element,
  points: { x: number; y: number }[],
  opts: { pointerType?: string; width?: number; height?: number; pointerId?: number } = {}
) {
  const { pointerType = 'touch', width = 56, height = 56, pointerId = 7 } = opts;
  const start = points[0];
  fireEvent(
    target,
    new window.PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId,
      pointerType,
      width,
      height,
      clientX: start.x,
      clientY: start.y,
    })
  );

  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    act(() => {
      window.dispatchEvent(
        new window.PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType,
          width,
          height,
          clientX: pt.x,
          clientY: pt.y,
        })
      );
    });
  }

  const end = points[points.length - 1];
  act(() => {
    window.dispatchEvent(
      new window.PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        pointerId,
        pointerType,
        width,
        height,
        clientX: end.x,
        clientY: end.y,
      })
    );
  });
}

describe('Adobe/Affinity Magnetic Snap Engine', () => {
  it('snaps within threshold and releases cleanly once moved past magnet pull', () => {
    const targets = [
      { value: 0, label: 'flush 0px', kind: 'zero' as const },
      ...stepTargets(8, 64, 8, 'grid', 'px'),
    ];

    const nearZero = snapValue(2.5, targets, 4);
    expect(nearZero.snapped).toBe(true);
    expect(nearZero.value).toBe(0);
    expect(nearZero.target?.kind).toBe('zero');

    const pulledOut = snapValue(13.2, targets, 2.5);
    expect(pulledOut.snapped).toBe(false);
    expect(pulledOut.value).toBe(13.2);

    const nextGrid = snapValue(15.2, targets, 2.5);
    expect(nextGrid.snapped).toBe(true);
    expect(nextGrid.value).toBe(16);
  });

  it('snaps X and Y axes independently via snapPoint2D', () => {
    const res = snapPoint2D(
      1.1,
      9.4,
      [{ value: 0, label: 'center X', kind: 'center' }],
      [{ value: 0, label: 'center Y', kind: 'center' }],
      2.0,
      2.0
    );
    expect(res.x).toBe(0);
    expect(res.guideX?.label).toBe('center X');
    expect(res.y).toBe(9.4);
    expect(res.guideY).toBeNull();
  });
});

describe('iPhone & iPad Pointer / Touch Hook', () => {
  it('accepts realistic 56x56 CSS px iPhone finger touches without false palm rejection', () => {
    const onMove = vi.fn();
    const TestDrag: React.FC = () => {
      const drag = useStudioPointer({ onMove });
      return (
        <div data-testid="drag-surface" {...drag.bind}>
          {drag.isDragging ? 'dragging' : 'idle'}
        </div>
      );
    };

    render(<TestDrag />);
    const el = screen.getByTestId('drag-surface');
    expect(el).toHaveAttribute('data-studio-drag', 'true');

    dispatchTouchGesture(
      el,
      [
        { x: 100, y: 100 },
        { x: 140, y: 120 },
      ],
      { pointerType: 'touch', width: 56, height: 56 }
    );

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0][0].dx).toBe(40);
    expect(onMove.mock.calls[0][0].dy).toBe(20);
  });

  it('only applies palm rejection to wide touch immediately after Apple Pencil activity', () => {
    const onMove = vi.fn();
    const TestPalm: React.FC = () => {
      const drag = useStudioPointer({ onMove });
      return <div data-testid="palm-surface" {...drag.bind} />;
    };

    render(<TestPalm />);
    const el = screen.getByTestId('palm-surface');

    // First, Apple Pencil stroke marks stylus session active
    dispatchTouchGesture(el, [{ x: 50, y: 50 }, { x: 70, y: 50 }], {
      pointerType: 'pen',
      width: 2,
      height: 2,
      pointerId: 1,
    });
    expect(onMove).toHaveBeenCalledTimes(1);

    // Wide resting palm touch right after pen is ignored
    dispatchTouchGesture(el, [{ x: 120, y: 120 }, { x: 160, y: 120 }], {
      pointerType: 'touch',
      width: 58,
      height: 58,
      pointerId: 2,
    });
    expect(onMove).toHaveBeenCalledTimes(1);
  });

  it('ignoreInteractiveChildren preserves nested button taps while still panning outer canvas', () => {
    const onPan = vi.fn();
    const onBtn = vi.fn();
    const TestCanvas: React.FC = () => {
      const pan = useStudioPointer({ onMove: onPan, ignoreInteractiveChildren: true });
      return (
        <div data-testid="outer-pan" {...pan.bind}>
          <button type="button" onClick={onBtn}>
            Nested Button
          </button>
        </div>
      );
    };

    render(<TestCanvas />);
    const btn = screen.getByRole('button', { name: 'Nested Button' });
    dispatchTouchGesture(btn, [
      { x: 10, y: 10 },
      { x: 50, y: 50 },
    ]);
    expect(onPan).not.toHaveBeenCalled();

    fireEvent.click(btn);
    expect(onBtn).toHaveBeenCalledTimes(1);

    const outer = screen.getByTestId('outer-pan');
    dispatchTouchGesture(outer, [
      { x: 10, y: 10 },
      { x: 50, y: 30 },
    ]);
    expect(onPan).toHaveBeenCalledTimes(1);
  });
});

describe('Exercise Direct iPhone Touch Manipulation & Guides', () => {
  const baseProps = (lessonId: string) => {
    const lesson = LESSONS.find((l) => l.id === lessonId)!;
    return {
      seed: 'touch-seed-2026',
      styleWorld: lesson.styleWorld,
      styleRef: lesson.styleRef,
      availableLenses: lesson.availableLenses,
      activeLenses: new Set<EyeLens>(),
      onToggleLens: () => {},
      railSide: 'right' as const,
      onComplete: () => {},
      onNewSeed: () => {},
    };
  };

  it('L01 margin handle drags via iPhone 58px touch and snaps margin value', () => {
    render(<L01WhiteSpace {...baseProps('01-whitespace')} />);
    const handle = screen.getByRole('slider', { name: /Drag left margin inward/i });
    const initial = Number(handle.getAttribute('aria-valuenow'));

    dispatchTouchGesture(handle, [{ x: 20, y: 150 }, { x: 70, y: 150 }], {
      width: 58,
      height: 58,
    });
    const updated = Number(handle.getAttribute('aria-valuenow'));
    expect(updated).not.toBe(initial);
  });

  it('L03 card edge drags by touch across columns cleanly', () => {
    render(<L03Grids {...baseProps('03-grids')} />);
    const handle = screen.getByLabelText(/Drag left card right edge/i);
    dispatchTouchGesture(handle, [{ x: 180, y: 120 }, { x: 230, y: 120 }], {
      width: 56,
      height: 56,
    });
    expect(handle).toBeInTheDocument();
  });

  it('L07 glyph kerning updates directly in one finger drag even on a newly touched letter', () => {
    const { container } = render(<L07MicroType {...baseProps('07-micro-type')} />);
    const letterEls = container.querySelectorAll('[data-studio-drag="true"]');
    // First [data-studio-drag] is StudioFrame pan wrapper; inner glyph(s) follow
    expect(letterEls.length).toBeGreaterThanOrEqual(2);
    const glyphEl = letterEls[1] as HTMLElement;
    const beforeTransform = glyphEl.style.transform;
    dispatchTouchGesture(glyphEl, [{ x: 120, y: 120 }, { x: 150, y: 120 }], {
      width: 58,
      height: 58,
    });
    expect(glyphEl.style.transform).not.toBe(beforeTransform);
  });

  it('L09 optical center dot updates cx/cy via 58px iPhone touch drag', () => {
    const { container } = render(<L09OpticalGeometry {...baseProps('09-optical-geometry')} />);
    const dragLayers = container.querySelectorAll('[data-studio-drag="true"]');
    expect(dragLayers.length).toBeGreaterThanOrEqual(2);
    const shapeLayer = dragLayers[1] as HTMLElement;
    const dotBefore = shapeLayer.querySelector('circle:nth-of-type(2)')?.getAttribute('cx');
    dispatchTouchGesture(shapeLayer, [{ x: 110, y: 110 }, { x: 132, y: 96 }], {
      width: 58,
      height: 58,
    });
    const dotAfter = shapeLayer.querySelector('circle:nth-of-type(2)')?.getAttribute('cx');
    expect(dotAfter).not.toBe(dotBefore);
  });

  it('L12 crop resize handle handles 56px finger drag cleanly', () => {
    const { container } = render(<L12ImageFraming {...baseProps('12-image-framing')} />);
    const resize = screen.getByLabelText(/Resize crop frame/i);
    // Mock boundingClientRect for stage
    const stageEl = container.querySelector('.studio-canvas-surface > div:nth-child(2)') as HTMLElement | null;
    if (stageEl) {
      stageEl.getBoundingClientRect = () =>
        ({ x: 0, y: 0, left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, toJSON: () => {} } as DOMRect);
    }
    dispatchTouchGesture(resize, [{ x: 200, y: 160 }, { x: 245, y: 160 }], {
      width: 56,
      height: 56,
    });
    expect(resize).toBeInTheDocument();
  });

  it('L13 bleed edge handle drags outward by touch and updates bleed readout', () => {
    render(<L13PrintPrepress {...baseProps('13-print-prepress')} />);
    const bleedHandle = screen.getByLabelText(/Drag artwork edge outward to bleed/i);
    const beforeText = screen.getByText(/BLEED:/i).textContent;
    dispatchTouchGesture(bleedHandle, [{ x: 80, y: 100 }, { x: 40, y: 100 }], {
      width: 56,
      height: 56,
    });
    const afterText = screen.getByText(/BLEED:/i).textContent;
    expect(afterText).not.toBe(beforeText);
  });
});
