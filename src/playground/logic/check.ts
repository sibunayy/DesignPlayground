import { CheckResult, Exercise, Mode } from '../types';

/** Compares a slider value with the exercise range. Ends of the range pass. */
export function checkValue(value: number, lo: number, hi: number): Exclude<CheckResult, ''> {
  if (value > hi) return 'loose';
  if (value < lo) return 'tight';
  return 'good';
}

export function feedbackMessage(mode: Mode, result: CheckResult, isLastExercise: boolean): string {
  if (result === '') return mode.feedback.idle;
  if (result === 'good') return isLastExercise ? mode.feedback.goodLast : mode.feedback.good;
  return mode.feedback[result];
}

/** Position of a value on a 0..1 track for the slider range. */
export function trackFraction(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

const oneDecimal = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

/** Kerning: 40 units equal one square of gap. */
export const UNITS_PER_SQUARE = 40;

export function readout(mode: Mode, value: number, exercise: Exercise): string {
  switch (mode.id) {
    case 'kerning': {
      const sq = value / UNITS_PER_SQUARE;
      return `Gap: ${Math.round(sq * 10) / 10} ${sq === 1 ? 'square' : 'squares'}`;
    }
    case 'tracking':
      return `Tracking: ${value} units`;
    case 'leading':
      return `Leading: ${value}% (${Math.round((exercise.size * value) / 100)} px)`;
    case 'wordspace':
      return `Word space: ${value > 0 ? '+' : ''}${value} units`;
    case 'measure':
      return `Line length: ${value} characters`;
  }
}

export function zoneText(mode: Mode, exercise: Exercise): string {
  switch (mode.id) {
    case 'kerning':
      return `Correct zone: ${oneDecimal(exercise.lo / UNITS_PER_SQUARE)} to ${oneDecimal(
        exercise.hi / UNITS_PER_SQUARE
      )} squares`;
    case 'leading':
      return `Correct zone: ${exercise.lo}% to ${exercise.hi}%`;
    case 'measure':
      return `Correct zone: ${exercise.lo} to ${exercise.hi} characters`;
    default:
      return `Correct zone: ${exercise.lo} to ${exercise.hi} units`;
  }
}
