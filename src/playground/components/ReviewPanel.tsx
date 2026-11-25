import React, { useEffect, useRef } from 'react';
import { ReviewNote } from '../logic/notes';
import { Review, scoreWord } from '../logic/scoring';
import { ScoreScale } from './ScoreScale';

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
  /** One name for each handle, for the scale rows. */
  labels?: string[];
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
  labels = [],
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
      <details className="dp-how">
        <summary>How this score works</summary>
        <p>
          Each spot scores up to 100. The dark band is the centre third of the target: 100 points. The tinted band is the whole target: 70 to 100.
          Beyond the pale band the spot scores 0. The score is the average of the spots.
          {review.handles.some((h) => h.startedGood)
            ? ` Only spots that started wrong count. Moving a right spot out of its target costs 10 points.`
            : ''}
        </p>
        <p className="dp-scale-key">
          <span className="ss-key ss-key--start" /> start <span className="ss-key ss-key--dot" /> yours
        </p>
        <ScoreScale handles={review.handles} labels={labels} />
      </details>
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
