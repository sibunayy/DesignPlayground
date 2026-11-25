import { Grade } from '../types';
import type { Target } from './challenge';

/**
 * Points for one handle. Starting values (see design/game-design/plan.md, "Scoring"):
 * centre third of the target = 100, edge of the target = 70, three half-widths out = 0.
 */
export const SCORE_EXACT = 100;
export const SCORE_ZONE_EDGE = 70;
export const SCORE_ZERO_AT = 3;

export const centreOf = (t: Target) => (t.lo + t.hi) / 2;
export const halfOf = (t: Target) => (t.hi - t.lo) / 2;

export function handleScore(value: number, t: Target): number {
  const half = halfOf(t);
  const err = Math.abs(value - centreOf(t));
  if (half <= 0) return err === 0 ? SCORE_EXACT : 0;
  if (err <= half / 3) return SCORE_EXACT;
  if (err <= half) return Math.round(SCORE_EXACT - ((err - half / 3) / (half * (2 / 3))) * (SCORE_EXACT - SCORE_ZONE_EDGE));
  const far = half * SCORE_ZERO_AT;
  if (err >= far) return 0;
  return Math.round(SCORE_ZONE_EDGE * (1 - (err - half) / (far - half)));
}

export function handleGrade(value: number, t: Target): Grade {
  if (value < t.lo || value > t.hi) return 'miss';
  return Math.abs(value - centreOf(t)) <= halfOf(t) / 3 ? 'exact' : 'zone';
}

export interface HandleReview {
  index: number;
  value: number;
  start: number;
  target: Target;
  /** Signed error: positive is too open or too much, negative too tight or too little. */
  error: number;
  grade: Grade;
  score: number;
  /** The learner left this handle where it started. */
  untouched: boolean;
  /** The start was already inside the target (scenes only). */
  startedGood: boolean;
  /** A handle that was inside the target at the start and is now outside it. */
  broken: boolean;
  /** This handle counts toward the score. */
  scored: boolean;
}

export interface Review {
  handles: HandleReview[];
  /** 0 to 100. */
  score: number;
  grade: Grade;
  right: number;
  total: number;
  /** Points taken off for handles that were right at the start and are now wrong. */
  penalty: number;
}

/** Points taken off for each correct pair that the learner moved out of its target. Starting value. */
export const BREAK_PENALTY = 10;

/**
 * Reviews one answer. In a drill every handle starts wrong and every handle scores.
 * In a scene some handles start right: only the wrong ones score, and breaking a right one costs points.
 * So locking in without a change scores zero, and changing everything is not a safe plan.
 */
export function reviewAnswer(values: number[], start: number[], targets: Target[]): Review {
  const handles: HandleReview[] = targets.map((t, i) => {
    const value = values[i];
    const grade = handleGrade(value, t);
    const startedGood = handleGrade(start[i], t) !== 'miss';
    return {
      index: i,
      value,
      start: start[i],
      target: t,
      error: value - centreOf(t),
      grade,
      // In a drill every start is wrong, so a handle the learner never moved earns nothing.
      score: value === start[i] && !startedGood ? 0 : handleScore(value, t),
      untouched: value === start[i],
      startedGood,
      broken: startedGood && grade === 'miss',
      scored: !startedGood,
    };
  });
  const scored = handles.filter((h) => h.scored);
  const counted = scored.length ? scored : handles;
  const base = counted.reduce((s, h) => s + h.score, 0) / counted.length;
  const penalty = handles.filter((h) => h.broken).length * BREAK_PENALTY;
  const score = Math.max(0, Math.round(base - penalty));
  const right = handles.filter((h) => h.grade !== 'miss').length;
  const grade: Grade = handles.every((h) => h.grade === 'exact') ? 'exact' : right === handles.length ? 'zone' : 'miss';
  return { handles, score, grade, right, total: handles.length, penalty };
}

/** A word for a score, shown with the number. */
export function scoreWord(score: number): string {
  if (score >= 95) return 'Pro eye';
  if (score >= 85) return 'Sharp';
  if (score >= 70) return 'Close';
  if (score >= 45) return 'Getting there';
  return 'Keep training';
}
