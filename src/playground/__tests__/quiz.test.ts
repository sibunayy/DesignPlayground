import { describe, expect, it } from 'vitest';
import { EXERCISES, exercisesFor } from '../content/exercises';
import { dailyPickMode, MODE_IDS, MODES } from '../content/modes';
import { checkValue } from '../logic/check';
import { buildQuiz } from '../logic/quiz';
import { playgroundTotals } from '../logic/totals';
import { defaultStore } from '../state/storage';

describe('buildQuiz', () => {
  for (const mode of MODES) {
    it(`${mode.name}: one fair question per exercise`, () => {
      const quiz = buildQuiz(mode.id);
      expect(quiz).toHaveLength(exercisesFor(mode.id).length);
      for (const q of quiz) {
        const { lo, hi } = q.exercise;
        const good = q.values[q.answer];
        const poor = q.values[1 - q.answer];
        expect(checkValue(good, lo, hi)).toBe('good');
        expect(checkValue(poor, lo, hi)).toBe(q.wrong);
        expect(poor).toBeGreaterThanOrEqual(mode.slider.min);
        expect(poor).toBeLessThanOrEqual(mode.slider.max);
      }
      // The answer is not always on the same side.
      if (quiz.length > 1) expect(new Set(quiz.map((q) => q.answer)).size).toBe(2);
    });
  }
});

describe('daily pick', () => {
  it('gives the same valid mode for the same date', () => {
    const a = dailyPickMode('2026-11-20');
    expect(MODE_IDS).toContain(a);
    expect(dailyPickMode('2026-11-20')).toBe(a);
  });

  it('changes over a week', () => {
    const days = ['01', '02', '03', '04', '05', '06', '07'].map((d) => dailyPickMode(`2026-12-${d}`));
    expect(new Set(days).size).toBeGreaterThan(1);
  });
});

describe('playgroundTotals', () => {
  it('counts graded exercises across modes', () => {
    const store = defaultStore();
    store.modes.kerning.best = { 'kerning-ty': 'exact', 'kerning-av': 'zone' };
    store.modes.margins.best = { 'margins-card': 'exact' };
    expect(playgroundTotals(store)).toEqual({ done: 3, exact: 2, total: EXERCISES.length, modes: MODES.length });
  });
});
