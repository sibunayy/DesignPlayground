import { FontSpec, fontReady, fontShorthand } from './fonts';

/**
 * Kerning values are in 1/1000 em, the same unit as the kerning field in Illustrator, InDesign and Figma.
 * Zero is the font's plain spacing with kerning off. The answer is the value in the font's own kerning table.
 */

/** How closed each side of a letter is: 3 is a straight stem, 2 a round, 1 partly open, 0 open or diagonal. */
export const SIDES: Record<string, [number, number]> = {
  A: [0, 0], B: [3, 2], C: [2, 1], D: [3, 2], E: [3, 1], F: [3, 0.5], G: [2, 2.5], H: [3, 3], I: [3, 3],
  J: [1, 2], K: [3, 0.5], L: [3, 0], M: [3, 3], N: [3, 3], O: [2, 2], P: [3, 1], Q: [2, 2], R: [3, 1],
  S: [2, 2], T: [0, 0], U: [3, 3], V: [0, 0], W: [0, 0], X: [0, 0], Y: [0, 0], Z: [1, 1],
  a: [2, 3], b: [3, 2], c: [2, 1.5], d: [2, 3], e: [2, 1.5], f: [1, 0.5], g: [2, 3], h: [3, 3], i: [3, 3],
  j: [1, 3], k: [3, 0.5], l: [3, 3], m: [3, 3], n: [3, 3], o: [2, 2], p: [3, 2], q: [2, 3], r: [3, 0.5],
  s: [1.5, 1.5], t: [1, 1], u: [3, 3], v: [0, 0], w: [0, 0], x: [0, 0.5], y: [0, 0.5], z: [1, 1],
  '.': [0, 0], ',': [0, 0], "'": [0, 0], '&': [2, 1],
};

/** Letters whose arm or bowl overhangs, so the next letter can tuck under it. */
const OVERHANG = new Set(['T', 'F', 'P', 'Y', 'V', 'W', 'r', 'f', '7']);
const OPEN_FOOT = new Set(['L']);

/**
 * Model kerning, used when the font cannot be measured (tests, old browsers).
 * Open sides pull together. Prototype values, not a font's real table.
 */
export function modelKern(left: string, right: string): number {
  const a = SIDES[left] ?? [2, 2];
  const b = SIDES[right] ?? [2, 2];
  return -15 * (6 - (a[1] + b[0]));
}

const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (ctx !== undefined) return ctx;
  try {
    const c = typeof document !== 'undefined' && typeof document.fonts !== 'undefined' ? document.createElement('canvas') : null;
    ctx = c ? c.getContext('2d') : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

/** The font's own kerning for a pair, in 1/1000 em. Falls back to the model when the font is not measurable. */
export function fontKern(font: FontSpec, left: string, right: string): number {
  const key = `${font.id}|${left}${right}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const c = context();
  if (!c || !('fontKerning' in c) || !fontReady(font)) return modelKern(left, right);
  c.font = fontShorthand(font, 1000);
  c.fontKerning = 'normal';
  const kerned = c.measureText(left + right).width;
  c.fontKerning = 'none';
  const plain = c.measureText(left).width + c.measureText(right).width;
  const value = Math.round(kerned - plain);
  cache.set(key, value);
  return value;
}

/** Heights that a type designer draws guide lines at, in em above the baseline, plus where the baseline sits. */
export interface FontLines {
  ascender: number;
  xHeight: number;
  capHeight: number;
  /** Distance of the baseline from the top of a line box that is 1 em tall, in em. */
  baseline: number;
}

/** Used when the font cannot be measured. Close to most grotesks and serifs. */
export const FALLBACK_LINES: FontLines = { ascender: 0.76, xHeight: 0.52, capHeight: 0.71, baseline: 0.8 };

const linesCache = new Map<string, FontLines>();

/**
 * The ascender, x-height and baseline of a font, read from a canvas. The ascender is the top of "d",
 * the x-height is the top of "x", the cap height is the top of "H". With line-height 1, the baseline
 * sits half-way through the line's leading: (1 + ascent - descent) / 2.
 */
export function fontLines(font: FontSpec): FontLines {
  const hit = linesCache.get(font.id);
  if (hit) return hit;
  const c = context();
  if (!c || !fontReady(font)) return FALLBACK_LINES;
  c.font = fontShorthand(font, 1000);
  const up = (s: string) => c.measureText(s).actualBoundingBoxAscent / 1000;
  const ok = (v: number, fallback: number) => (Number.isFinite(v) && v > 0.1 && v < 1.2 ? v : fallback);
  const probe = c.measureText('x');
  const a = probe.fontBoundingBoxAscent / 1000;
  const d = probe.fontBoundingBoxDescent / 1000;
  const lines: FontLines = {
    ascender: ok(up('d'), FALLBACK_LINES.ascender),
    xHeight: ok(up('x'), FALLBACK_LINES.xHeight),
    capHeight: ok(up('H'), FALLBACK_LINES.capHeight),
    baseline: Number.isFinite(a) && Number.isFinite(d) && a > 0 ? (1 + a - d) / 2 : FALLBACK_LINES.baseline,
  };
  linesCache.set(font.id, lines);
  return lines;
}

/** Width of a text in em with kerning off. Falls back to an estimate when the font is not measurable. */
export function textWidthEm(font: FontSpec, text: string): number {
  const c = context();
  if (!c || !fontReady(font)) return text.length * 0.64;
  c.font = fontShorthand(font, 1000);
  if ('fontKerning' in c) c.fontKerning = 'none';
  let w = 0;
  for (const ch of text) w += c.measureText(ch).width;
  return w / 1000;
}

export type PairKind = 'overhang' | 'diagonal' | 'round' | 'stem' | 'mixed' | 'open-foot';

/** A rough shape class for a pair, so a note can say why it needs the space it needs. */
export function pairKind(left: string, right: string): PairKind {
  if (OPEN_FOOT.has(left)) return 'open-foot';
  if (OVERHANG.has(left)) return 'overhang';
  const a = (SIDES[left] ?? [2, 2])[1];
  const b = (SIDES[right] ?? [2, 2])[0];
  if (a <= 0.5 && b <= 0.5) return 'diagonal';
  if (a >= 3 && b >= 3) return 'stem';
  if (a <= 2 && b <= 2 && a >= 1.5 && b >= 1.5) return 'round';
  return 'mixed';
}

export const KIND_REASON: Record<PairKind, string> = {
  overhang: 'The arm at the top leaves an open space. The next letter moves in under it.',
  'open-foot': 'The L is open at the top. The next letter moves in over its foot.',
  diagonal: 'Two slanted sides leave a triangle of white space. Diagonals sit closer.',
  round: 'Round sides touch at one point only. Rounds sit a little closer than stems.',
  stem: 'Two straight stems give the most even space. They need no kerning in most fonts.',
  mixed: 'One side is open. The pair needs a little less space than two stems.',
};
