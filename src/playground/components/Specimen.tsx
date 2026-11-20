import React, { useRef } from 'react';
import { splitPair } from '../content/exercises';
import { useElementWidth } from '../state/useElementWidth';
import { Exercise } from '../types';

interface SpecimenProps {
  exercise: Exercise;
  value: number;
  /** Accessible name, such as "Sample A". */
  label: string;
}

/** Width each mode needs at full size. A specimen scales down below it. */
const DESIGN_WIDTH: Record<Exercise['modeId'], number> = {
  kerning: 1040,
  tracking: 900,
  leading: 1000,
  wordspace: 1000,
  measure: 1000,
  paragraph: 1000,
  margins: 900,
};

/**
 * One exercise drawn at one fixed value, for the A/B quiz.
 * Text stays at 16px or larger. Line length scales as a picture, because its point is the shape.
 */
export const Specimen: React.FC<SpecimenProps> = ({ exercise, value, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref, 400);
  const design = exercise.width ?? DESIGN_WIDTH[exercise.modeId];
  const scale = Math.min(1, width / design);
  const fontSize = Math.max(16, exercise.size * scale);

  let body: React.ReactNode;
  switch (exercise.modeId) {
    case 'kerning': {
      const { left, rest } = splitPair(exercise.text);
      body = (
        <div className="dp-kern-word" style={{ fontSize }}>
          <span>{left}</span>
          <span style={{ display: 'inline-block', width: value * (fontSize / exercise.size) }} />
          <span>{rest}</span>
        </div>
      );
      break;
    }
    case 'tracking':
    case 'wordspace': {
      const isTracking = exercise.modeId === 'tracking';
      body = (
        <div
          className="dp-stage-line"
          style={{
            fontSize,
            whiteSpace: 'normal',
            textAlign: 'center',
            letterSpacing: isTracking ? `${value / 1000}em` : exercise.caps ? '0.12em' : undefined,
            wordSpacing: isTracking ? undefined : `${value / 1000}em`,
          }}
        >
          {exercise.text}
        </div>
      );
      break;
    }
    case 'leading':
      body = (
        <div style={{ fontSize, fontWeight: 800, lineHeight: value / 100 }}>{exercise.text}</div>
      );
      break;
    case 'paragraph': {
      const gap = (fontSize * 1.45 * value) / 100;
      body = (
        <div style={{ fontSize, lineHeight: 1.45 }}>
          {exercise.text.split('\n\n').map((p, i) => (
            <p key={i} style={{ marginTop: i === 0 ? 0 : gap, textIndent: exercise.indent && i > 0 ? '2em' : undefined }}>
              {p}
            </p>
          ))}
        </div>
      );
      break;
    }
    case 'measure': {
      // Draw the line length at 16px, then scale the picture to fit the card.
      const natural = 16 * 0.6 * value;
      const fit = Math.min(1, width / natural);
      body = (
        <p style={{ width: `${value}ch`, fontSize: 16, lineHeight: 1.5, zoom: fit }}>{exercise.text}</p>
      );
      break;
    }
    case 'margins': {
      const pad = (fontSize * value) / 100;
      const half = exercise.box === 'button';
      body = (
        <div
          className={`dp-margin-box dp-margin-box--${exercise.box ?? 'card'}`}
          style={{ padding: half ? `${pad / 2}px ${pad}px` : pad, maxWidth: '100%', margin: '0 auto' }}
        >
          <div
            style={{
              fontSize,
              fontWeight: exercise.box === 'card' ? 500 : 800,
              lineHeight: exercise.box === 'poster' ? 1.05 : 1.4,
              letterSpacing: exercise.caps ? '0.08em' : undefined,
              whiteSpace: half ? 'nowrap' : undefined,
            }}
          >
            {exercise.text}
          </div>
        </div>
      );
      break;
    }
  }

  return (
    <div ref={ref} role="img" aria-label={`${label}: ${exercise.label}`} className="dp-specimen">
      {body}
    </div>
  );
};
