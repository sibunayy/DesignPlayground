import React, { useState } from 'react';
import { QuizQuestion } from '../logic/quiz';
import { Mode } from '../types';
import { Specimen } from './Specimen';

interface QuizProps {
  mode: Mode;
  questions: QuizQuestion[];
  best: number;
  /** Called once at the end with the number of correct answers. */
  onFinish: (score: number) => void;
  onPractice: () => void;
  onHub: () => void;
}

const LETTERS = ['A', 'B'] as const;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** A/B quiz: the learner picks the sample with the better space. */
export const Quiz: React.FC<QuizProps> = ({ mode, questions, best, onFinish, onPractice, onHub }) => {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<0 | 1 | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const restart = () => {
    setIndex(0);
    setChoice(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const total = questions.length;
    return (
      <main className="dp-quiz">
        <section className="dp-quiz-result" aria-labelledby="dp-quiz-result-title">
          <p className="dp-dock-label">{mode.name} quiz</p>
          <h1 id="dp-quiz-result-title" className="dp-quiz-title">
            You chose {score} of {total} correctly.
          </h1>
          <p className="dp-quiz-text">
            {score === total
              ? 'All correct. Your eye sees this space clearly.'
              : 'Practise the exercises for this mode, then try the quiz again.'}{' '}
            Best score: {Math.max(best, score)} of {total}.
          </p>
          <div className="dp-quiz-actions">
            <button type="button" className="dp-btn-primary" onClick={restart}>
              Try the quiz again
            </button>
            <button type="button" className="dp-btn-secondary" onClick={onPractice}>
              Practise {mode.name}
            </button>
            <button type="button" className="dp-btn-secondary" onClick={onHub}>
              Choose another mode
            </button>
          </div>
        </section>
      </main>
    );
  }

  const q = questions[index];
  if (!q) return null;
  const answered = choice !== null;
  const correct = choice === q.answer;
  const isLast = index === questions.length - 1;

  const choose = (c: 0 | 1) => {
    if (answered) return;
    setChoice(c);
    if (c === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      const final = score;
      setDone(true);
      onFinish(final);
    } else {
      setIndex((i) => i + 1);
      setChoice(null);
    }
  };

  let message = 'Choose sample A or sample B.';
  if (answered) {
    message = correct
      ? `Correct. Sample ${LETTERS[q.answer]} is balanced. In the other sample: ${lowerFirst(mode.feedback[q.wrong])}`
      : `Not this one. ${mode.feedback[q.wrong]} Sample ${LETTERS[q.answer]} is better.`;
  }

  return (
    <main className="dp-quiz">
      <div className="dp-quiz-head">
        <p className="dp-dock-label">
          Question {index + 1} of {questions.length}: {q.exercise.kind}
        </p>
        <h1 className="dp-quiz-title">{mode.quizQuestion}</h1>
      </div>
      <div className="dp-quiz-choices" role="group" aria-label="Samples">
        {LETTERS.map((letter, i) => {
          const state = !answered ? '' : i === q.answer ? ' dp-quiz-card--right' : i === choice ? ' dp-quiz-card--wrong' : '';
          return (
            <button
              key={letter}
              type="button"
              className={`dp-quiz-card${state}`}
              aria-label={`Choose sample ${letter}`}
              aria-pressed={choice === i}
              disabled={answered && choice !== i && i !== q.answer}
              onClick={() => choose(i as 0 | 1)}
            >
              <span className="dp-quiz-letter" aria-hidden="true">
                {letter}
              </span>
              <Specimen exercise={q.exercise} value={q.values[i]} label={`Sample ${letter}`} />
            </button>
          );
        })}
      </div>
      <div className="dp-quiz-foot">
        <p className="dp-message" aria-live="polite">
          {message}
        </p>
        {answered && (
          <button type="button" className="dp-btn-primary" onClick={next}>
            {isLast ? 'See your score' : 'Next question'}
          </button>
        )}
      </div>
    </main>
  );
};
