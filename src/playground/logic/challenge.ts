import { hashSeed, SeededRng } from '../../engine/prng';
import { Exercise, Grade, Mode } from '../types';
import { FontSpec, pickFont } from './fonts';
import { fontKern, modelKern } from './kern';
import { handleGrade } from './scoring';

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
  /** Kerning only: the typeface whose kerning table is the answer key. */
  font?: FontSpec;
  /** Kerning only: what the word is for and which typeface it is set in, shown above the word. */
  context?: string;
}

export interface ExerciseResult {
  grade: Grade;
  right: number;
  total: number;
  /** 0 to 100. Missing in results saved before scores existed. */
  score?: number;
}

/** One kerning unit is 1/1000 em, as in Illustrator, InDesign and Figma. One square of the grid is 0.1 em. */
export const UNITS_PER_SQUARE = 100;

/** Half-width of a kerning target, in 1/1000 em. Starting value: see design/game-design/plan.md. */
export const KERN_TOLERANCE = 20;

const FINE: Record<Mode['id'], { span: number; step: number }> = {
  kerning: { span: 60, step: 1 },
  tracking: { span: 40, step: 1 },
  leading: { span: 24, step: 1 },
  wordspace: { span: 50, step: 1 },
  measure: { span: 12, step: 0.5 },
  paragraph: { span: 40, step: 1 },
  margins: { span: 40, step: 1 },
};

/**
 * Words to draw from. Each is rich in pairs that a type designer kerns: diagonals, overhangs and rounds.
 * Capitals are kept as written. Lower-case words get a capital first letter.
 */
export const KERN_WORDS = [
  'Type', 'Wave', 'Yacht', 'Avoid', 'Tower', 'Voyage', 'Travel', 'Lava', 'Party', 'Tavern', 'Avenue', 'Toast',
  'Yoga', 'Value', 'Rover', 'Fjord', 'Kayak', 'Pyramid', 'Lyra', 'Today', 'Vortex', 'Wolf', 'Paw', 'Raven',
  'AVATAR', 'WAVY', 'LATTE', 'TOKYO', 'VAULT', 'YOLK', 'AWAY', 'FLY', 'PLAY', 'VELVET', 'ATLAS', 'LAYOUT',
];

/** Context for a kerning drill: the use, the typeface, and the fact that tracking is the learner's choice. */
export function kernContext(font: FontSpec, word: string): string {
  const use = /^[A-Z]+$/.test(word) ? 'A title in capitals' : 'A display word, such as a logo or a heading';
  return `${use}, set large in ${font.name}, ${font.desc}. Set the whole word tighter or looser if you like. That is tracking, and it is not scored.`;
}

/** The passing range for a pair, in 1/1000 em, centred on a kerning value. */
export function kernTarget(kern: number): Target {
  return { lo: kern - KERN_TOLERANCE, hi: kern + KERN_TOLERANCE };
}

/** The passing range for a pair from the model. Used when no font is measured. */
export function pairTarget(left: string, right: string): Target {
  return kernTarget(modelKern(left, right));
}

/** A four-character hex code for one exercise in a run, so each exercise draws its own numbers. */
function exerciseCode(seed: string, index: number): string {
  const n = (hashSeed(seed) + Math.imul(index + 1, 0x9e37)) & 0xffff;
  return n.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * A start value well away from the target, kept inside the slider range.
 * The distance is set in target widths, not as a share of the range, and the side is random when both fit.
 * So the start does not tell the learner which way to move.
 */
export function farStart(target: Target, min: number, max: number, rng: SeededRng): number {
  const span = max - min;
  const half = (target.hi - target.lo) / 2;
  const centre = (target.lo + target.hi) / 2;
  const unit = Math.max(half, span * 0.06);
  const distance = half + unit * rng.range(1.2, 3.5);
  const up = centre + distance;
  const down = centre - distance;
  const upOk = up <= max;
  const downOk = down >= min;
  let value: number;
  if (upOk && downOk) value = rng.chance() ? up : down;
  else if (upOk) value = up;
  else if (downOk) value = down;
  else value = max - target.hi > target.lo - min ? max : min;
  return Math.round(value * 2) / 2;
}

const word = (s: string) => (s === s.toUpperCase() ? s : s.charAt(0).toUpperCase() + s.slice(1));

/** The typeface for one kerning exercise of a run. */
export function kernFontFor(seed: string, index: number): FontSpec {
  return pickFont(new SeededRng(exerciseCode(seed, index) + 'F'));
}

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
  let font: FontSpec | undefined;

  switch (mode.id) {
    case 'kerning': {
      // One word per exercise, drawn without repeats from the whole list.
      const picked = word(new SeededRng(exerciseCode(seed, 0)).shuffle(KERN_WORDS)[index % KERN_WORDS.length]);
      parts = Array.from(picked);
      text = picked;
      font = kernFontFor(seed, index);
      const f = font;
      targets = parts.slice(1).map((ch, i) => kernTarget(fontKern(f, parts[i], ch)));
      labels = parts.slice(1).map((ch, i) => `Space between ${parts[i]} and ${ch}`);
      prompt = 'Kern every pair so the word looks evenly spaced.';
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
    font,
    context: font && mode.id === 'kerning' ? kernContext(font, text) : undefined,
  };
}

/** Exact in the centre third of a target, right anywhere inside it, otherwise off. */
const gradeOne = handleGrade;

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
