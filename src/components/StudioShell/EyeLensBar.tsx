import React from 'react';
import { Contrast, Eye, FlipHorizontal2 } from 'lucide-react';
import { EyeLens } from '../../engine/types';

interface EyeLensBarProps {
  availableLenses: EyeLens[];
  activeLenses: Set<EyeLens>;
  onToggleLens: (lens: EyeLens) => void;
}

const LENS_META: Record<EyeLens, { label: string; icon: React.ReactNode }> = {
  blur: { label: 'Squint Blur', icon: <Eye size={14} strokeWidth={1.75} /> },
  grayscale: { label: 'Grayscale', icon: <Contrast size={14} strokeWidth={1.75} /> },
  flip: { label: 'Flip H', icon: <FlipHorizontal2 size={14} strokeWidth={1.75} /> },
};

export const EyeLensBar: React.FC<EyeLensBarProps> = ({
  availableLenses,
  activeLenses,
  onToggleLens,
}) => {
  if (availableLenses.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Diagnostic critique lenses"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'var(--bg-surface)',
        border: '1px solid var(--rule)',
        boxShadow: 'var(--shadow-float)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ink-muted)',
          padding: '0 8px 0 10px',
          fontWeight: 600,
        }}
      >
        Eye
      </span>
      {availableLenses.map((lens) => {
        const active = activeLenses.has(lens);
        const meta = LENS_META[lens];
        return (
          <button
            key={lens}
            type="button"
            aria-pressed={active}
            onClick={() => onToggleLens(lens)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 34,
              padding: '0 12px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 500,
              background: active ? 'var(--ink-primary)' : 'transparent',
              color: active ? 'var(--bg-surface)' : 'var(--ink-secondary)',
              transition: 'background 140ms ease, color 140ms ease',
            }}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};
