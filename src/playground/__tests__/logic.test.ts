import { describe, expect, it } from 'vitest';
import { SeededRng } from '../../engine/prng';
import { exercisesFor, splitPair } from '../content/exercises';
import { lessonsFor } from '../content/lessons';
import { getMode, MODES } from '../content/modes';
import type { ModeId } from '../types';
import {
  betterGrade,
  buildChallenge,
  farStart,
  gradeAnswer,
  KERN_TOLERANCE,
  KERN_WORDS,
  pairTarget,
} from '../logic/challenge';

describe('pairTarget', () => {
  it('gives two straight stems more room than two diagonals', () => {
    const stems = pairTarget('H', 'i');
    const diagonals = pairTarget('V', 'A');
    expect((stems.lo + stems.hi) / 2).toBeGreaterThan((diagonals.lo + diagonals.hi) / 2 + 30);
  });
  it('gives round-to-straight more room than round-to-round', () => {
    const mixed = pairTarget('o', 'n');
    const rounds = pairTarget('o', 'o');
    expect((mixed.lo + mixed.hi) / 2).toBeGreaterThan((rounds.lo + rounds.hi) / 2);
  });
  it('is forty units wide', () => {
    const t = pairTarget('a', 'c');
    expect(t.hi - t.lo).toBe(40);
  });
});

describe('seeded kerning words', () => {
  const mode = getMode('kerning')!;
  const slots = exercisesFor('kerning');

  it('has enough words to give every slot its own', () => {
    expect(new Set(KERN_WORDS).size).toBe(KERN_WORDS.length);
    expect(KERN_WORDS.length).toBeGreaterThanOrEqual(slots.length);
  });
  it('builds the same words and positions from the same seed', () => {
    const a = slots.map((e, i) => buildChallenge(e, mode, '4F9A', i));
    const b = slots.map((e, i) => buildChallenge(e, mode, '4F9A', i));
    expect(b).toEqual(a);
  });
  it('builds different words and positions from different seeds', () => {
    const a = slots.map((e, i) => buildChallenge(e, mode, '4F9A', i));
    const b = slots.map((e, i) => buildChallenge(e, mode, '0B21', i));
    expect(b.map((c) => c.exercise.text)).not.toEqual(a.map((c) => c.exercise.text));
    expect(b.map((c) => c.start)).not.toEqual(a.map((c) => c.start));
  });
  it('uses a different word in every slot of a run', () => {
    for (const seed of ['4F9A', '0B21', 'C0DE', '1234']) {
      const words = slots.map((e, i) => buildChallenge(e, mode, seed, i).exercise.text);
      expect(new Set(words).size).toBe(words.length);
    }
  });
  it('gives every gap in the word its own target and its own wrong start', () => {
    slots.forEach((e, i) => {
      const c = buildChallenge(e, mode, 'A1B2', i);
      expect(c.parts.join('')).toBe(c.exercise.text);
      expect(c.targets).toHaveLength(c.parts.length - 1);
      expect(c.start).toHaveLength(c.parts.length - 1);
      expect(c.labels).toHaveLength(c.parts.length - 1);
      c.start.forEach((v, g) => {
        expect(v < c.targets[g].lo || v > c.targets[g].hi).toBe(true);
      });
    });
  });
});

describe('kerning with pinned ends', () => {
  const mode = getMode('kerning')!;
  const slots = exercisesFor('kerning');

  it('uses only words with at least two letters that can move', () => {
    KERN_WORDS.forEach((w) => expect(w.length).toBeGreaterThanOrEqual(4));
  });

  it('starts with the width of the answer, every gap wrong and no gap out of range', () => {
    for (const seed of ['4F9A', '0B21', 'C0DE', '1234', 'FFFF', '0000', 'A1B2', '7E57']) {
      slots.forEach((e, i) => {
        const c = buildChallenge(e, mode, seed, i);
        expect(c.pinned).toBe(true);
        const centre = c.targets.map((t) => (t.lo + t.hi) / 2);
        const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
        // The first and last letter sit where the answer puts them, so the total is the same.
        expect(sum(c.start)).toBeCloseTo(sum(centre), 6);
        c.start.forEach((v, g) => {
          expect(v).toBeGreaterThanOrEqual(mode.slider.min);
          expect(v).toBeLessThanOrEqual(mode.slider.max);
          expect(Math.abs(v - centre[g])).toBeGreaterThanOrEqual(KERN_TOLERANCE * 3);
        });
      });
    }
  });

  it('does not always push the first gap the same way', () => {
    const signs = new Set<number>();
    for (let n = 0; n < 40; n++) {
      const seed = n.toString(16).toUpperCase().padStart(4, '0');
      const c = buildChallenge(slots[0], mode, seed, 0);
      signs.add(Math.sign(c.start[0] - (c.targets[0].lo + c.targets[0].hi) / 2));
    }
    expect(signs).toEqual(new Set([1, -1]));
  });
});

