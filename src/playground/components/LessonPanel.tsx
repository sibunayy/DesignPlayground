import React from 'react';
import { LessonStep, Mode } from '../types';
import { LessonVisual } from './LessonVisual';

interface LessonPanelProps {
  mode: Mode;
  steps: LessonStep[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Six short steps. Previous is off on step 1. The last step goes back to step 1. */
export const LessonPanel: React.FC<LessonPanelProps> = ({ mode, steps, index, onPrev, onNext }) => {
  const step = steps[Math.min(index, steps.length - 1)];
  if (!step) return null;
  const isLast = index >= steps.length - 1;
  return (
    <aside aria-label={mode.lessonName} className="dp-panel">
      <div className="dp-panel-head">
        <h2 className="dp-panel-name">{mode.lessonName}</h2>
        <div className="dp-caption">
          Step {index + 1} of {steps.length}
        </div>
        <div className="dp-bars" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={`dp-bar${i <= index ? ' dp-bar--on' : ''}`} />
          ))}
        </div>
      </div>
      <div className="dp-visual" aria-hidden="true">
        <LessonVisual visual={step.visual} />
      </div>
      <div className="dp-lesson-text" aria-live="polite">
        <h3 className="dp-lesson-title">{step.title}</h3>
        <p className="dp-lesson-body">{step.body}</p>
        <p className="dp-lesson-tip">{step.tip}</p>
      </div>
      <div className="dp-panel-controls">
        <button type="button" className="dp-btn-secondary" onClick={onPrev} disabled={index === 0}>
          Previous
        </button>
        <button type="button" className="dp-btn-primary" onClick={onNext}>
          {isLast ? 'Review again' : 'Next step'}
        </button>
      </div>
    </aside>
  );
};
