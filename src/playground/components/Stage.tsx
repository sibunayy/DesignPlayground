import React, { useRef } from 'react';
import { splitPair } from '../content/exercises';
import { trackFraction, UNITS_PER_SQUARE, zoneText } from '../logic/check';
import { useElementWidth } from '../state/useElementWidth';
import { AssistId, Assists, Exercise, Mode } from '../types';
import { ASSIST_LABELS, DpIcon } from './Icons';

interface StageProps {
  mode: Mode;
  exercise: Exercise;
  value: number;
  assists: Assists;
  onToggleAssist: (id: AssistId) => void;
  readoutText: string;
  message: string;
  /** Second feedback line after a good check, such as "Exact answer." */
  gradeText?: string;
}

/** Width each mode needs at full size. The stage scales down below it. */
const DESIGN_WIDTH: Record<Mode['id'], number> = {
  kerning: 1040,
  tracking: 900,
  leading: 1000,
  wordspace: 1000,
  measure: 1000,
  paragraph: 1000,
};

const STAGE_PADDING = 64;

export const Stage: React.FC<StageProps> = ({
  mode,
  exercise,
  value,
  assists,
  onToggleAssist,
  readoutText,
  message,
  gradeText,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref, 800);
  const inner = Math.max(200, width - STAGE_PADDING);
  const designWidth = mode.id === 'leading' || mode.id === 'paragraph' ? exercise.width ?? 1000 : DESIGN_WIDTH[mode.id];
  const scale = Math.min(1, inner / designWidth);
  // Wrapping text (leading, paragraphs) never drops below 16px. It wraps more instead.
  const wraps = mode.id === 'leading' || mode.id === 'paragraph';
  const fontSize = wraps ? Math.max(16, exercise.size * scale) : exercise.size * scale;
  const blur = assists.blur && mode.assists.includes('blur') ? `blur(${Math.max(1.5, fontSize * 0.03)}px)` : undefined;

  // Kerning: one grid cell is one square of gap at the current word size.
  const kernScale = fontSize / exercise.size;
  const cell = mode.id === 'kerning' ? UNITS_PER_SQUARE * kernScale : 40 * Math.max(0.6, scale);
  const showGrid = assists.grid && mode.assists.includes('grid');

  let canvas: React.ReactNode;
  switch (mode.id) {
    case 'kerning': {
      const { left, rest } = splitPair(exercise.text);
      const sq = value / UNITS_PER_SQUARE;
      canvas = (
        <div role="img" aria-label={exercise.label} className="dp-kern-word" style={{ fontSize, filter: blur }}>
          <span>{left}</span>
          <span
            aria-hidden="true"
            className="dp-gap"
            style={{ width: value * kernScale, height: fontSize * 0.52 }}
          >
            {assists.guides && (
              <>
                <span className="dp-gap-edge" style={{ left: -1 }} />
                <span className="dp-gap-edge" style={{ right: -1 }} />
                <span className="dp-gap-ruler" />
                <span className="dp-gap-label">{(Math.round(sq * 10) / 10).toFixed(1)} squares</span>
              </>
            )}
          </span>
          <span>{rest}</span>
        </div>
      );
      break;
    }
    case 'tracking':
    case 'wordspace': {
      const isTracking = mode.id === 'tracking';
      const lineStyle: React.CSSProperties = {
        fontSize,
        letterSpacing: isTracking ? `${value / 1000}em` : exercise.caps ? '0.12em' : undefined,
        wordSpacing: isTracking ? undefined : `${value / 1000}em`,
      };
      const ghostStyle: React.CSSProperties = {
        ...lineStyle,
        letterSpacing: isTracking ? 0 : lineStyle.letterSpacing,
        wordSpacing: isTracking ? undefined : 0,
        opacity: assists.compare ? 0.35 : 0,
      };
      canvas = (
        <div role="img" aria-label={exercise.label} className="dp-overlay">
          <div aria-hidden="true" className="dp-stage-line dp-ghost" style={ghostStyle}>
            {exercise.text}
          </div>
          <div aria-hidden="true" className="dp-stage-line" style={{ ...lineStyle, filter: blur }}>
            {exercise.text}
          </div>
        </div>
      );
      break;
    }
    case 'leading': {
      const lineHeightPx = (fontSize * value) / 100;
      const guides = assists.guides
        ? `repeating-linear-gradient(to bottom, transparent 0, transparent ${lineHeightPx - 2}px, var(--accent) ${
            lineHeightPx - 2
          }px, var(--accent) ${lineHeightPx}px)`
        : undefined;
      canvas = (
        <div
          role="img"
          aria-label={exercise.label}
          style={{
            width: (exercise.width ?? 1000) * scale,
            maxWidth: '100%',
            fontSize,
            fontWeight: 800,
            lineHeight: value / 100,
            backgroundImage: guides,
            filter: blur,
          }}
        >
          {exercise.text}
        </div>
      );
      break;
    }
    case 'paragraph': {
      const LINE_HEIGHT = 1.45;
      const lineHeightPx = fontSize * LINE_HEIGHT;
      const gapPx = (lineHeightPx * value) / 100;
      const paragraphs = exercise.text.split('\n\n');
      canvas = (
        <div
          role="img"
          aria-label={exercise.label}
          style={{
            width: (exercise.width ?? 1000) * scale,
            maxWidth: '100%',
            fontSize,
            fontWeight: 400,
            lineHeight: LINE_HEIGHT,
            filter: blur,
          }}
        >
          {paragraphs.map((para, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    height: gapPx,
                    borderRadius: 4,
                    background: assists.guides ? 'var(--accent-tint)' : undefined,
                  }}
                />
              )}
              <p aria-hidden="true" style={{ textIndent: exercise.indent && i > 0 ? '2em' : undefined }}>
                {para}
              </p>
            </React.Fragment>
          ))}
        </div>
      );
      break;
    }
    case 'measure': {
      // Fit the longest slider line inside the stage where possible. One ch is about 0.6 em.
      // Text never goes below 16px. On a narrow stage, long lines scroll inside the stage.
      const measureFont = Math.max(16, Math.min(exercise.size, inner / (mode.slider.max * 0.6)));
      canvas = (
        <div style={{ fontSize: measureFont, width: `${mode.slider.max}ch`, flexShrink: 0, margin: '0 auto' }}>
          {assists.guides && (
            <div
              aria-hidden="true"
              style={{
                width: `${mode.slider.max}ch`,
                height: 10,
                marginBottom: 10,
                backgroundImage:
                  'repeating-linear-gradient(to right, var(--muted) 0, var(--muted) 1px, transparent 1px, transparent 10ch)',
              }}
            />
          )}
          <p
            aria-label={exercise.label}
            style={{
              width: `${value}ch`,
              fontWeight: 400,
              lineHeight: 1.5,
              borderRight: assists.guides ? '2px solid var(--accent)' : undefined,
            }}
          >
            {exercise.text}
          </p>
        </div>
      );
      break;
    }
  }

  const { min, max } = mode.slider;
  const zoneLeft = trackFraction(exercise.lo, min, max) * 100;
  const zoneWidth = Math.max(3, (trackFraction(exercise.hi, min, max) * 100) - zoneLeft);

  return (
    <section
      ref={ref}
      aria-label="Stage"
      className={`dp-stage${showGrid ? ' dp-stage--grid' : ''}`}
      style={{ backgroundSize: `${cell}px ${cell}px` }}
    >
      <div role="group" aria-label="Assistive tools" className="dp-assists">
        {mode.assists.map((id) => (
          <button
            key={id}
            type="button"
            className="dp-toggle"
            aria-pressed={assists[id]}
            aria-label={ASSIST_LABELS[id]}
            title={ASSIST_LABELS[id]}
            onClick={() => onToggleAssist(id)}
          >
            <span className="dp-toggle-chip">
              <DpIcon name={id} />
            </span>
          </button>
        ))}
      </div>

      <div
        className={`dp-stage-canvas${mode.id === 'measure' ? ' dp-stage-canvas--scroll' : ''}${
          wraps ? ' dp-stage-canvas--tall' : ''
        }`}
      >
        {canvas}
      </div>

      <div className="dp-stage-foot">
        {assists.answer && (
          <div className="dp-zone">
            <div className="dp-zone-track" aria-hidden="true">
              <span className="dp-zone-range" style={{ left: `${zoneLeft}%`, width: `${zoneWidth}%` }} />
              <span className="dp-zone-mark" style={{ left: `${trackFraction(value, min, max) * 100}%` }} />
            </div>
            <div className="dp-zone-text">{zoneText(mode, exercise)}</div>
          </div>
        )}
        <div className="dp-caption">{readoutText}</div>
        <div className="dp-message" aria-live="polite">
          <span>{message}</span>
          {gradeText && (
            <>
              {' '}
              <span className="dp-grade">{gradeText}</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
