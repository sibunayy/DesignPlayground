import React from 'react';
import { CheckResult, Exercise, Mode } from '../types';

interface DockProps {
  mode: Mode;
  exercise: Exercise;
  exerciseNumber: number;
  exerciseCount: number;
  value: number;
  result: CheckResult;
  isLast: boolean;
  onChange: (value: number) => void;
  onCheck: () => void;
  onNext: () => void;
}

/** Slider and the Check or Next button. A good check changes Check to Next. */
export const Dock: React.FC<DockProps> = ({
  mode,
  exercise,
  exerciseNumber,
  exerciseCount,
  value,
  result,
  isLast,
  onChange,
  onCheck,
  onNext,
}) => {
  const { min, max, step } = mode.slider;
  const sliderId = `dp-slider-${mode.id}`;
  const passed = result === 'good';
  return (
    <section aria-label="Controls" className="dp-dock">
      <div className="dp-dock-field">
        <label htmlFor={sliderId} className="dp-dock-label">
          Exercise {exerciseNumber} of {exerciseCount}: {exercise.kind}
        </label>
        <p style={{ fontSize: 17, margin: '4px 0 8px' }}>{exercise.prompt}</p>
        <div className="dp-slider-row">
          <button
            type="button"
            className="dp-chip-btn"
            aria-label="Decrease by one step"
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - step))}
          >
            <span aria-hidden="true">−</span>
          </button>
          <input
            id={sliderId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            aria-valuetext={`${value} ${mode.unit}`}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <button
            type="button"
            className="dp-chip-btn"
            aria-label="Increase by one step"
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + step))}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      {passed ? (
        <button type="button" className="dp-btn-primary" onClick={onNext}>
          {isLast ? 'See summary' : mode.nextLabel}
        </button>
      ) : (
        <button type="button" className="dp-btn-primary" onClick={onCheck}>
          {mode.checkLabel}
        </button>
      )}
    </section>
  );
};
