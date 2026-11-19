import React from 'react';
import { CheckCircle2, ChevronRight, Layers, RotateCcw, Shuffle, AlertTriangle, XCircle } from 'lucide-react';
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
        : 'var(--signal)';

  const scoreTint =
    result.score >= 88
      ? 'var(--ok-tint)'
      : result.score >= 65
        ? 'var(--warn-tint)'
        : 'var(--signal-tint)';

  const r = 24;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - Math.max(0, Math.min(100, result.score)) / 100);

  return (
    <div
      role="region"
      aria-label="Evaluation results"
      aria-live="polite"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Score Header with SVG Precision Gauge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r={r} fill="none" stroke="var(--rule)" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r={r}
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 30 30)"
            />
            <text
              x="30"
              y="35"
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              className="tabular"
              fill="currentColor"
            >
              {result.score}
            </text>
          </svg>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>
              Closeness Score
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 4,
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: 6,
                background: scoreTint,
                color: scoreColor,
              }}
            >
              {result.band}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay View Switcher */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--ink-muted)',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          <Layers size={14} strokeWidth={1.75} aria-hidden="true" />
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
            borderRadius: 8,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--rule)',
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
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: selected ? 600 : 500,
                  background: selected ? 'var(--bg-surface)' : 'transparent',
                  color: selected ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  boxShadow: selected ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
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
          borderRadius: 8,
          background: 'var(--bg-paper)',
          border: '1px solid var(--rule)',
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--ink-muted)',
            fontWeight: 600,
            marginBottom: 5,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {result.metrics.map((metric) => {
            const statusIcon =
              metric.status === 'pass' ? (
                <CheckCircle2 size={14} color="var(--ok)" aria-hidden="true" />
              ) : metric.status === 'close' ? (
                <AlertTriangle size={14} color="var(--warn)" aria-hidden="true" />
              ) : (
                <XCircle size={14} color="var(--signal)" aria-hidden="true" />
              );
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {statusIcon}
                  <span style={{ color: 'var(--ink-secondary)' }}>{metric.label}</span>
                </div>
                <div className="tabular" style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>{metric.yours}</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 11.5 }}>vs {metric.target}</span>
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
              borderRadius: 8,
              border: '1px solid var(--rule-strong)',
              fontSize: 13.5,
              fontWeight: 500,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-tactile)',
            }}
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
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
              borderRadius: 8,
              border: '1px solid var(--rule-strong)',
              fontSize: 13.5,
              fontWeight: 500,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-tactile)',
            }}
          >
            <Shuffle size={14} strokeWidth={1.75} aria-hidden="true" />
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
              gap: 6,
              borderRadius: 8,
              background: 'var(--ink-primary)',
              color: 'var(--bg-surface)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{nextLabel}</span>
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