describe('challenges in every mode', () => {
  for (const mode of MODES) {
    it(`${mode.name}: starts far outside every target and inside the range`, () => {
      for (const seed of ['4F9A', '0B21', 'FFFF', '0000']) {
        exercisesFor(mode.id).forEach((ex, i) => {
          const c = buildChallenge(ex, mode, seed, i);
          expect(c.start).toHaveLength(c.targets.length);
          expect(c.labels).toHaveLength(c.targets.length);
          expect(c.targets.length).toBeGreaterThanOrEqual(1);
          const span = mode.slider.max - mode.slider.min;
          c.start.forEach((v, h) => {
            expect(v).toBeGreaterThanOrEqual(mode.slider.min);
            expect(v).toBeLessThanOrEqual(mode.slider.max);
            const t = c.targets[h];
            expect(t.lo).toBeLessThanOrEqual(t.hi);
            const distance = Math.max(t.lo - v, v - t.hi);
            // A start is never inside a target, and is a clear overshoot or undershoot.
            expect(distance).toBeGreaterThan(span * 0.05);
          });
        });
      }
    });
  }
  it('has more than one thing to set in the advanced modes', () => {
    const count = (id: ModeId, i = 0) =>
      buildChallenge(exercisesFor(id)[i], getMode(id)!, '4F9A', i).targets.length;
    expect(count('kerning')).toBeGreaterThanOrEqual(3);
    expect(count('wordspace')).toBeGreaterThanOrEqual(3);
    expect(count('paragraph')).toBeGreaterThanOrEqual(2);
    expect(count('margins')).toBe(2);
    expect(count('tracking')).toBe(1);
  });
  it('halves the vertical margin target for a button', () => {
    const buttonIndex = exercisesFor('margins').findIndex((e) => e.box === 'button');
    expect(buttonIndex).toBeGreaterThanOrEqual(0);
    const c = buildChallenge(exercisesFor('margins')[buttonIndex], getMode('margins')!, '4F9A', buttonIndex);
    expect(c.targets[1].lo).toBe(c.targets[0].lo / 2);
    expect(c.targets[1].hi).toBe(c.targets[0].hi / 2);
  });
});

describe('farStart', () => {
  it('stays inside the range even when the target is near an end', () => {
    const rng = new SeededRng('4F9A');
    for (let i = 0; i < 200; i++) {
      const v = farStart({ lo: 0, hi: 10 }, 0, 100, rng);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});

describe('gradeAnswer', () => {
  const targets = [
    { lo: 0, hi: 30 },
    { lo: 10, hi: 40 },
  ];
  it('is exact when every handle is in the centre third', () => {
    expect(gradeAnswer([15, 25], targets)).toEqual({ grade: 'exact', right: 2, total: 2 });
  });
  it('is in the zone when every handle is inside but one is off centre', () => {
    expect(gradeAnswer([15, 12], targets)).toEqual({ grade: 'zone', right: 2, total: 2 });
  });
  it('is a miss when any handle is outside, and counts the ones that are right', () => {
    expect(gradeAnswer([15, 80], targets)).toEqual({ grade: 'miss', right: 1, total: 2 });
    expect(gradeAnswer([-5, 80], targets)).toEqual({ grade: 'miss', right: 0, total: 2 });
  });
  it('passes the ends of a target', () => {
    expect(gradeAnswer([0, 40], targets).right).toBe(2);
  });
});

describe('betterGrade', () => {
  it('keeps the better grade', () => {
    expect(betterGrade(undefined, 'miss')).toBe('miss');
    expect(betterGrade('miss', 'zone')).toBe('zone');
    expect(betterGrade('exact', 'zone')).toBe('exact');
    expect(betterGrade('zone', 'miss')).toBe('zone');
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
      it('has distinct exercises whose zones fit the range', () => {
        const list = exercisesFor(mode.id);
        expect(list.length).toBeGreaterThanOrEqual(3);
        expect(new Set(list.map((e) => e.id)).size).toBe(list.length);
        for (const ex of list) {
          expect(ex.lo).toBeLessThanOrEqual(ex.hi);
          expect(ex.lo).toBeGreaterThanOrEqual(mode.slider.min);
          expect(ex.hi).toBeLessThanOrEqual(mode.slider.max);
        }
      });
      it('offers no answer zone to the learner', () => {
        expect(mode.assists).not.toContain('answer' as never);
      });
    });
  }
  it('splits a kerning pair at the bar', () => {
    expect(splitPair('T|ype')).toEqual({ left: 'T', rest: 'ype' });
  });
});
