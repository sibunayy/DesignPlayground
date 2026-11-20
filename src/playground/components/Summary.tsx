import React from 'react';
import { Exercise, Mode, ModeProgress } from '../types';

interface SummaryProps {
  mode: Mode;
  exercises: Exercise[];
  progress: ModeProgress;
  onPracticeAgain: () => void;
  onQuiz: () => void;
  onHub: () => void;
}

/** Shown after the last exercise of a mode: the best grade for each exercise. */
export const Summary: React.FC<SummaryProps> = ({ mode, exercises, progress, onPracticeAgain, onQuiz, onHub }) => {
  const done = exercises.filter((e) => progress.best[e.id]).length;
  const exact = exercises.filter((e) => progress.best[e.id] === 'exact').length;
  return (
    <main className="dp-quiz">
      <section className="dp-quiz-result" aria-labelledby="dp-summary-title">
        <p className="dp-dock-label">{mode.name} summary</p>
        <h1 id="dp-summary-title" className="dp-quiz-title">
          {done === exercises.length ? 'Every exercise is done.' : `${done} of ${exercises.length} exercises done.`}
        </h1>
        <p className="dp-quiz-text">
          {exact} of {exercises.length} exact.{' '}
          {exact < exercises.length
            ? 'Practise again for more exact answers, or test your eye in the quiz.'
            : 'Test your eye in the quiz.'}
        </p>
        <ul className="dp-summary-list">
          {exercises.map((e) => {
            const grade = progress.best[e.id];
            return (
              <li key={e.id} className="dp-summary-row">
                <span>{e.kind}</span>
                <span className={`dp-summary-grade${grade === 'exact' ? ' dp-summary-grade--exact' : ''}`}>
                  {grade === 'exact' ? 'Exact' : grade === 'zone' ? 'In the zone' : 'Not done'}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="dp-quiz-actions">
          <button type="button" className="dp-btn-primary" onClick={onQuiz}>
            Take the {mode.name} quiz
          </button>
          <button type="button" className="dp-btn-secondary" onClick={onPracticeAgain}>
            Practise again
          </button>
          <button type="button" className="dp-btn-secondary" onClick={onHub}>
            Choose another mode
          </button>
        </div>
      </section>
    </main>
  );
};
