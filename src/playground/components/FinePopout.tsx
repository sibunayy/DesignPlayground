import React, { useEffect, useRef, useState } from 'react';

interface FinePopoutProps {
  /** Name of the handle being adjusted. */
  label: string;
  value: number;
  min: number;
  max: number;
  fine: { span: number; step: number };
  onChange: (value: number) => void;
}

/**
 * A small popout for fine control. Dragging on the stage is the coarse control. The slider here is
 * relative: it always rests in the middle, so its thumb never shows where the answer is. When the
 * finger lifts, the slider re-centres on the new value.
 */
export const FinePopout: React.FC<FinePopoutProps> = ({ label, value, min, max, fine, onChange }) => {
  const [offset, setOffset] = useState(0);
  const base = useRef(value);
  const active = useRef(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  // Picking a different handle starts fresh.
  useEffect(() => {
    active.current = false;
    setOffset(0);
  }, [label]);

  const begin = () => {
    if (!active.current) {
      active.current = true;
      base.current = value;
    }
  };
  const end = () => {
    active.current = false;
    setOffset(0);
  };

  return (
    <div role="group" aria-label="Fine control" className="dp-fine">
      <p className="dp-fine-label">{label}</p>
      <input
        type="range"
        aria-label={`Fine control for ${label}`}
        min={-fine.span}
        max={fine.span}
        step={fine.step}
        value={offset}
        onPointerDown={begin}
        onKeyDown={begin}
        onChange={(e) => {
          begin();
          const next = Number(e.target.value);
          setOffset(next);
          onChange(clamp(base.current + next));
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyUp={end}
        onBlur={end}
      />
      <div className="dp-fine-steps">
        <button type="button" className="dp-chip-btn" aria-label="Nudge lower" onClick={() => onChange(clamp(value - fine.step))}>
          <span aria-hidden="true">−</span>
        </button>
        <button type="button" className="dp-chip-btn" aria-label="Nudge higher" onClick={() => onChange(clamp(value + fine.step))}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
};
