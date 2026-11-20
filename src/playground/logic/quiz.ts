import { exercisesFor } from '../content/exercises';
import { getMode } from '../content/modes';
import { Exercise, ModeId } from '../types';

export interface QuizQuestion {
  exercise: Exercise;
  /** Value for sample A and sample B. */
  values: [number, number];
  /** Index of the better sample: 0 for A, 1 for B. */
  answer: 0 | 1;
  /** What is wrong with the other sample. */
  wrong: 'tight' | 'loose';
}

const snap = (v: number, step: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(v / step) * step));

/**
 * One A/B question per exercise. The good sample sits at the centre of the zone.
 * The poor sample sits well outside the zone: below it and above it in turn.
 */
export function buildQuiz(modeId: ModeId): QuizQuestion[] {
  const mode = getMode(modeId);
  if (!mode) return [];
  const { min, max, step } = mode.slider;
  return exercisesFor(modeId).map((exercise, i) => {
    const { lo, hi } = exercise;
    const good = snap((lo + hi) / 2, step, lo, hi);
    const far = Math.max(hi - lo, step * 4);
    let wrong: 'tight' | 'loose' = i % 2 === 0 ? 'tight' : 'loose';
    let poor = wrong === 'tight' ? snap(lo - far, step, min, max) : snap(hi + far, step, min, max);
    // At the end of the slider there is no room on that side: use the other side.
    if (poor >= lo && poor <= hi) {
      wrong = wrong === 'tight' ? 'loose' : 'tight';
      poor = wrong === 'tight' ? snap(lo - far, step, min, max) : snap(hi + far, step, min, max);
    }
    const answer: 0 | 1 = (i * 5 + modeId.length) % 2 === 0 ? 0 : 1;
    const values: [number, number] = answer === 0 ? [good, poor] : [poor, good];
    return { exercise, values, answer, wrong };
  });
}
