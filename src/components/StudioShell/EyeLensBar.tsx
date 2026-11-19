import React from 'react';
import { EyeLens } from '../../engine/types';
import { AchromatopsiaIcon, MirrorAxisIcon, SquintEyeIcon } from '../Icons/CraftIcons';

interface EyeLensBarProps {
  availableLenses: EyeLens[];
  activeLenses: Set<EyeLens>;
  onToggleLens: (lens: EyeLens) => void;
}

const LENS_META: Record<EyeLens, { label: string; icon: React.ReactNode }> = {
  blur: { label: 'Squint Blur', icon: <SquintEyeIcon size={16} /> },
  grayscale: { label: 'Grayscale', icon: <AchromatopsiaIcon size={16} /> },
  flip: { label: 'Flip H', icon: <MirrorAxisIcon size={16} /> },
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
        borderRadius: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--rule-strong)',
        boxShadow: 'var(--shadow-tactile)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: 'var(--ink-muted)',
          padding: '0 8px 0 8px',
          fontWeight: 600,
        }}
      >
        Lenses
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
              minHeight: 36,
              padding: '0 12px',
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: active ? 600 : 500,
              background: active ? 'var(--ink-primary)' : 'transparent',
              color: active ? 'var(--bg-surface)' : 'var(--ink-secondary)',
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
