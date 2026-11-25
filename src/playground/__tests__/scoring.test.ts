import { describe, expect, it } from 'vitest';
import { SeededRng } from '../../engine/prng';
import { buildScene, GENRE_IDS } from '../content/scenes';
import { farStart, KERN_TOLERANCE } from '../logic/challenge';
import { kernNotes } from '../logic/notes';
import { BREAK_PENALTY, handleScore, reviewAnswer } from '../logic/scoring';

const t = { lo: -20, hi: 20 };

describe('handleScore', () => {
  it('gives 100 in the centre third, 70 at the edge and 0 three half-widths out', () => {
    expect(handleScore(0, t)).toBe(100);
    expect(handleScore(6, t)).toBe(100);
    expect(handleScore(20, t)).toBe(70);
    expect(handleScore(-20, t)).toBe(70);
    expect(handleScore(60, t)).toBe(0);
    expect(handleScore(-200, t)).toBe(0);
  });
  it('falls as the error grows', () => {
    let last = 101;
    for (let e = 0; e <= 60; e += 5) {
      const s = handleScore(e, t);
      expect(s).toBeLessThanOrEqual(last);
      last = s;
    }
  });
});

describe('reviewAnswer', () => {
  it('gives no points to a drill answer the learner never moved', () => {
    const r = reviewAnswer([45], [45], [t]);
    expect(r.score).toBe(0);
    expect(r.handles[0].untouched).toBe(true);
  });
  it('in a scene, scores only the broken pairs and takes points off for breaking good ones', () => {
    const targets = [t, t, t];
    const start = [0, 80, -80];
    expect(reviewAnswer(start, start, targets).score).toBe(0);
    expect(reviewAnswer([0, 0, 0], start, targets).score).toBe(100);
    const broke = reviewAnswer([90, 0, 0], start, targets);
    expect(broke.penalty).toBe(BREAK_PENALTY);
    expect(broke.score).toBe(100 - BREAK_PENALTY);
    expect(broke.handles[0].broken).toBe(true);
  });
});

describe('farStart', () => {
  it('does not always start on the same side of the target', () => {
    const rng = new SeededRng('A1B2');
    const sides = new Set<number>();
    for (let i = 0; i < 40; i++) sides.add(Math.sign(farStart({ lo: -100, hi: -60 }, -300, 300, rng) + 80));
    expect(sides).toEqual(new Set([1, -1]));
  });
});

describe('scenes', () => {
  it('builds the same scene from the same seed', () => {
    expect(buildScene('4F9A')).toEqual(buildScene('4F9A'));
  });
  it('builds every job, with fixed word spaces and at least two broken pairs', () => {
    for (const g of GENRE_IDS) {
      for (const seed of ['0000', '4F9A', 'BEEF', 'C0DE', '1234']) {
        const s = buildScene(seed, g);
        expect(s.genre).toBe(g);
        expect(s.gapHandle).toHaveLength(s.letters.length - 1);
        s.letters.forEach((ch, i) => {
          if (ch === ' ') {
            if (i > 0) expect(s.gapHandle[i - 1]).toBeNull();
            if (i < s.letters.length - 1) expect(s.gapHandle[i]).toBeNull();
          }
        });
        expect(s.targets).toHaveLength(s.pairs.length);
        expect(s.start).toHaveLength(s.pairs.length);
        const broken = s.start.filter((v, i) => v < s.targets[i].lo || v > s.targets[i].hi).length;
        expect(broken).toBeGreaterThanOrEqual(Math.min(2, s.pairs.length));
        s.targets.forEach((tg) => expect(tg.hi - tg.lo).toBe(KERN_TOLERANCE * 2));
      }
    }
  });
});

describe('kernNotes', () => {
  it('names the pair, the direction and the font value, worst first', () => {
    const r = reviewAnswer([60, 5], [200, 200], [{ lo: -100, hi: -60 }, t]);
    const notes = kernNotes(r, [['A', 'V'], ['n', 'n']]);
    expect(notes[0].title).toBe('AV: too open by 140');
    expect(notes[0].body).toMatch(/Close it up\. Yours \+60, type designer -80\./);
    expect(notes.at(-1)!.title).toBe('1 pair exact');
  });
  it('says when a pair was right at the start and the learner broke it', () => {
    const r = reviewAnswer([90], [0], [t]);
    expect(kernNotes(r, [['H', 'H']])[0].title).toBe('HH: this pair was already right');
  });
});
