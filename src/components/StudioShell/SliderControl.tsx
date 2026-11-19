import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (next: number) => void;
  hint?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  onChange,
  hint,
}) => {
  const clamp = (v: number) => {
    const stepped = Math.round(v / step) * step;
    const decimals = step.toString().split('.')[1]?.length ?? 0;
    const fixed = Number(stepped.toFixed(decimals));
    return Math.max(min, Math.min(max, fixed));
  };

  const display = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-primary)' }}>{label}</span>
        <span
          className="tabular"
          style={{
            fontSize: 13,
            color: 'var(--ink-secondary)',
            fontWeight: 500,
          }}
        >
          {display}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 8,
            border: '1px solid var(--rule)',
            background: 'var(--bg-paper)',
            display: 'grid',
            placeItems: 'center',
            opacity: value <= min ? 0.35 : 1,
          }}
        >
          <Minus size={15} strokeWidth={1.75} />
        </button>

        <input
          type="range"
          className="studio-slider"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
        />

        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 8,
            border: '1px solid var(--rule)',
            background: 'var(--bg-paper)',
            display: 'grid',
            placeItems: 'center',
            opacity: value >= max ? 0.35 : 1,
          }}
        >
          <Plus size={15} strokeWidth={1.75} />
        </button>
      </div>

      {hint && (
        <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', lineHeight: 1.35 }}>{hint}</span>
      )}
    </div>
  );
};
