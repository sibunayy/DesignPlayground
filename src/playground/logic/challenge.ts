import { hashSeed, SeededRng } from '../../engine/prng';
import { Exercise, Grade, Mode } from '../types';

/**
 * A challenge is one exercise turned into a small test: several things to set, each with its own
 * hidden target, and a start position that is far from the target. Nothing on screen says how
 * close the learner is. The same seed always builds the same challenge.
 */

export interface Target {
  lo: number;
  hi: number;
}

export interface Challenge {
  seed: string;
  exercise: Exercise;
  /** What the handles act on: letters (kerning), words (word spacing), paragraphs, or nothing. */
  parts: string[];
  /** One target per handle, in the same order as `start`. */
  targets: Target[];
  start: number[];
  min: number;
  max: number;
  /** Accessible name for each handle. Never says anything about the answer. */
  labels: string[];
  prompt: string;
  /** Range of the fine-control slider on either side of the picked-up value, and its step. */
  fine: { span: number; step: number };
}

export interface ExerciseResult {
  grade: Grade;
  right: number;
  total: number;
}

/** One kerning unit is 1/290 em. Forty units make one square of the grid. */
export const UNITS_PER_SQUARE = 40;

const FINE: Record<Mode['id'], { span: number; step: number }> = {
  kerning: { span: 24, step: 1 },
  tracking: { span: 40, step: 1 },
  leading: { span: 24, step: 1 },
  wordspace: { span: 50, step: 1 },
  measure: { span: 12, step: 0.5 },
  paragraph: { span: 40, step: 1 },
  margins: { span: 40, step: 1 },
};

/** Six or more words to draw from. Each letter must appear in SIDES. */
export const KERN_WORDS = [
  'Type', 'Home', 'Light', 'River', 'Quilt', 'Frame', 'Stone', 'Water', 'Index', 'Grain', 'Print', 'Beach',
  'Pixel', 'Mango', 'Ocean', 'Table', 'Voice', 'Wheel', 'Youth', 'Craft', 'Drift', 'Flame', 'Plumb', 'Skate',
  'Glyph', 'Tower', 'Yacht', 'Block', 'Fresh', 'Orange', 'Wave', 'Avoid', 'Punch', 'Mirror', 'Panel', 'Lunar',
];

/**
 * How closed each side of a letter is: 3 is a straight stem, 2 a round, 1 a partly open side,
 * 0 an open or diagonal side. A pair needs more room the more closed its two facing sides are.
 * Prototype values: confirm them with a typographer before release.
 */
const SIDES: Record<string, [number, number]> = {
  A: [0, 0], B: [3, 2], C: [2, 1], D: [3, 2], E: [3, 1], F: [3, 0.5], G: [2, 2.5], H: [3, 3], I: [3, 3],
  J: [1, 2], K: [3, 0.5], L: [3, 0.5], M: [3, 3], N: [3, 3], O: [2, 2], P: [3, 1], Q: [2, 2], R: [3, 1],
  S: [2, 2], T: [0, 0], U: [3, 3], V: [0, 0], W: [0, 0], X: [0, 0], Y: [0, 0], Z: [1, 1],
  a: [2, 3], b: [3, 2], c: [2, 1.5], d: [2, 3], e: [2, 1.5], f: [1, 0.5], g: [2, 3], h: [3, 3], i: [3, 3],
  j: [1, 3], k: [3, 0.5], l: [3, 3], m: [3, 3], n: [3, 3], o: [2, 2], p: [3, 2], q: [2, 3], r: [3, 0.5],
  s: [1.5, 1.5], t: [1, 1], u: [3, 3], v: [0, 0], w: [0, 0], x: [0, 0.5], y: [0, 0.5], z: [1, 1],
};

const PAIR_BASE = 8;
const PAIR_PER_SIDE = 8;
const PAIR_TOLERANCE = 15;

/** The passing range for the space between two letters, in kerning units. */
export function pairTarget(left: string, right: string): Target {
  const a = SIDES[left] ?? [2, 2];
  const b = SIDES[right] ?? [2, 2];
  const centre = PAIR_BASE + PAIR_PER_SIDE * (a[1] + b[0]);
  return { lo: centre - PAIR_TOLERANCE, hi: centre + PAIR_TOLERANCE };
}

