import React from 'react';
import { ArrowRight, Layers, RotateCcw, Shuffle } from 'lucide-react';
import { ExerciseResult, OverlayMode } from '../../engine/types';

interface RevealDrawerProps {
  result: ExerciseResult;
  overlayMode: OverlayMode;
  onChangeOverlayMode: (mode: OverlayMode) => void;
  onRetry: () => void;
  onNewSeed: () => void;
  onNextLesson?: () => void;
  nextLabel?: string;
}

const MODES: Array<{ id: OverlayMode; label: string }> = [
  { id: 'overlay', label: 'Overlay' },
  { id: 'yours', label: 'Yours' },
  { id: 'target', label: 'Target' },
  { id: 'guides', label: 'Guides' },
];

export const RevealDrawer: React.FC<RevealDrawerProps> = ({
  result,
  overlayMode,
  onChangeOverlayMode,
  onRetry,
  onNewSeed,
  onNextLesson,
  nextLabel = 'Next Lesson',
}) => {
  const scoreColor =
    result.score >= 88
      ? 'var(--ok)'
      : result.score >= 65
        ? 'var(--warn)'
        : 'var(--accent)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Score Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingBottom: 14,
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-muted)',
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            Closeness Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              className="tabular"
              style={{
                fontSize: 38,
                fontWeight: 600,
                lineHeight: 1,
                color: scoreColor,
              }}
            >
              {result.score}
            </span>
            <span className="tabular" style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
              / 100
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: 999,
            background:
              result.score >= 88
                ? 'var(--ok-tint)'
                : result.score >= 65
                  ? 'var(--warn-tint)'
                  : 'var(--accent-tint)',
            color: scoreColor,
          }}
        >
          {result.band}
        </span>
      </div>

      {/* Overlay View Switcher */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-muted)',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          <Layers size={13} strokeWidth={1.75} />
          <span>Inspect Layer</span>
        </div>
        <div
          role="tablist"
          aria-label="Inspect solution overlay"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            padding: 4,
            borderRadius: 10,
            background: 'var(--bg-subtle)',
          }}
        >
          {MODES.map((m) => {
            const selected = overlayMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChangeOverlayMode(m.id)}
                style={{
                  minHeight: 34,
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: selected ? 600 : 500,
                  background: selected ? 'var(--bg-surface)' : 'transparent',
                  color: selected ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1-2 Sentence Diagnosis */}
      <div
        style={{
          padding: 14,
          borderRadius: 10,
          background: 'var(--bg-paper)',
          border: '1px solid var(--rule)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-muted)',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Critique Note
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-primary)' }}>
          {result.diagnosis}
        </p>
      </div>

      {/* Metric Deltas */}
      {result.metrics.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.metrics.map((metric) => {
            const dotColor =
              metric.status === 'pass'
                ? 'var(--ok)'
                : metric.status === 'close'
                  ? 'var(--warn)'
                  : 'var(--accent)';
            return (
              <div
                key={metric.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--rule)',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--ink-secondary)' }}>{metric.label}</span>
                </div>
                <div className="tabular" style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--ink-primary)', fontWeight: 500 }}>{metric.yours}</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 11.5 }}>→ {metric.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            type="button"
            onClick={onRetry}
            className="touch-target"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 10,
              border: '1px solid var(--rule-strong)',
              fontSize: 13.5,
              fontWeight: 500,
              background: 'var(--bg-surface)',
            }}
          >
            <RotateCcw size={15} strokeWidth={1.75} />
            <span>Retry Seed</span>
          </button>

          <button
            type="button"
            onClick={onNewSeed}
            className="touch-target"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 10,
              border: '1px solid var(--rule-strong)',
              fontSize: 13.5,
              fontWeight: 500,
              background: 'var(--bg-surface)',
            }}
          >
            <Shuffle size={15} strokeWidth={1.75} />
            <span>New Brief</span>
          </button>
        </div>

        {onNextLesson && (
          <button
            type="button"
            onClick={onNextLesson}
            className="touch-target"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 10,
              background: 'var(--ink-primary)',
              color: 'var(--bg-surface)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{nextLabel}</span>
            <ArrowRight size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
};
