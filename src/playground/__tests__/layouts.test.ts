import { describe, expect, it } from 'vitest';
import { buildDrift, DRIFT_HALF, LAYOUT_JOBS } from '../content/layouts';
import { driftNotes } from '../logic/notes';
import { BREAK_PENALTY, reviewAnswer } from '../logic/scoring';

const SEEDS = ['0000', '4F9A', 'BEEF', 'C0DE', '1234', 'A1B2', 'FFFF', '7777'];

describe('Spot the drift layouts', () => {
  it('builds the same page from the same seed', () => {
    expect(buildDrift('4F9A')).toEqual(buildDrift('4F9A'));
  });

  for (const job of LAYOUT_JOBS) {
    it(`puts every ${job} block on grid lines, inside the page, with no overlap`, () => {
      for (const seed of SEEDS) {
        const l = buildDrift(seed, job);
        const g = l.grid;
        expect(l.blocks.length).toBeGreaterThanOrEqual(3);
        for (const b of l.blocks) {
          expect(g.colLeft).toContain(b.x);
          expect(g.rowTop).toContain(b.y);
          expect(g.colRight).toContain(b.x + b.w);
          expect(g.rowBottom).toContain(b.y + b.h);
        }
        // Grid cells are used once.
        const cells = new Set<string>();
        for (const b of l.blocks)
          for (let c = b.col; c < b.col + b.span; c++)
            for (let r = b.row; r < b.row + b.rowSpan; r++) {
              expect(cells.has(`${c},${r}`)).toBe(false);
              cells.add(`${c},${r}`);
            }
      }
    });
  }

  it('drifts at least two blocks, each out of its target, each with a block that shares the line', () => {
    for (const job of LAYOUT_JOBS) {
      for (const seed of SEEDS) {
        const l = buildDrift(seed, job);
        const drifted = new Set<number>();
        l.start.forEach((v, h) => {
          if (v === 0) return;
          drifted.add(Math.floor(h / 2));
          expect(Math.abs(v)).toBeGreaterThan(DRIFT_HALF * 2);
          expect(Math.abs(v)).toBeLessThanOrEqual(DRIFT_HALF * 5.5 + 1);
          expect(l.anchors[h]).toBeGreaterThanOrEqual(0);
          expect(l.start[l.anchors[h] * 2 + (h % 2)]).toBe(0);
          // The drifted block stays on the page.
          const b = l.blocks[Math.floor(h / 2)];
          if (h % 2 === 0) expect(b.x + v >= 0 && b.x + b.w + v <= l.w).toBe(true);
          else expect(b.y + v >= 0 && b.y + b.h + v <= l.h).toBe(true);
        });
        expect(drifted.size).toBeGreaterThanOrEqual(2);
        expect(drifted.size).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('Spot the drift scoring', () => {
  const l = buildDrift('4F9A', 'dashboard');
  const fixed = l.start.map(() => 0);

  it('scores 100 when every block is back and 0 when nothing moved', () => {
    expect(reviewAnswer(fixed, l.start, l.targets, l.groups).score).toBe(100);
    expect(reviewAnswer(l.start, l.start, l.targets, l.groups).score).toBe(0);
  });

  it('takes one penalty per good block broken, even when both of its axes move', () => {
    const good = l.blocks.findIndex((_, i) => l.start[i * 2] === 0 && l.start[i * 2 + 1] === 0);
    const vals = [...fixed];
    vals[good * 2] = 30;
    vals[good * 2 + 1] = -30;
    const r = reviewAnswer(vals, l.start, l.targets, l.groups);
    expect(r.penalty).toBe(BREAK_PENALTY);
    expect(r.score).toBe(100 - BREAK_PENALTY);
    expect(driftNotes(r, l)[0].title).toBe(`${l.blocks[good].label}: this block was already on the grid`);
  });

  it('names the direction, the size and a block to line up with', () => {
    const h = l.start.findIndex((v) => v !== 0);
    const b = l.blocks[Math.floor(h / 2)];
    const vals = [...fixed];
    vals[h] = 15;
    const notes = driftNotes(reviewAnswer(vals, l.start, l.targets, l.groups), l);
    const dir = h % 2 === 0 ? 'too far right' : 'too low';
    expect(notes[0].title).toBe(`${b.label}: 15 px ${dir}`);
    expect(notes[0].body).toMatch(new RegExp(`^Line its (left edge|right edge|top|bottom) up with ${l.blocks[l.anchors[h]].label}\\.$`));
  });
});
