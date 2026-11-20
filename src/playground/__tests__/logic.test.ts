import { describe, expect, it } from 'vitest';
import { exercisesFor, splitPair } from '../content/exercises';
import { lessonsFor } from '../content/lessons';
import { getMode, MODES } from '../content/modes';
import {
  betterGrade,
  checkValue,
  feedbackMessage,
  gradeMessage,
  gradeValue,
  readout,
  trackFraction,
  zoneText,
} from '../logic/check';

describe('checkValue', () => {
  it('passes the ends of the range', () => {
    expect(checkValue(10, 10, 20)).toBe('good');
    expect(checkValue(20, 10, 20)).toBe('good');
  });
  it('says tight below and loose above', () => {
    expect(checkValue(9, 10, 20)).toBe('tight');
    expect(checkValue(21, 10, 20)).toBe('loose');
  });
});

describe('grades', () => {
  it('marks the centre third of the zone as exact', () => {
    expect(gradeValue(15, 0, 30)).toBe('exact');
    expect(gradeValue(10, 0, 30)).toBe('exact');
    expect(gradeValue(9, 0, 30)).toBe('zone');
    expect(gradeValue(31, 0, 30)).toBeNull();
  });
  it('says which way to move for an exact answer', () => {
    expect(gradeMessage(15, 0, 30)).toBe('Exact answer.');
    expect(gradeMessage(2, 0, 30)).toMatch(/higher/);
    expect(gradeMessage(28, 0, 30)).toMatch(/lower/);
    expect(gradeMessage(40, 0, 30)).toBe('');
  });
  it('keeps the better grade', () => {
    expect(betterGrade(undefined, 'zone')).toBe('zone');
    expect(betterGrade('exact', 'zone')).toBe('exact');
    expect(betterGrade('zone', 'exact')).toBe('exact');
  });
});

describe('feedback and readout', () => {
  const kerning = getMode('kerning')!;
  const ex = exercisesFor('kerning')[0];
  it('uses the last-exercise message on the last good check', () => {
    expect(feedbackMessage(kerning, 'good', true)).toBe(kerning.feedback.goodLast);
    expect(feedbackMessage(kerning, 'good', false)).toBe(kerning.feedback.good);
    expect(feedbackMessage(kerning, '', false)).toBe(kerning.feedback.idle);
  });
  it('shows kerning gaps in squares', () => {
    expect(readout(kerning, 40, ex)).toBe('Gap: 1 square');
    expect(readout(kerning, 100, ex)).toBe('Gap: 2.5 squares');
    expect(zoneText(kerning, ex)).toMatch(/^Correct zone: \d\.\d to \d\.\d squares$/);
  });
  it('signs word space and shows leading in px', () => {
    expect(readout(getMode('wordspace')!, 30, exercisesFor('wordspace')[0])).toBe('Word space: +30 units');
    const lead = exercisesFor('leading')[0];
    expect(readout(getMode('leading')!, 100, lead)).toBe(`Leading: 100% (${lead.size} px)`);
  });
  it('shows paragraph space in lines', () => {
    const para = exercisesFor('paragraph')[0];
    expect(readout(getMode('paragraph')!, 100, para)).toBe('Paragraph space: 100% (1 line)');
    expect(readout(getMode('paragraph')!, 50, para)).toBe('Paragraph space: 50% (0.5 lines)');
  });
  it('clamps the track fraction', () => {
    expect(trackFraction(-10, 0, 100)).toBe(0);
    expect(trackFraction(150, 0, 100)).toBe(1);
    expect(trackFraction(5, 5, 5)).toBe(0);
  });
});

describe('content integrity', () => {
  for (const mode of MODES) {
    describe(mode.name, () => {
      it('has six lesson steps in order', () => {
        const steps = lessonsFor(mode.id);
        expect(steps).toHaveLength(6);
        expect(steps.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(new Set(steps.map((s) => s.id)).size).toBe(6);
      });
      it('has exercises that start outside the answer and fit the slider', () => {
        const list = exercisesFor(mode.id);
        expect(list.length).toBeGreaterThanOrEqual(3);
        expect(new Set(list.map((e) => e.id)).size).toBe(list.length);
        const { min, max, step } = mode.slider;
        for (const ex of list) {
          expect(ex.lo).toBeLessThanOrEqual(ex.hi);
          expect(ex.lo).toBeGreaterThanOrEqual(min);
          expect(ex.hi).toBeLessThanOrEqual(max);
          expect(ex.start).toBeGreaterThanOrEqual(min);
          expect(ex.start).toBeLessThanOrEqual(max);
          expect((ex.start - min) % step).toBe(0);
          expect(checkValue(ex.start, ex.lo, ex.hi)).not.toBe('good');
          // At least one slider stop must land inside the answer zone.
          const firstStop = min + Math.ceil((ex.lo - min) / step) * step;
          expect(firstStop).toBeLessThanOrEqual(ex.hi);
          // An exact answer must also be reachable on a slider stop.
          let exactStop = false;
          for (let v = min; v <= max; v += step) if (gradeValue(v, ex.lo, ex.hi) === 'exact') exactStop = true;
          expect({ id: ex.id, exactStop }).toEqual({ id: ex.id, exactStop: true });
        }
      });
    });
  }
  it('splits a kerning pair at the bar', () => {
    expect(splitPair('T|ype')).toEqual({ left: 'T', rest: 'ype' });
  });
});
