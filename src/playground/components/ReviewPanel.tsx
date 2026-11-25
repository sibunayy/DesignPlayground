import React, { useEffect, useRef } from 'react';
import { ReviewNote } from '../logic/notes';
import { Review, scoreWord } from '../logic/scoring';

export type ReviewView = 'yours' | 'overlay' | 'ideal';

interface ReviewPanelProps {
  review: Review;
  notes: ReviewNote[];
  view: ReviewView;
  views: ReviewView[];
  onView: (v: ReviewView) => void;
  onNext: () => void;
  onRetry?: () => void;
  nextLabel: string;
  /** Retry attempts do not score. Shown so the learner knows. */
  practice?: boolean;
  /** Extra line under the score, such as a running total. */
  extra?: string;
  /** What the learner can break, for the penalty line: "pairs" or "blocks". */
  itemWord?: string;
}

const VIEW_TEXT: Record<ReviewView, string> = { yours: 'Yours', overlay: 'Overlay', ideal: 'Ideal' };
const GRADE_TEXT = { exact: 'Every spot exact', zone: 'Every spot in the zone', miss: 'Some spots missed' } as const;

/** Shown after lock in: the score, a switch between the learner's answer and the ideal, and notes. */
export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  review,
  notes,
  view,
  views,
  onView,
  onNext,
  onRetry,
  nextLabel,
  practice,
  extra,
  itemWord = 'pairs',
}) => {
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => next.current?.focus({ preventScroll: true }), [review]);
  return (
    <section className="dp-review" aria-labelledby="dp-review-score">
      <div className="dp-review-head">
        <p id="dp-review-score" className="dp-review-score" aria-live="polite">
          <span className={`dp-review-num dp-review-num--${review.grade}`}>{review.score}</span>
          <span className="dp-review-of">/100</span>
          <span className="dp-review-word">{practice ? 'Practice, not scored' : scoreWord(review.score)}</span>
        </p>
        <p className="dp-review-meta">
          {GRADE_TEXT[review.grade]}. {review.right} of {review.total} right
          {review.penalty > 0 ? `. ${review.penalty} points off for breaking good ${itemWord}` : ''}.
          {extra ? ` ${extra}` : ''}
        </p>
        <div role="group" aria-label="Compare" className="dp-seg">
          {views.map((v) => (
            <button key={v} type="button" className="dp-seg-btn" aria-pressed={view === v} onClick={() => onView(v)}>
              {VIEW_TEXT[v]}
            </button>
          ))}
        </div>
      </div>
      {notes.length > 0 && (
        <ol className="dp-review-notes">
          {notes.map((n, i) => (
            <li key={i} className={`dp-note dp-note--${n.grade}`}>
              {n.n > 0 && <span className={`dp-mark dp-mark--${n.grade} dp-mark--inline`}><span className="dp-mark-num">{n.n}</span></span>}
              <span>
                <strong>{n.title}.</strong> {n.body}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="dp-review-actions">
        {onRetry && (
          <button type="button" className="dp-btn-secondary" onClick={onRetry}>
            Try again
          </button>
        )}
        <button ref={next} type="button" className="dp-btn-primary" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </section>
  );
};