/** A four-character hex code for one exercise in a run, so each exercise draws its own numbers. */
function exerciseCode(seed: string, index: number): string {
  const n = (hashSeed(seed) + Math.imul(index + 1, 0x9e37)) & 0xffff;
  return n.toString(16).toUpperCase().padStart(4, '0');
}

/** A start value well away from the target, on a random side, kept inside the slider range. */
export function farStart(target: Target, min: number, max: number, rng: SeededRng): number {
  const span = max - min;
  const centre = (target.lo + target.hi) / 2;
  const distance = rng.range(0.28, 0.5) * span;
  const sign = rng.chance() ? 1 : -1;
  let value = centre + sign * distance;
  if (value > max || value < min) value = centre - sign * distance;
  value = Math.min(max, Math.max(min, value));
  return Math.round(value * 2) / 2;
}

const word = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Builds the challenge for one exercise of a run. */
export function buildChallenge(exercise: Exercise, mode: Mode, seed: string, index: number): Challenge {
  const rng = new SeededRng(exerciseCode(seed, index));
  const { min, max } = mode.slider;
  const fine = FINE[mode.id];
  let parts: string[] = [];
  let targets: Target[];
  let labels: string[];
  let text = exercise.text;
  let prompt = exercise.prompt;

  switch (mode.id) {
    case 'kerning': {
      // One word per exercise, drawn without repeats from the whole list.
      const picked = word(new SeededRng(exerciseCode(seed, 0)).shuffle(KERN_WORDS)[index % KERN_WORDS.length]);
      parts = Array.from(picked);
      text = picked;
      targets = parts.slice(1).map((ch, i) => pairTarget(parts[i], ch));
      labels = parts.slice(1).map((ch, i) => `Space between ${parts[i]} and ${ch}`);
      prompt = 'Space every pair of letters so the word looks even.';
      break;
    }
    case 'wordspace': {
      parts = exercise.text.split(' ');
      targets = parts.slice(1).map(() => ({ lo: exercise.lo, hi: exercise.hi }));
      labels = parts.slice(1).map((w, i) => `Space between ${parts[i]} and ${w}`);
      break;
    }
    case 'paragraph': {
      parts = exercise.text.split('\n\n');
      targets = parts.slice(1).map(() => ({ lo: exercise.lo, hi: exercise.hi }));
      labels = parts.slice(1).map((_, i) => `Space after paragraph ${i + 1}`);
      break;
    }
    case 'margins': {
      const half = exercise.box === 'button';
      targets = [
        { lo: exercise.lo, hi: exercise.hi },
        half ? { lo: exercise.lo / 2, hi: exercise.hi / 2 } : { lo: exercise.lo, hi: exercise.hi },
      ];
      labels = ['Space at the sides', 'Space above and below'];
      break;
    }
    case 'tracking':
      targets = [{ lo: exercise.lo, hi: exercise.hi }];
      labels = ['Tracking'];
      break;
    case 'leading':
      targets = [{ lo: exercise.lo, hi: exercise.hi }];
      labels = ['Leading'];
      break;
    case 'measure':
      targets = [{ lo: exercise.lo, hi: exercise.hi }];
      labels = ['Line length'];
      break;
  }

  const start = targets.map((t) => farStart(t, min, max, rng));
  return {
    seed,
    exercise: text === exercise.text ? exercise : { ...exercise, text },
    parts,
    targets,
    start,
    min,
    max,
    labels,
    prompt,
    fine,
  };
}

/** Exact in the centre third of a target, right anywhere inside it, otherwise off. */
function gradeOne(value: number, t: Target): Grade {
  if (value < t.lo || value > t.hi) return 'miss';
  const centre = (t.lo + t.hi) / 2;
  return Math.abs(value - centre) <= (t.hi - t.lo) / 6 ? 'exact' : 'zone';
}

/** Grades a whole answer. Exact needs every handle exact, in the zone needs every handle inside its range. */
export function gradeAnswer(values: number[], targets: Target[]): ExerciseResult {
  const each = targets.map((t, i) => gradeOne(values[i], t));
  const right = each.filter((g) => g !== 'miss').length;
  const grade: Grade = each.every((g) => g === 'exact') ? 'exact' : right === each.length ? 'zone' : 'miss';
  return { grade, right, total: each.length };
}

const RANK: Record<Grade, number> = { miss: 0, zone: 1, exact: 2 };

/** Keeps the better of two grades. */
export function betterGrade(a: Grade | undefined, b: Grade): Grade {
  return a !== undefined && RANK[a] > RANK[b] ? a : b;
}
