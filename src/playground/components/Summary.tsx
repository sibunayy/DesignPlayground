import React from 'react';
import { ExerciseResult } from '../logic/challenge';
import { scoreWord } from '../logic/scoring';
import { Exercise, Grade, Mode } from '../types';

interface SummaryProps {
  mode: Mode;
  exercises: Exercise[];
  /** This run's result for each exercise id. */
  results: Record<string, ExerciseResult>;
  seed: string;
  /** Best run score in this mode, including this run. */
  runBest: number;
  onPracticeAgain: () => void;
  /** Kerning only: open the real-world work area. */
  onScene?: () => void;
  onQuiz: () => void;
  onHub: () => void;
}

const GRADE_TEXT: Record<Grade, string> = { exact: 'Exact', zone: 'In the zone', miss: 'Missed' };

/** Shown after the last exercise of a run. This is the first time the learner sees any score. */
export const Summary: React.FC<SummaryProps> = ({ mode, exercises, results, seed, runBest, onPracticeAgain, onScene, onQuiz, onHub }) => {
  const rows = exercises.map((e, i) => ({ e, i, r: results[e.id] }));
  const inZone = rows.filter(({ r }) => r && r.grade !== 'miss').length;
  const exact = rows.filter(({ r }) => r?.grade === 'exact').length;
  const score = Math.round(rows.reduce((sum, { r }) => sum + (r?.score ?? 0), 0) / Math.max(1, exercises.length));
  const isBest = score >= runBest && score > 0;
  return (
    <main className="dp-quiz">
      <section className="dp-quiz-result" aria-labelledby="dp-summary-title">
        <p className="dp-dock-label">
          {mode.name} results, seed #{seed}
        </p>
        <h1 id="dp-summary-title" className="dp-quiz-title">
          {score}/100. {scoreWord(score)}.
        </h1>
        <p className="dp-quiz-text">
          {inZone} of {exercises.length} in the zone, {exact} exact. {isBest ? 'New best run.' : `Best run: ${runBest}.`}
        </p>
        <ul className="dp-summary-list">
          {rows.map(({ e, i, r }) => (
            <li key={e.id} className="dp-summary-row">
              <span>
                {i + 1}. {e.kind}
              </span>
              <span className={`dp-summary-grade${r?.grade === 'exact' ? ' dp-summary-grade--exact' : ''}`}>
                {r ? `${r.score ?? 0} \u00b7 ${GRADE_TEXT[r.grade]}, ${r.right} of ${r.total} spots` : 'Not locked in'}
              </span>
            </li>
          ))}
        </ul>
        <div className="dp-quiz-actions">
          <button type="button" className="dp-btn-primary" onClick={onPracticeAgain}>
            New seed
          </button>
          {onScene && (
            <button type="button" className="dp-btn-secondary" onClick={onScene}>
              Kern on a real page
            </button>
          )}
          <button type="button" className="dp-btn-secondary" onClick={onQuiz}>
            Take the {mode.name} quiz
          </button>
          <button type="button" className="dp-btn-secondary" onClick={onHub}>
            Choose another mode
          </button>
        </div>
      </section>
    </main>
  );
};
